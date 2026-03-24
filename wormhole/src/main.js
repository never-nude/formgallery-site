import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createBackgroundSystem } from "./background-system.js";
import { createPostProcessing } from "./post-processing.js";
import { createTransitCues } from "./transit-cues.js";
import { createTunnelSystem } from "./tunnel-system.js";
import { createUI } from "./ui-controller.js";

const canvas = document.querySelector("#scene");
const searchParams = new URLSearchParams(window.location.search);
const initialViewMode = searchParams.get("mode") === "inspect" ? "inspect" : "transit";

const settings = {
  bloom: 0.84,
  distortion: 0.56,
  glow: 1.04,
  speed: 1.08,
  throat: 7.8,
};

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.04;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02050b);
scene.fog = new THREE.FogExp2(0x030812, 0.0068);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.05, 900);
camera.position.set(0, 0, 82);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.maxDistance = 160;
controls.minDistance = 18;
controls.enabled = false;

const tunnelSystem = createTunnelSystem(scene, settings);
const backgroundSystem = createBackgroundSystem(scene);
backgroundSystem.setAnchors(tunnelSystem.getAnchors());

const transitCues = createTransitCues(scene, tunnelSystem, settings);
const postProcessing = createPostProcessing(renderer, scene, camera);

const ui = createUI({
  initialMode: initialViewMode,
  initialValues: settings,
  onControlsChange: handleControlsChange,
  onModeChange: setViewMode,
  onReplay: () => replayTransit({ preserveMode: true }),
  onPulse: triggerPulse,
});

const deepFog = new THREE.Color(0x030812);
const arrivalFog = new THREE.Color(0x08111d);
const currentLook = new THREE.Vector3();
const cameraRig = new THREE.Object3D();
const clock = new THREE.Clock();

let elapsedTime = 0;

const runtimeState = {
  bloomGain: settings.bloom,
  curveT: 0,
  entryFlash: 0,
  exitLock: 0,
  exitReveal: 0,
  inspectSettled: false,
  lastCameraPosition: new THREE.Vector3(),
  lensWarp: 0,
  phase: "approach",
  phaseIntensity: 0,
  phaseProgress: 0,
  progress: 0,
  pulse: 0,
  shear: 0,
  stability: 100,
  transitTime: 0,
  velocityIndex: 0,
  viewMode: initialViewMode,
};

function clamp01(value) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function easeInOutCubic(value) {
  if (value < 0.5) {
    return 4 * value * value * value;
  }

  return 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function smoothstep(edge0, edge1, value) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function damp(factor, delta) {
  return 1 - Math.exp(-factor * delta);
}

function getInspectView(time) {
  const start = tunnelSystem.getAnchors().start;
  const focus = start.point.clone().addScaledVector(start.tangent, 5.2);
  const position = start.point
    .clone()
    .addScaledVector(start.tangent, -52)
    .addScaledVector(start.normal, settings.throat * 0.74)
    .addScaledVector(start.binormal, settings.throat * 0.28)
    .addScaledVector(start.normal, Math.sin(time * 0.24) * 0.34);

  return {
    fov: 48,
    lookTarget: focus,
    position,
  };
}

function computeTransitTarget(time) {
  const progress = clamp01(runtimeState.progress);
  const { start, end } = tunnelSystem.getAnchors();
  const portalAim = start.point.clone().addScaledVector(start.tangent, 5.8);
  const outsideStart = start.point
    .clone()
    .addScaledVector(start.tangent, -56)
    .addScaledVector(start.normal, settings.throat * 0.72)
    .addScaledVector(start.binormal, settings.throat * 0.22);
  const threshold = start.point
    .clone()
    .addScaledVector(start.tangent, -16)
    .addScaledVector(start.normal, settings.throat * 0.28)
    .addScaledVector(start.binormal, settings.throat * 0.08);
  const outsideExit = end.point
    .clone()
    .addScaledVector(end.tangent, 34)
    .addScaledVector(end.normal, settings.throat * 0.1);
  const exitFocus = outsideExit.clone().addScaledVector(end.tangent, 150);

  let phase = "approach";
  let phaseProgress = 0;
  let phaseIntensity = 0.2;
  let curveT = 0.01;
  let entryFlash = 0;
  let exitReveal = 0;
  let fov = 52.5;
  let lensWarp = 0.012;
  let roll = 0;
  let position = outsideStart.clone();
  let lookTarget = portalAim.clone();

  if (progress < 0.16) {
    const inspectView = getInspectView(time);
    phase = "approach";
    phaseProgress = easeInOutCubic(progress / 0.16);
    phaseIntensity = 0.22 + phaseProgress * 0.34;
    curveT = 0.015;
    entryFlash = phaseProgress * 0.12;
    position = inspectView.position.clone().lerp(threshold, phaseProgress * 0.82);
    lookTarget = inspectView.lookTarget
      .clone()
      .lerp(
        portalAim
          .clone()
          .addScaledVector(start.normal, settings.throat * -0.08)
          .lerp(tunnelSystem.sampleFrame(0.045).point, phaseProgress * 0.34),
        0.58 + phaseProgress * 0.2,
      );
    lensWarp = 0.018 + phaseProgress * 0.026;
    fov = THREE.MathUtils.lerp(inspectView.fov, 53.7, phaseProgress) + runtimeState.pulse * 1.2;
    roll = Math.sin(time * 0.34) * 0.003;
  } else if (progress < 0.3) {
    phase = "entry";
    phaseProgress = easeInOutCubic((progress - 0.16) / 0.14);
    curveT = 0.008 + phaseProgress * 0.18;
    const frame = tunnelSystem.sampleFrame(curveT);
    const ahead = tunnelSystem.sampleFrame(Math.min(0.995, curveT + 0.058));
    phaseIntensity = 0.48 + Math.sin(phaseProgress * Math.PI) * 0.18;
    entryFlash = Math.sin(phaseProgress * Math.PI);
    position = frame.point
      .clone()
      .addScaledVector(frame.tangent, -14 + phaseProgress * 12.6)
      .addScaledVector(frame.normal, frame.radius * (0.22 - phaseProgress * 0.16));
    position.addScaledVector(
      frame.binormal,
      Math.sin(time * 0.78 + curveT * 30) * 0.08 * settings.distortion,
    );
    lookTarget = portalAim.clone().lerp(ahead.point, 0.72);
    lensWarp = 0.028 + entryFlash * 0.032 + runtimeState.pulse * 0.02;
    fov = 52.8 + entryFlash * 3.6 + runtimeState.pulse * 1.6;
    roll = entryFlash * 0.007;
  } else if (progress < 0.84) {
    phase = "transit";
    phaseProgress = easeInOutCubic((progress - 0.3) / 0.54);
    curveT = 0.19 + phaseProgress * 0.69;
    const frame = tunnelSystem.sampleFrame(curveT);
    const ahead = tunnelSystem.sampleFrame(Math.min(0.995, curveT + 0.038 + settings.speed * 0.018));
    const sway = Math.sin(time * 0.72 + curveT * 28);
    const drift = Math.cos(time * 0.64 + curveT * 21);
    phaseIntensity = 0.6 + 0.12 * Math.sin(phaseProgress * Math.PI);
    entryFlash = 0.08 * (1 - phaseProgress);
    exitReveal = smoothstep(0.54, 1.0, phaseProgress);
    position = frame.point
      .clone()
      .addScaledVector(frame.normal, sway * 0.14 * settings.distortion)
      .addScaledVector(frame.binormal, drift * 0.1 * settings.distortion);
    lookTarget = ahead.point
      .clone()
      .addScaledVector(ahead.binormal, Math.sin(time * 0.48 + curveT * 20) * 0.16)
      .addScaledVector(ahead.normal, Math.cos(time * 0.52 + curveT * 18) * 0.14);
    lensWarp = 0.036 + settings.distortion * 0.016 + exitReveal * 0.018 + runtimeState.pulse * 0.024;
    fov = 58.8 + Math.sin(phaseProgress * Math.PI) * 1.8 + runtimeState.pulse * 2.2;
    roll = Math.sin(time * 0.82 + curveT * 32) * 0.012 + settings.distortion * 0.005;
  } else {
    phase = "exit";
    phaseProgress = easeInOutCubic((progress - 0.84) / 0.16);
    curveT = 0.88 + phaseProgress * 0.12;
    const frame = tunnelSystem.sampleFrame(Math.min(1, curveT));
    const blend = smoothstep(0.14, 1.0, phaseProgress);
    phaseIntensity = 0.4 * (1 - phaseProgress) + 0.16;
    exitReveal = 0.46 + phaseProgress * 0.54;
    position = frame.point
      .clone()
      .lerp(outsideExit, blend)
      .addScaledVector(end.normal, (1 - phaseProgress) * 0.2);
    lookTarget = frame.point.clone().lerp(exitFocus, 0.48 + phaseProgress * 0.52);
    lensWarp = 0.016 + (1 - phaseProgress) * 0.028 + runtimeState.pulse * 0.014;
    fov = 57.2 - phaseProgress * 1.8 + runtimeState.pulse * 1.2;
    roll = (1 - phaseProgress) * 0.006;
  }

  return {
    curveT,
    entryFlash,
    exitReveal,
    fov,
    lensWarp,
    lookTarget,
    phase,
    phaseIntensity,
    phaseProgress,
    position,
    roll,
  };
}

function applyTransitCamera(target, delta) {
  const smoothing = damp(5.6, delta);
  camera.position.lerp(target.position, smoothing);
  currentLook.lerp(target.lookTarget, smoothing);

  cameraRig.position.copy(camera.position);
  cameraRig.lookAt(currentLook);
  cameraRig.rotateZ(target.roll);
  camera.quaternion.slerp(cameraRig.quaternion, smoothing);

  camera.fov = THREE.MathUtils.lerp(camera.fov, target.fov, damp(4.8, delta));
  camera.updateProjectionMatrix();
}

function applyInspectCamera(time, delta) {
  const inspectView = getInspectView(time);
  controls.enabled = runtimeState.inspectSettled;

  if (!runtimeState.inspectSettled) {
    const smoothing = damp(3.8, delta);
    camera.position.lerp(inspectView.position, smoothing);
    currentLook.lerp(inspectView.lookTarget, smoothing);
    controls.target.lerp(inspectView.lookTarget, smoothing);

    cameraRig.position.copy(camera.position);
    cameraRig.lookAt(currentLook);
    camera.quaternion.slerp(cameraRig.quaternion, smoothing);

    runtimeState.inspectSettled =
      camera.position.distanceTo(inspectView.position) < 0.75 &&
      currentLook.distanceTo(inspectView.lookTarget) < 0.75;
  } else {
    controls.update();
    currentLook.copy(controls.target);
  }

  camera.fov = THREE.MathUtils.lerp(camera.fov, inspectView.fov, damp(4.2, delta));
  camera.updateProjectionMatrix();
}

function replayTransit({ preserveMode = false } = {}) {
  if (!preserveMode) {
    runtimeState.viewMode = "transit";
  }

  runtimeState.progress = 0;
  runtimeState.transitTime = 0;
  runtimeState.phase = "approach";
  runtimeState.phaseProgress = 0;
  runtimeState.inspectSettled = false;
  controls.enabled = false;
}

function setViewMode(mode) {
  if (mode === runtimeState.viewMode) {
    return;
  }

  if (mode === "inspect") {
    runtimeState.viewMode = "inspect";
    runtimeState.inspectSettled = false;
    controls.enabled = false;
    return;
  }

  replayTransit();
}

function handleControlsChange(values) {
  Object.assign(settings, values);
  tunnelSystem.setSettings(settings);
}

function triggerPulse() {
  runtimeState.pulse = Math.min(1.45, runtimeState.pulse + 0.9);
}

function updateSceneMood(runtime, delta) {
  const fogBlend = runtime.exitReveal * 0.46;
  scene.fog.color.lerpColors(deepFog, arrivalFog, fogBlend);
  scene.fog.density = runtime.viewMode === "inspect" ? 0.0048 : 0.0068 - runtime.exitReveal * 0.0018;
  renderer.toneMappingExposure = THREE.MathUtils.lerp(
    renderer.toneMappingExposure,
    runtime.viewMode === "inspect"
      ? 0.9
      : 0.88 + runtime.phaseIntensity * 0.09 + runtime.entryFlash * 0.09 + runtime.exitReveal * 0.05,
    damp(3.2, delta),
  );
}

function buildRuntime(target, delta) {
  const velocity = camera.position.distanceTo(runtimeState.lastCameraPosition) / Math.max(delta, 0.0001);
  runtimeState.lastCameraPosition.copy(camera.position);

  const visualPhaseIntensity =
    runtimeState.viewMode === "inspect" ? target.phaseIntensity * 0.22 + 0.04 : target.phaseIntensity;
  const visualEntryFlash = runtimeState.viewMode === "inspect" ? 0 : target.entryFlash;
  const visualExitReveal =
    runtimeState.viewMode === "inspect" ? Math.max(0.08, target.exitReveal * 0.35) : target.exitReveal;
  const visualLensWarp = runtimeState.viewMode === "inspect" ? 0.003 : target.lensWarp;

  runtimeState.phase = target.phase;
  runtimeState.phaseProgress = target.phaseProgress;
  runtimeState.phaseIntensity = visualPhaseIntensity;
  runtimeState.entryFlash = visualEntryFlash;
  runtimeState.exitReveal = visualExitReveal;
  runtimeState.curveT = target.curveT;
  runtimeState.lensWarp = visualLensWarp;
  runtimeState.velocityIndex = THREE.MathUtils.clamp(velocity / 12, 0, 4.5);
  runtimeState.shear =
    settings.distortion * (1.22 + visualPhaseIntensity * 0.92) +
    visualLensWarp * 20 +
    runtimeState.pulse * 0.55;
  runtimeState.stability = THREE.MathUtils.clamp(
    97 -
      settings.distortion * 17 -
      visualPhaseIntensity * 11 -
      runtimeState.pulse * 11 +
      settings.glow * 6 +
      visualExitReveal * 9,
    34,
    99,
  );
  runtimeState.exitLock = smoothstep(0.62, 1.0, runtimeState.progress) * 100;

  return {
    bloom: settings.bloom,
    curveT: runtimeState.curveT,
    entryFlash: runtimeState.entryFlash,
    exitLock: runtimeState.exitLock,
    exitReveal: runtimeState.exitReveal,
    lensWarp: runtimeState.lensWarp,
    phase: runtimeState.phase,
    phaseIntensity: runtimeState.phaseIntensity,
    phaseProgress: runtimeState.phaseProgress,
    progress: runtimeState.progress,
    pulse: runtimeState.pulse,
    shear: runtimeState.shear,
    stability: runtimeState.stability,
    transitTime: runtimeState.transitTime,
    velocityIndex: runtimeState.velocityIndex,
    viewMode: runtimeState.viewMode,
  };
}

function advanceTransit(delta) {
  if (runtimeState.viewMode !== "transit") {
    return;
  }

  if (runtimeState.progress < 1) {
    runtimeState.progress = Math.min(1, runtimeState.progress + delta * (0.038 + settings.speed * 0.032));
    runtimeState.transitTime += delta;
  }
}

function syncInitialCamera() {
  if (runtimeState.viewMode === "inspect") {
    const inspectView = getInspectView(0);
    camera.position.copy(inspectView.position);
    currentLook.copy(inspectView.lookTarget);
    camera.lookAt(currentLook);
    camera.fov = inspectView.fov;
    controls.target.copy(inspectView.lookTarget);
    controls.enabled = true;
    runtimeState.inspectSettled = true;
  } else {
    const transitView = computeTransitTarget(0);
    camera.position.copy(transitView.position);
    currentLook.copy(transitView.lookTarget);
    camera.lookAt(currentLook);
    camera.fov = transitView.fov;
    controls.enabled = false;
  }

  camera.updateProjectionMatrix();
  runtimeState.lastCameraPosition.copy(camera.position);
}

window.addEventListener("keydown", (event) => {
  if (event.repeat) {
    return;
  }

  if (event.code === "KeyI") {
    setViewMode("inspect");
  }

  if (event.code === "KeyT") {
    setViewMode("transit");
  }

  if (event.code === "KeyR") {
    replayTransit();
  }

  if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
    triggerPulse();
  }
});

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = window.devicePixelRatio;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(pixelRatio, 2));
  renderer.setSize(width, height);
  postProcessing.resize(width, height, pixelRatio);
});

syncInitialCamera();
postProcessing.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio);

function animate() {
  const delta = Math.min(clock.getDelta(), 0.1);
  elapsedTime += delta;
  runtimeState.pulse = THREE.MathUtils.lerp(runtimeState.pulse, 0, 0.065);

  advanceTransit(delta);

  const target = computeTransitTarget(elapsedTime);

  if (runtimeState.viewMode === "inspect") {
    applyInspectCamera(elapsedTime, delta);
  } else {
    controls.enabled = false;
    runtimeState.inspectSettled = false;
    applyTransitCamera(target, delta);
  }

  const runtime = buildRuntime(target, delta);

  tunnelSystem.update(elapsedTime, delta, runtime);
  backgroundSystem.update(elapsedTime, runtime);
  transitCues.update(elapsedTime, delta, runtime);
  updateSceneMood(runtime, delta);

  runtimeState.bloomGain = postProcessing.update(runtime);
  ui.update({
    ...runtime,
    bloomGain: runtimeState.bloomGain,
  });

  postProcessing.render();
  requestAnimationFrame(animate);
}

animate();

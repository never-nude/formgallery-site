import * as THREE from "three";

const UNIT_Z = new THREE.Vector3(0, 0, 1);

function createGlowTexture(innerColor, outerColor) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(
    size * 0.5,
    size * 0.5,
    0,
    size * 0.5,
    size * 0.5,
    size * 0.5,
  );
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(0.28, "rgba(255, 255, 255, 0.14)");
  gradient.addColorStop(0.68, outerColor);
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

function orientToTangent(object, point, tangent) {
  object.position.copy(point);
  object.quaternion.setFromUnitVectors(UNIT_Z, tangent.clone().normalize());
}

function createApertureGroup() {
  const group = new THREE.Group();

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.14, 12, 144),
    new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      color: 0x92f2ff,
      depthWrite: false,
      opacity: 0.28,
      transparent: true,
    }),
  );
  group.add(ring);

  const innerBand = new THREE.Mesh(
    new THREE.RingGeometry(0.84, 0.96, 96),
    new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      color: 0xffa761,
      depthWrite: false,
      opacity: 0.16,
      side: THREE.DoubleSide,
      transparent: true,
    }),
  );
  group.add(innerBand);

  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      blending: THREE.AdditiveBlending,
      color: 0xaaf6ff,
      depthWrite: false,
      map: createGlowTexture("rgba(146, 242, 255, 0.64)", "rgba(146, 242, 255, 0.08)"),
      opacity: 0.16,
      transparent: true,
    }),
  );
  group.add(halo);

  const coreGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      blending: THREE.AdditiveBlending,
      color: 0xcffcff,
      depthWrite: false,
      map: createGlowTexture("rgba(255, 255, 255, 0.38)", "rgba(146, 242, 255, 0.02)"),
      opacity: 0.0,
      transparent: true,
    }),
  );
  group.add(coreGlow);

  return { coreGlow, group, halo, innerBand, ring };
}

function createExitBeacon() {
  const group = new THREE.Group();

  const beacon = new THREE.Sprite(
    new THREE.SpriteMaterial({
      blending: THREE.AdditiveBlending,
      color: 0xffd28b,
      depthWrite: false,
      map: createGlowTexture("rgba(255, 226, 170, 0.82)", "rgba(140, 238, 255, 0.08)"),
      opacity: 0.12,
      transparent: true,
    }),
  );
  group.add(beacon);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.08, 10, 128),
    new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      color: 0xffc46c,
      depthWrite: false,
      opacity: 0.14,
      transparent: true,
    }),
  );
  group.add(ring);

  return { beacon, group, ring };
}

function createMovingRingMarkers(group) {
  const markers = [];

  for (let index = 0; index < 28; index += 1) {
    const marker = new THREE.Mesh(
      new THREE.TorusGeometry(1, index % 3 === 0 ? 0.08 : 0.052, 12, 120),
      new THREE.MeshBasicMaterial({
        blending: THREE.AdditiveBlending,
        color: index % 4 === 0 ? 0xffa258 : 0x8ef2ff,
        depthWrite: false,
        opacity: 0.2,
        transparent: true,
      }),
    );
    marker.userData.offset = 0.08 + (index / 28) * 0.92;
    marker.userData.speed = 0.26 + (index % 5) * 0.045;
    marker.userData.scale = 0.76 + (index % 4) * 0.07;
    marker.userData.spin = 0.15 + (index % 6) * 0.06;

    group.add(marker);
    markers.push(marker);
  }

  return markers;
}

function createStreakLayer(group, config) {
  const descriptors = Array.from({ length: config.count }, () => ({
    angle: Math.random() * Math.PI * 2,
    offset: Math.random() * config.span - config.behindAllowance,
    radial: Math.random(),
    sway: Math.random() * Math.PI * 2,
  }));

  const positions = new Float32Array(config.count * 2 * 3);
  const colors = new Float32Array(config.count * 2 * 3);
  const geometry = new THREE.BufferGeometry();
  const color = new THREE.Color();

  descriptors.forEach((descriptor, index) => {
    const hue = index % 3 === 0 ? 0.08 : 0.53;
    const lightness = index % 3 === 0 ? 0.72 : 0.82;
    color.setHSL(hue, 0.82, lightness);
    color.toArray(colors, index * 6);
    color.toArray(colors, index * 6 + 3);
  });

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const lines = new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: config.opacity,
      transparent: true,
      vertexColors: true,
    }),
  );
  group.add(lines);

  return {
    config,
    descriptors,
    lines,
    positions,
  };
}

function updateStreakLayer(layer, tunnelSystem, runtime, delta, settings) {
  const { config, descriptors, lines, positions } = layer;
  const movement = delta * (config.speed + settings.speed * config.speedGain + runtime.phaseIntensity * 0.12);
  const baseCurveT = runtime.curveT;

  descriptors.forEach((descriptor, index) => {
    if (runtime.viewMode === "transit") {
      descriptor.offset -= movement;
      if (descriptor.offset < -config.behindAllowance) {
        descriptor.offset += config.span + config.behindAllowance;
      }
    }

    const sampleT = THREE.MathUtils.clamp(baseCurveT + descriptor.offset, 0.02, 0.985);
    const frame = tunnelSystem.sampleFrame(sampleT);
    const radialVector = frame.normal
      .clone()
      .multiplyScalar(Math.cos(descriptor.angle))
      .add(frame.binormal.clone().multiplyScalar(Math.sin(descriptor.angle)));
    const sway = Math.sin(runtime.time * config.drift + descriptor.sway + descriptor.offset * 18.0) * config.sway;
    const radialDistance = frame.radius * (config.radialMin + descriptor.radial * config.radialRange);
    const center = frame.point
      .clone()
      .addScaledVector(radialVector, radialDistance)
      .addScaledVector(frame.binormal, sway);

    const head = center.clone().addScaledVector(frame.tangent, config.head);
    const tail = center
      .clone()
      .addScaledVector(frame.tangent, -config.length * (1 + runtime.velocityIndex * 0.08));

    const writeIndex = index * 6;
    positions[writeIndex] = tail.x;
    positions[writeIndex + 1] = tail.y;
    positions[writeIndex + 2] = tail.z;
    positions[writeIndex + 3] = head.x;
    positions[writeIndex + 4] = head.y;
    positions[writeIndex + 5] = head.z;
  });

  lines.geometry.attributes.position.needsUpdate = true;
  lines.material.opacity =
    runtime.viewMode === "inspect"
      ? config.opacity * 0.1
      : config.opacity * (0.78 + runtime.phaseIntensity * 0.42 + runtime.entryFlash * 0.3);
}

export function createTransitCues(scene, tunnelSystem, settings) {
  const group = new THREE.Group();
  scene.add(group);

  const aperture = createApertureGroup();
  const exitBeacon = createExitBeacon();
  const movingRings = createMovingRingMarkers(group);

  group.add(aperture.group);
  group.add(exitBeacon.group);

  const streakLayers = [
    createStreakLayer(group, {
      behindAllowance: 0.08,
      count: 90,
      drift: 0.9,
      head: 0.16,
      length: 2.3,
      opacity: 0.3,
      radialMin: 0.12,
      radialRange: 0.36,
      span: 0.34,
      speed: 0.42,
      speedGain: 0.18,
      sway: 0.12,
    }),
    createStreakLayer(group, {
      behindAllowance: 0.12,
      count: 72,
      drift: 0.56,
      head: 0.2,
      length: 4.2,
      opacity: 0.18,
      radialMin: 0.18,
      radialRange: 0.5,
      span: 0.56,
      speed: 0.26,
      speedGain: 0.12,
      sway: 0.18,
    }),
    createStreakLayer(group, {
      behindAllowance: 0.16,
      count: 54,
      drift: 0.34,
      head: 0.28,
      length: 6.4,
      opacity: 0.11,
      radialMin: 0.22,
      radialRange: 0.6,
      span: 0.82,
      speed: 0.14,
      speedGain: 0.08,
      sway: 0.24,
    }),
  ];

  function update(time, delta, runtime) {
    const startFrame = tunnelSystem.sampleFrame(0.012);
    const endFrame = tunnelSystem.sampleFrame(0.988);
    const inspectMode = runtime.viewMode === "inspect";
    const aperturePosition = startFrame.point.clone().addScaledVector(startFrame.tangent, -0.8);
    const apertureScale = startFrame.radius * 1.15;
    const entryFocus =
      runtime.phase === "approach"
        ? 0.5 + runtime.phaseProgress * 0.5
        : runtime.phase === "entry"
          ? 1
          : 0.24 * (1 - runtime.progress);

    orientToTangent(aperture.group, aperturePosition, startFrame.tangent);
    aperture.group.scale.setScalar(apertureScale);
    aperture.ring.rotation.z += delta * 0.42;
    aperture.innerBand.rotation.z -= delta * 0.18;
    aperture.ring.material.opacity = inspectMode ? 0.08 : 0.16 + entryFocus * 0.18 + runtime.entryFlash * 0.24;
    aperture.innerBand.material.opacity = inspectMode ? 0.05 : 0.08 + entryFocus * 0.14 + runtime.entryFlash * 0.18;
    aperture.halo.scale.setScalar(apertureScale * 3.8);
    aperture.halo.material.opacity =
      inspectMode ? 0.06 : 0.08 + entryFocus * 0.12 + runtime.entryFlash * 0.32;
    aperture.coreGlow.scale.setScalar(apertureScale * 1.7);
    aperture.coreGlow.material.opacity = inspectMode
      ? 0.06
      : runtime.phase === "approach"
        ? 0.08 + entryFocus * 0.22
        : 0.03 + (1 - runtime.phaseProgress) * 0.08;

    const exitPosition = endFrame.point.clone().addScaledVector(endFrame.tangent, 12);
    orientToTangent(exitBeacon.group, exitPosition, endFrame.tangent);
    exitBeacon.group.scale.setScalar(endFrame.radius * (0.42 + runtime.exitReveal * 1.24));
    exitBeacon.ring.rotation.z += delta * 0.25;
    exitBeacon.beacon.material.opacity =
      inspectMode ? 0.1 : 0.06 + runtime.exitReveal * 0.9 + runtime.entryFlash * 0.1;
    exitBeacon.ring.material.opacity = inspectMode ? 0.08 : 0.08 + runtime.exitReveal * 0.34;

    movingRings.forEach((ring) => {
      if (runtime.viewMode === "transit") {
        ring.userData.offset -=
          delta * (ring.userData.speed + settings.speed * 0.08 + runtime.phaseIntensity * 0.03);
        if (ring.userData.offset < -0.08) {
          ring.userData.offset += 1.02;
        }
      }

      const sampleT = THREE.MathUtils.clamp(runtime.curveT + ring.userData.offset, 0.03, 0.985);
      const frame = tunnelSystem.sampleFrame(sampleT);
      orientToTangent(ring, frame.point, frame.tangent);
      ring.scale.setScalar(frame.radius * ring.userData.scale);
      ring.rotation.z += delta * ring.userData.spin;

      const proximity = THREE.MathUtils.clamp(1 - Math.abs(ring.userData.offset - 0.08) / 0.32, 0, 1);
      ring.material.opacity =
        inspectMode
          ? 0.04 + proximity * 0.03
          : 0.05 + proximity * 0.26 + runtime.phaseIntensity * 0.08 + runtime.entryFlash * 0.14;
    });

    streakLayers.forEach((layer) => {
      updateStreakLayer(layer, tunnelSystem, { ...runtime, time }, delta, settings);
    });
  }

  return {
    update,
  };
}

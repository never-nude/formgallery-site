import * as THREE from "three";

const UNIT_Z = new THREE.Vector3(0, 0, 1);

function createParticleTexture() {
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.5);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.95)");
  gradient.addColorStop(0.68, "rgba(255, 255, 255, 0.2)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

function createHaloTexture(innerColor, outerColor) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.5);
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(0.28, "rgba(255, 255, 255, 0.12)");
  gradient.addColorStop(0.6, outerColor);
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

function createStarField({ count, hueRange, lightnessRange, radius, size, texture }) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry();
  const color = new THREE.Color();

  for (let index = 0; index < count; index += 1) {
    const r = radius * Math.pow(Math.random(), 0.58);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const sinPhi = Math.sin(phi);

    positions[index * 3] = r * sinPhi * Math.cos(theta);
    positions[index * 3 + 1] = r * Math.cos(phi);
    positions[index * 3 + 2] = r * sinPhi * Math.sin(theta);

    color.setHSL(
      hueRange[0] + Math.random() * (hueRange[1] - hueRange[0]),
      0.72,
      lightnessRange[0] + Math.random() * (lightnessRange[1] - lightnessRange[0]),
    );
    color.toArray(colors, index * 3);
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      alphaMap: texture,
      alphaTest: 0.02,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: texture,
      opacity: 0.9,
      size,
      sizeAttenuation: true,
      transparent: true,
      vertexColors: true,
    }),
  );
}

function orientGroup(group, point, tangent) {
  group.position.copy(point);
  group.quaternion.setFromUnitVectors(UNIT_Z, tangent.clone().normalize());
}

export function createBackgroundSystem(scene) {
  const particleTexture = createParticleTexture();
  const entryHaloTexture = createHaloTexture("rgba(130, 235, 255, 0.55)", "rgba(130, 235, 255, 0.14)");
  const exitHaloTexture = createHaloTexture("rgba(255, 205, 120, 0.62)", "rgba(130, 235, 255, 0.16)");

  const root = new THREE.Group();
  scene.add(root);

  const entryGroup = new THREE.Group();
  const exitGroup = new THREE.Group();
  root.add(entryGroup);
  root.add(exitGroup);

  const entryStars = createStarField({
    count: 3200,
    hueRange: [0.5, 0.6],
    lightnessRange: [0.68, 0.92],
    radius: 210,
    size: 1.05,
    texture: particleTexture,
  });
  entryGroup.add(entryStars);

  const exitStars = createStarField({
    count: 3600,
    hueRange: [0.08, 0.18],
    lightnessRange: [0.66, 0.95],
    radius: 240,
    size: 1.22,
    texture: particleTexture,
  });
  exitGroup.add(exitStars);

  const entryHalo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      blending: THREE.AdditiveBlending,
      color: 0xa5f6ff,
      depthWrite: false,
      map: entryHaloTexture,
      opacity: 0.22,
      transparent: true,
    }),
  );
  entryHalo.scale.setScalar(120);
  entryGroup.add(entryHalo);

  const exitHalo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      blending: THREE.AdditiveBlending,
      color: 0xffd08c,
      depthWrite: false,
      map: exitHaloTexture,
      opacity: 0.12,
      transparent: true,
    }),
  );
  exitHalo.scale.setScalar(170);
  exitGroup.add(exitHalo);

  const destinationArc = new THREE.Mesh(
    new THREE.TorusGeometry(84, 0.65, 8, 180),
    new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      color: 0xb4ebff,
      depthWrite: false,
      opacity: 0.08,
      transparent: true,
    }),
  );
  destinationArc.rotation.x = Math.PI * 0.5;
  exitGroup.add(destinationArc);

  function setAnchors({ start, end }) {
    orientGroup(entryGroup, start.point.clone().addScaledVector(start.tangent, -156), start.tangent);
    orientGroup(exitGroup, end.point.clone().addScaledVector(end.tangent, 210), end.tangent);
  }

  function update(time, runtime) {
    entryStars.rotation.z += 0.0009 + runtime.velocityIndex * 0.0001;
    exitStars.rotation.z -= 0.0012;
    exitStars.rotation.y += 0.0008;

    const approachStretch = runtime.phase === "approach" ? 1 + runtime.phaseProgress * 0.48 : 1.04;
    entryGroup.scale.set(1, 1, approachStretch);
    entryStars.material.opacity =
      runtime.viewMode === "inspect" ? 0.14 : 0.32 + runtime.phaseIntensity * 0.1;
    entryStars.material.size = 0.9 + runtime.velocityIndex * 0.08;
    entryHalo.material.opacity =
      runtime.viewMode === "inspect" ? 0.02 : 0.03 + runtime.phaseIntensity * 0.04;

    const exitOpacity = 0.08 + runtime.exitReveal * 0.94;
    exitStars.material.opacity = exitOpacity;
    exitStars.material.size = 1.1 + runtime.exitReveal * 0.26;
    exitGroup.scale.setScalar(0.9 + runtime.exitReveal * 0.16);
    exitGroup.scale.z = 1.0 + runtime.exitReveal * 0.3;
    exitHalo.material.opacity =
      runtime.viewMode === "inspect"
        ? 0.03
        : 0.05 + runtime.exitReveal * 0.28 + runtime.pulse * 0.04;
    exitHalo.scale.setScalar(170 + runtime.exitReveal * 36);

    destinationArc.rotation.z += 0.0015 + time * 0.0;
    destinationArc.rotation.y = 0.4 + Math.sin(time * 0.14) * 0.12;
    destinationArc.material.opacity = 0.05 + runtime.exitReveal * 0.16;
  }

  return {
    setAnchors,
    update,
  };
}

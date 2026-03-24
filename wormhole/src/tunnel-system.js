import * as THREE from "three";

const PATH_SEGMENTS = 320;
const RADIAL_SEGMENTS = 72;
const TAU = Math.PI * 2;
const UNIT_Z = new THREE.Vector3(0, 0, 1);

function createParticleTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.5);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.32, "rgba(255, 255, 255, 0.94)");
  gradient.addColorStop(0.65, "rgba(255, 255, 255, 0.24)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

function getRadiusAt(t, throatRadius) {
  const edgeDistance = Math.min(t, 1 - t);
  const flare = Math.exp(-Math.pow(edgeDistance * 6.1, 2.0));
  const interiorLift = 0.08 * Math.sin(t * Math.PI * 2.0 + 0.4);
  return throatRadius * (1 + interiorLift) + throatRadius * flare * 1.45;
}

function createTunnelMaterial(uniforms) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;
      varying float vPath;

      uniform float uDistortion;
      uniform float uPulse;
      uniform float uTime;
      uniform float uTransit;

      void main() {
        vUv = uv;
        vPath = uv.y;

        float angle = uv.x * 6.28318530718;
        float waveA = sin(angle * 9.0 - uTime * 2.3 + vPath * 24.0);
        float waveB = cos(angle * 15.0 + uTime * 1.8 - vPath * 31.0);
        float sheath = sin(vPath * 110.0 - uTime * 12.0 + angle * 2.5);
        float swell = sin(vPath * 3.14159265359);

        vec3 transformed = position;
        vec3 radial = normalize(normal);

        transformed += radial * (waveA * 0.72 + waveB * 0.4) * uDistortion * (0.48 + swell * 0.42);
        transformed += radial * sheath * 0.12 * (0.4 + uDistortion * 0.6);
        transformed += radial * uPulse * (0.28 + 0.24 * sin(vPath * 22.0 - uTime * 6.5));
        transformed += radial * sin(vPath * 70.0 - uTime * (6.0 + uTransit * 8.0)) * 0.06;

        vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
        vWorldPosition = worldPosition.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);

        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;
      varying float vPath;

      uniform float uDistortion;
      uniform float uExitReveal;
      uniform float uGlow;
      uniform float uPulse;
      uniform float uSpeed;
      uniform float uTime;
      uniform float uTransit;

      void main() {
        float angle = vUv.x * 6.28318530718;
        float flow = sin(angle * 11.0 - uTime * 2.2 + vPath * 28.0) * 0.5 + 0.5;
        float caustics = sin(vPath * 160.0 - uTime * (7.0 + uSpeed * 6.0) + angle * 2.6) * 0.5 + 0.5;
        float ringBands = smoothstep(0.42, 0.98, sin(vPath * 74.0 - uTime * (10.0 + uSpeed * 9.0) + angle * 6.0) * 0.5 + 0.5);
        float rush = fract(vPath * 18.0 - uTime * (0.34 + uSpeed * 1.18));
        rush = smoothstep(0.08, 0.48, rush) * (1.0 - smoothstep(0.62, 0.98, rush));

        float entryGlow = exp(-pow(vPath / 0.18, 2.0));
        float exitGlow = exp(-pow((1.0 - vPath) / 0.16, 2.0));
        float throat = sin(vPath * 3.14159265359);

        vec3 deep = vec3(0.01, 0.03, 0.08);
        vec3 mid = vec3(0.04, 0.16, 0.29);
        vec3 cool = vec3(0.36, 0.94, 1.0);
        vec3 warm = vec3(1.0, 0.56, 0.16);

        vec3 color = mix(deep, mid, 0.28 + throat * 0.56);
        color = mix(color, cool, flow * 0.44 + caustics * 0.18 + entryGlow * 0.12);
        color = mix(color, warm, ringBands * 0.16 + rush * 0.18 + exitGlow * (0.18 + uExitReveal * 0.4));

        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        float fresnel = pow(1.0 - abs(dot(normalize(vWorldNormal), viewDirection)), 2.6);

        color += cool * fresnel * (0.48 + uGlow * 0.34);
        color += warm * rush * (0.1 + uPulse * 0.22);
        color += mix(cool, warm, caustics) * (0.12 + throat * 0.28 + uTransit * 0.16);
        color += warm * exitGlow * uExitReveal * 0.34;
        color += cool * entryGlow * (0.18 + uDistortion * 0.14);

        vec3 finalColor = min(color * uGlow * 0.34, vec3(0.82));
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });
}

function createPortalMaterial(coolHex, warmHex) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uCool: { value: new THREE.Color(coolHex) },
      uGlow: { value: 1.0 },
      uPulse: { value: 0.0 },
      uReveal: { value: 0.0 },
      uTime: { value: 0.0 },
      uWarm: { value: new THREE.Color(warmHex) },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;

      uniform vec3 uCool;
      uniform float uGlow;
      uniform float uPulse;
      uniform float uReveal;
      uniform float uTime;
      uniform vec3 uWarm;

      void main() {
        vec2 centered = vUv - 0.5;
        float dist = length(centered) * 2.0;
        float ring = smoothstep(1.08, 0.58, dist);
        float core = smoothstep(0.76, 0.0, dist);
        float aperture = smoothstep(0.12, 0.22, dist);
        float swirl = sin(atan(centered.y, centered.x) * 11.0 - uTime * 4.8 + dist * 16.0) * 0.5 + 0.5;

        vec3 color = mix(uCool, uWarm, swirl * 0.45 + core * 0.28 + uReveal * 0.22);
        float alpha = ring * 0.42 + core * 0.16 + uPulse * 0.18 + uReveal * 0.12;
        alpha *= aperture;
        color *= 0.52 + uGlow * 0.3 + uPulse * 0.2 + uReveal * 0.14;

        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
}

function buildPathCache(curve, throatRadius) {
  const points = curve.getPoints(PATH_SEGMENTS);
  const normals = [];
  const tangents = [];
  const binormals = [];
  const radii = [];
  const frames = curve.computeFrenetFrames(PATH_SEGMENTS, false);

  for (let index = 0; index <= PATH_SEGMENTS; index += 1) {
    const t = index / PATH_SEGMENTS;
    tangents.push(curve.getTangent(t).normalize());
    normals.push(frames.normals[index].clone().normalize());
    binormals.push(frames.binormals[index].clone().normalize());
    radii.push(getRadiusAt(t, throatRadius));
  }

  return {
    binormals,
    normals,
    points,
    radii,
    tangents,
  };
}

function createTubeGeometry(pathCache) {
  const vertexCount = (PATH_SEGMENTS + 1) * (RADIAL_SEGMENTS + 1);
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = [];

  let vertexOffset = 0;
  let uvOffset = 0;

  for (let segment = 0; segment <= PATH_SEGMENTS; segment += 1) {
    const t = segment / PATH_SEGMENTS;
    const point = pathCache.points[segment];
    const normal = pathCache.normals[segment];
    const binormal = pathCache.binormals[segment];
    const radius = pathCache.radii[segment];

    for (let radialSegment = 0; radialSegment <= RADIAL_SEGMENTS; radialSegment += 1) {
      const u = radialSegment / RADIAL_SEGMENTS;
      const angle = u * TAU;
      const radial =
        normal.clone().multiplyScalar(Math.cos(angle)).add(binormal.clone().multiplyScalar(Math.sin(angle)));
      const position = point.clone().addScaledVector(radial, radius);

      positions[vertexOffset] = position.x;
      positions[vertexOffset + 1] = position.y;
      positions[vertexOffset + 2] = position.z;

      normals[vertexOffset] = radial.x;
      normals[vertexOffset + 1] = radial.y;
      normals[vertexOffset + 2] = radial.z;

      uvs[uvOffset] = u;
      uvs[uvOffset + 1] = t;

      vertexOffset += 3;
      uvOffset += 2;
    }
  }

  for (let segment = 0; segment < PATH_SEGMENTS; segment += 1) {
    for (let radialSegment = 0; radialSegment < RADIAL_SEGMENTS; radialSegment += 1) {
      const a = segment * (RADIAL_SEGMENTS + 1) + radialSegment;
      const b = (segment + 1) * (RADIAL_SEGMENTS + 1) + radialSegment;
      const c = b + 1;
      const d = a + 1;

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();

  return geometry;
}

function samplePath(pathCache, t) {
  const clamped = THREE.MathUtils.clamp(t, 0, 1);
  const scaled = clamped * PATH_SEGMENTS;
  const index = Math.min(PATH_SEGMENTS - 1, Math.floor(scaled));
  const alpha = scaled - index;

  return {
    binormal: pathCache.binormals[index].clone().lerp(pathCache.binormals[index + 1], alpha).normalize(),
    normal: pathCache.normals[index].clone().lerp(pathCache.normals[index + 1], alpha).normalize(),
    point: pathCache.points[index].clone().lerp(pathCache.points[index + 1], alpha),
    radius: THREE.MathUtils.lerp(pathCache.radii[index], pathCache.radii[index + 1], alpha),
    tangent: pathCache.tangents[index].clone().lerp(pathCache.tangents[index + 1], alpha).normalize(),
    t: clamped,
  };
}

function orientToTangent(object, point, tangent) {
  object.position.copy(point);
  object.quaternion.setFromUnitVectors(UNIT_Z, tangent.clone().normalize());
}

export function createTunnelSystem(scene, initialSettings) {
  const settings = { ...initialSettings };
  const particleTexture = createParticleTexture();
  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, 0, 52),
      new THREE.Vector3(6.2, -3.4, 18),
      new THREE.Vector3(-4.6, 2.9, -28),
      new THREE.Vector3(2.4, -1.4, -82),
      new THREE.Vector3(0, 0.8, -140),
    ],
    false,
    "catmullrom",
    0.48,
  );

  const group = new THREE.Group();
  scene.add(group);

  const tunnelUniforms = {
    uDistortion: { value: settings.distortion },
    uExitReveal: { value: 0.0 },
    uGlow: { value: settings.glow },
    uPulse: { value: 0.0 },
    uSpeed: { value: settings.speed },
    uTime: { value: 0.0 },
    uTransit: { value: 0.0 },
  };

  const tunnelMaterial = createTunnelMaterial(tunnelUniforms);
  const tunnelMesh = new THREE.Mesh(new THREE.BufferGeometry(), tunnelMaterial);
  group.add(tunnelMesh);

  const entryPortalMaterial = createPortalMaterial(0x7fefff, 0xff9a3d);
  const exitPortalMaterial = createPortalMaterial(0xcffbff, 0xffc46b);
  const entryPortal = new THREE.Mesh(new THREE.CircleGeometry(1, 96), entryPortalMaterial);
  const exitPortal = new THREE.Mesh(new THREE.CircleGeometry(1, 96), exitPortalMaterial);
  group.add(entryPortal);
  group.add(exitPortal);

  const entranceHaloRings = [];
  for (let index = 0; index < 3; index += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.035 + index * 0.02, 10, 96),
      new THREE.MeshBasicMaterial({
        blending: THREE.AdditiveBlending,
        color: index === 1 ? 0xffa357 : 0x82ebff,
        depthWrite: false,
        opacity: 0.2 - index * 0.035,
        transparent: true,
      }),
    );
    entranceHaloRings.push(ring);
    group.add(ring);
  }

  const staticFieldRings = [];
  for (let index = 0; index < 26; index += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.045, 10, 72),
      new THREE.MeshBasicMaterial({
        blending: THREE.AdditiveBlending,
        color: index % 3 === 0 ? 0xffab5f : 0x8bf3ff,
        depthWrite: false,
        opacity: 0.12,
        transparent: true,
      }),
    );
    ring.userData.baseT = 0.06 + (index / 25) * 0.88;
    staticFieldRings.push(ring);
    group.add(ring);
  }

  const pulseRings = [];
  for (let index = 0; index < 10; index += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.07, 10, 88),
      new THREE.MeshBasicMaterial({
        blending: THREE.AdditiveBlending,
        color: index % 2 === 0 ? 0xff9a3d : 0x8bf3ff,
        depthWrite: false,
        opacity: 0.18,
        transparent: true,
      }),
    );
    ring.userData.offset = index / 10;
    pulseRings.push(ring);
    group.add(ring);
  }

  const interiorDustDescriptors = Array.from({ length: 2600 }, () => ({
    angle: Math.random() * TAU,
    drift: (Math.random() - 0.5) * 4.2,
    hueOffset: Math.random(),
    radial: 0.18 + Math.random() * 0.58,
    t: Math.random(),
  }));

  const interiorDustGeometry = new THREE.BufferGeometry();
  const interiorDust = new THREE.Points(
    interiorDustGeometry,
    new THREE.PointsMaterial({
      alphaMap: particleTexture,
      alphaTest: 0.02,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: particleTexture,
      opacity: 0.22,
      size: 0.62,
      sizeAttenuation: true,
      transparent: true,
      vertexColors: true,
    }),
  );
  group.add(interiorDust);

  let pathCache = buildPathCache(curve, settings.throat);

  function rebuildTunnelGeometry() {
    const nextGeometry = createTubeGeometry(pathCache);
    tunnelMesh.geometry.dispose();
    tunnelMesh.geometry = nextGeometry;
  }

  function rebuildInteriorDust() {
    const positions = new Float32Array(interiorDustDescriptors.length * 3);
    const colors = new Float32Array(interiorDustDescriptors.length * 3);
    const color = new THREE.Color();

    interiorDustDescriptors.forEach((descriptor, index) => {
      const frame = samplePath(pathCache, descriptor.t);
      const radialVector =
        frame.normal.clone().multiplyScalar(Math.cos(descriptor.angle)).add(
          frame.binormal.clone().multiplyScalar(Math.sin(descriptor.angle)),
        );
      const position = frame.point
        .clone()
        .addScaledVector(radialVector, frame.radius * descriptor.radial)
        .addScaledVector(frame.tangent, descriptor.drift);

      positions[index * 3] = position.x;
      positions[index * 3 + 1] = position.y;
      positions[index * 3 + 2] = position.z;

      color.setHSL(0.52 + descriptor.hueOffset * 0.1, 0.7, 0.72 + descriptor.hueOffset * 0.16);
      color.toArray(colors, index * 3);
    });

    interiorDust.geometry.dispose();
    interiorDust.geometry = new THREE.BufferGeometry();
    interiorDust.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    interiorDust.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }

  function updatePortalPlacement() {
    const startFrame = samplePath(pathCache, 0);
    const endFrame = samplePath(pathCache, 1);
    const startScale = startFrame.radius * 1.18;
    const endScale = endFrame.radius * 1.22;

    orientToTangent(entryPortal, startFrame.point, startFrame.tangent);
    orientToTangent(exitPortal, endFrame.point, endFrame.tangent);
    entryPortal.scale.setScalar(startScale);
    exitPortal.scale.setScalar(endScale);

    entranceHaloRings.forEach((ring, index) => {
      const haloPosition = startFrame.point.clone().addScaledVector(startFrame.tangent, -1.4 - index * 1.2);
      orientToTangent(ring, haloPosition, startFrame.tangent);
      ring.scale.setScalar(startScale * (1.12 + index * 0.18));
    });
  }

  function rebuildRadiusDependentAssets() {
    pathCache = buildPathCache(curve, settings.throat);
    rebuildTunnelGeometry();
    rebuildInteriorDust();
    updatePortalPlacement();
  }

  function setSettings(nextSettings) {
    const throatChanged = nextSettings.throat !== settings.throat;
    Object.assign(settings, nextSettings);
    tunnelUniforms.uDistortion.value = settings.distortion;
    tunnelUniforms.uGlow.value = settings.glow;
    tunnelUniforms.uSpeed.value = settings.speed;

    if (throatChanged) {
      rebuildRadiusDependentAssets();
    }
  }

  function update(time, delta, runtime) {
    tunnelUniforms.uTime.value = time;
    tunnelUniforms.uDistortion.value = settings.distortion + runtime.phaseIntensity * 0.08;
    tunnelUniforms.uGlow.value = settings.glow;
    tunnelUniforms.uPulse.value = runtime.pulse * 0.42;
    tunnelUniforms.uSpeed.value = settings.speed;
    tunnelUniforms.uTransit.value = runtime.progress;
    tunnelUniforms.uExitReveal.value = runtime.exitReveal;

    entryPortalMaterial.uniforms.uTime.value = time;
    entryPortalMaterial.uniforms.uGlow.value = settings.glow;
    entryPortalMaterial.uniforms.uPulse.value = runtime.pulse;
    entryPortalMaterial.uniforms.uReveal.value =
      runtime.phase === "approach"
        ? 0.34 + runtime.phaseProgress * 0.66
        : 0.2 + runtime.entryFlash * 0.22;

    exitPortalMaterial.uniforms.uTime.value = time;
    exitPortalMaterial.uniforms.uGlow.value = settings.glow + runtime.exitReveal * 0.1;
    exitPortalMaterial.uniforms.uPulse.value = runtime.pulse;
    exitPortalMaterial.uniforms.uReveal.value = runtime.exitReveal;

    const startFrame = samplePath(pathCache, 0);

    entranceHaloRings.forEach((ring, index) => {
      ring.rotation.z += delta * (0.12 + index * 0.04);
      ring.material.opacity =
        (0.16 - index * 0.024) * (1 - runtime.progress * 0.48) +
        runtime.entryFlash * 0.1 +
        runtime.pulse * 0.06;
      const position = startFrame.point.clone().addScaledVector(startFrame.tangent, -1.4 - index * 1.2);
      orientToTangent(ring, position, startFrame.tangent);
    });

    staticFieldRings.forEach((ring, index) => {
      const frame = samplePath(pathCache, ring.userData.baseT);
      orientToTangent(ring, frame.point, frame.tangent);
      ring.scale.setScalar(frame.radius * (0.68 + 0.06 * Math.sin(time * 0.9 + index * 0.5)));
      ring.material.opacity =
        0.05 + runtime.phaseIntensity * 0.08 + 0.1 * Math.sin(time * 1.4 + ring.userData.baseT * 22.0) ** 2;
    });

    pulseRings.forEach((ring, index) => {
      const t = (ring.userData.offset + time * (0.035 + settings.speed * 0.03) + runtime.progress * 0.08) % 1;
      const frame = samplePath(pathCache, t);
      orientToTangent(ring, frame.point, frame.tangent);
      ring.scale.setScalar(frame.radius * (0.78 + runtime.pulse * 0.18));
      ring.material.opacity = 0.06 + runtime.phaseIntensity * 0.16 + runtime.pulse * 0.22;
      ring.rotation.z += delta * 0.3;
    });

    interiorDust.material.opacity = 0.12 + runtime.phaseIntensity * 0.12 + runtime.pulse * 0.08;
    interiorDust.material.size = 0.48 + runtime.velocityIndex * 0.05;
  }

  function getAnchors() {
    return {
      end: samplePath(pathCache, 1),
      start: samplePath(pathCache, 0),
    };
  }

  rebuildRadiusDependentAssets();

  return {
    getAnchors,
    group,
    sampleFrame(t) {
      return samplePath(pathCache, t);
    },
    setSettings,
    settings,
    update,
  };
}

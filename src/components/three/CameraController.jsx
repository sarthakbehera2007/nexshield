import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

/**
 * Responsive camera manager interpolating between ScrollTrigger targets
 * and subtle pointer parallax with high stability.
 */
export function CameraController({
  scrollState,
  parallaxState,
  isMobile = false,
}) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 0, 5.8));
  const targetPos = useRef(new THREE.Vector3(0, 0, 5.8));

  useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    const lerpFactor = 1.0 - Math.pow(0.001, clampedDelta); // frame-rate independent smooth lerp

    // Base target from scroll choreography
    let baseZ = scrollState?.cameraPosZ ?? 5.5;
    let baseY = scrollState?.cameraPosY ?? 0;
    let baseX = 0;

    // Pull back camera slightly on mobile to keep entire shield and orbits visible
    if (isMobile) {
      baseZ += 1.8;
    }

    // Pointer parallax contribution (restrained)
    const px = parallaxState?.x ?? 0;
    const py = parallaxState?.y ?? 0;
    const parallaxOffsetX = px * 0.35;
    const parallaxOffsetY = py * 0.25;

    targetPos.current.set(baseX + parallaxOffsetX, baseY + parallaxOffsetY, baseZ);

    // Lerp camera
    camera.position.lerp(targetPos.current, lerpFactor * 2.5);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

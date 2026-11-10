import React, { useRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * CALIBRATED ENTERPRISE CYBER LIGHTING
 * - Soft Cyan Key Light (upper left)
 * - Blue Rear Rim Light (lower rear right)
 * - Neutral Metallic Fill Light (subtle cool reflection)
 * - Dynamic Specular Tracking Point
 */
export const CyberLighting = React.forwardRef(function CyberLighting(
  { isThreatDetected = false, isDefending = false },
  ref
) {
  const keyLightRef = useRef();
  const rimLightRef = useRef();
  const fillLightRef = useRef();
  const specularSpotRef = useRef();

  useImperativeHandle(ref, () => ({
    setIntensity: (keyVal, rimVal) => {
      if (keyLightRef.current) keyLightRef.current.intensity = keyVal;
      if (rimLightRef.current) rimLightRef.current.intensity = rimVal;
    },
    pulseCyan: () => {
      if (keyLightRef.current) {
        gsap.to(keyLightRef.current, {
          intensity: 4.2,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out',
        });
      }
    },
    updatePointerParallax: (px, py) => {
      if (specularSpotRef.current) {
        specularSpotRef.current.position.x = -2.2 + px * 1.8;
        specularSpotRef.current.position.y = 3.2 + py * 1.8;
      }
    },
  }));

  const keyColor = isThreatDetected ? '#FF3B69' : isDefending ? '#19E68C' : '#00DFFF';
  const rimColor = isThreatDetected ? '#FF8C00' : '#008CFF';

  return (
    <group>
      {/* Deep Atmospheric Baseline Ambient */}
      <ambientLight color="#05080E" intensity={0.65} />

      {/* Large Soft Cyan Key Light */}
      <directionalLight
        ref={keyLightRef}
        position={[-4.5, 4.8, 3.8]}
        color={keyColor}
        intensity={2.8}
        castShadow
        shadow-bias={-0.0004}
      />

      {/* Blue Rear Grazing Rim Light */}
      <directionalLight
        ref={rimLightRef}
        position={[3.8, -2.4, -3.2]}
        color={rimColor}
        intensity={2.4}
      />

      {/* Neutral Metallic Fill Light */}
      <directionalLight
        ref={fillLightRef}
        position={[1.2, -3.2, 2.8]}
        color="#1E2A38"
        intensity={0.8}
      />

      {/* Subtle Specular Highlights reacting to cursor */}
      <pointLight
        ref={specularSpotRef}
        position={[-2.2, 3.2, 3.4]}
        color="#E0F7FF"
        intensity={1.2}
        distance={8.5}
        decay={2}
      />

      {/* Emerald Accent Trace */}
      <pointLight
        position={[2.8, 2.2, 1.2]}
        color="#19E68C"
        intensity={0.35}
        distance={5.5}
        decay={2}
      />
    </group>
  );
});

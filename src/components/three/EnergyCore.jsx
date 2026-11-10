import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * CENTRAL ENERGY CORE
 * Sophisticated circular mechanism nestled at the center intersection:
 * - Rotating concentric metallic titanium rings with mechanical cuts
 * - Central faceted octahedral quantum crystal
 * - Thin cyan orbital lines
 * - Dynamic pulsing light
 * - Small connected circuit nodes
 */
export const EnergyCore = React.forwardRef(function EnergyCore(
  { isThreatDetected = false, isDefending = false },
  ref
) {
  const crystalRef = useRef();
  const outerRingRef = useRef();
  const midRingRef = useRef();
  const innerRingRef = useRef();
  const lightRef = useRef();

  // Nodes positioned along the outer containment ring
  const ringNodes = useMemo(() => {
    const arr = [];
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      arr.push([Math.cos(angle) * 0.28, Math.sin(angle) * 0.28, 0]);
    }
    return arr;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Octahedral crystal tumbling and pulse breathing
    if (crystalRef.current) {
      crystalRef.current.rotation.y = time * 0.75;
      crystalRef.current.rotation.x = Math.sin(time * 0.4) * 0.2;
      const pulse = 1.0 + Math.sin(time * 3.2) * 0.1;
      crystalRef.current.scale.set(pulse, pulse, pulse);
    }

    // Concentric counter-rotating titanium rings
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = -time * 0.4;
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.z = time * 0.65;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x = Math.sin(time * 0.5) * 0.25;
      innerRingRef.current.rotation.z = -time * 0.9;
    }

    if (lightRef.current) {
      const baseIntensity = isDefending ? 2.6 : isThreatDetected ? 2.0 : 1.4;
      lightRef.current.intensity = baseIntensity + Math.sin(time * 4) * 0.35;
    }
  });

  const coreColor = isThreatDetected ? '#FF3B69' : isDefending ? '#19E68C' : '#00DFFF';

  return (
    <group ref={ref} position={[0, 0, 0.22]}>
      {/* Central Octahedral Crystal */}
      <mesh ref={crystalRef} castShadow>
        <octahedronGeometry args={[0.11, 0]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          emissive={coreColor}
          emissiveIntensity={2.8}
          roughness={0.08}
          metalness={0.15}
          transmission={0.65}
          thickness={0.4}
        />
      </mesh>

      {/* Ring 1: Outer Concentric Metallic Ring with Sockets */}
      <group ref={outerRingRef}>
        <mesh>
          <torusGeometry args={[0.28, 0.012, 16, 48]} />
          <meshStandardMaterial
            color="#141E28"
            metalness={0.92}
            roughness={0.2}
            emissive={coreColor}
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Connected Micro Circuit Nodes on Ring */}
        {ringNodes.map((pos, idx) => (
          <mesh key={idx} position={pos}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color={idx % 2 === 0 ? '#19E68C' : coreColor} />
          </mesh>
        ))}
      </group>

      {/* Ring 2: Mid Thin Cyan Orbital Line */}
      <group ref={midRingRef}>
        <mesh>
          <ringGeometry args={[0.21, 0.216, 36]} />
          <meshBasicMaterial color={coreColor} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Ring 3: Inner Mechanical Gimbal */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[0.16, 0.009, 12, 36]} />
        <meshStandardMaterial color="#0A1016" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Controlled Dynamic Cyan Point Light */}
      <pointLight
        ref={lightRef}
        color={coreColor}
        distance={4.8}
        decay={2}
        intensity={1.4}
      />
    </group>
  );
});

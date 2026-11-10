import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * LAYER 3 — EMBEDDED N-SHAPED CIRCUIT CORE
 * Recognizable geometric "N" integrated into the shield's recessed graphite substrate.
 * Features illuminated metallic conduit tubes, micro soldered telemetry nodes,
 * and animated sequential light pulses travelling along branches.
 */
export const NCircuit = React.forwardRef(function NCircuit(
  { glowIntensity = 1.0, isThreatDetected = false, isInvestigationActive = false },
  ref
) {
  const pulseGroupRef = useRef();
  const leftPulseRef = useRef();
  const diagPulseRef = useRef();
  const rightPulseRef = useRef();

  // Primary geometric "N" paths
  const { leftBranchGeo, diagBranchGeo, rightBranchGeo, feederPathsGeo, nodePoints } = useMemo(() => {
    // Left vertical conduit: from lower body up to upper shoulder
    const leftCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-0.52, -0.85, 0.12),
        new THREE.Vector3(-0.52, -0.1, 0.12),
        new THREE.Vector3(-0.52, 0.65, 0.12),
        new THREE.Vector3(-0.52, 0.98, 0.12),
      ],
      false,
      'centripetal',
      0.1
    );

    // Diagonal traverse: connects top left to bottom right with cyber angular feel
    const diagCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-0.52, 0.88, 0.13),
        new THREE.Vector3(-0.25, 0.42, 0.13),
        new THREE.Vector3(0.0, 0.05, 0.13),
        new THREE.Vector3(0.25, -0.38, 0.13),
        new THREE.Vector3(0.52, -0.78, 0.13),
      ],
      false,
      'chordal',
      0.05
    );

    // Right vertical conduit: from lower right up to upper right shoulder
    const rightCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0.52, -0.85, 0.12),
        new THREE.Vector3(0.52, -0.1, 0.12),
        new THREE.Vector3(0.52, 0.65, 0.12),
        new THREE.Vector3(0.52, 0.98, 0.12),
      ],
      false,
      'centripetal',
      0.1
    );

    // Feeder circuit lines branching across inner chassis
    const feederPoints = [
      // Left shoulder feeder
      new THREE.Vector3(-0.52, 0.7, 0.11),
      new THREE.Vector3(-0.95, 0.85, 0.11),
      new THREE.Vector3(-1.05, 1.05, 0.11),

      // Right shoulder feeder
      new THREE.Vector3(0.52, 0.7, 0.11),
      new THREE.Vector3(0.95, 0.85, 0.11),
      new THREE.Vector3(1.05, 1.05, 0.11),

      // Mid lateral sensors
      new THREE.Vector3(-0.52, -0.1, 0.11),
      new THREE.Vector3(-0.85, -0.1, 0.11),
      new THREE.Vector3(-1.0, -0.3, 0.11),

      new THREE.Vector3(0.52, -0.1, 0.11),
      new THREE.Vector3(0.85, -0.1, 0.11),
      new THREE.Vector3(1.0, -0.3, 0.11),

      // Apex feeder
      new THREE.Vector3(0, -0.85, 0.11),
      new THREE.Vector3(0, -1.35, 0.11),
      new THREE.Vector3(0, -1.75, 0.11),
    ];

    const tubeRadius = 0.024;
    const segments = 32;

    const leftGeo = new THREE.TubeGeometry(leftCurve, segments, tubeRadius, 8, false);
    const diagGeo = new THREE.TubeGeometry(diagCurve, segments, tubeRadius * 1.1, 8, false);
    const rightGeo = new THREE.TubeGeometry(rightCurve, segments, tubeRadius, 8, false);

    // Build line segments for feeders
    const feederGeo = new THREE.BufferGeometry().setFromPoints(feederPoints);

    // Key terminal connection nodes
    const nodes = [
      [-0.52, 0.98, 0.13],
      [-0.52, 0.7, 0.13],
      [-0.52, -0.1, 0.13],
      [-0.52, -0.85, 0.13],
      [0.52, 0.98, 0.13],
      [0.52, 0.7, 0.13],
      [0.52, -0.1, 0.13],
      [0.52, -0.85, 0.13],
      [-1.05, 1.05, 0.12],
      [1.05, 1.05, 0.12],
      [-1.0, -0.3, 0.12],
      [1.0, -0.3, 0.12],
      [0, -1.75, 0.12],
      [0, 0.05, 0.13], // center intersection
    ];

    return {
      leftBranchGeo: leftGeo,
      diagBranchGeo: diagGeo,
      rightBranchGeo: rightGeo,
      feederPathsGeo: feederGeo,
      nodePoints: nodes,
      leftCurve,
      diagCurve,
      rightCurve,
    };
  }, []);

  // Frame animation for light pulses traversing the N paths
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Pulse 1: travels up left branch
    if (leftPulseRef.current) {
      const t1 = (time * 0.7) % 1;
      leftPulseRef.current.position.y = -0.85 + t1 * 1.83;
    }

    // Pulse 2: travels diagonally down
    if (diagPulseRef.current) {
      const t2 = (time * 0.85 + 0.3) % 1;
      diagPulseRef.current.position.x = -0.52 + t2 * 1.04;
      diagPulseRef.current.position.y = 0.88 - t2 * 1.66;
    }

    // Pulse 3: travels up right branch
    if (rightPulseRef.current) {
      const t3 = (time * 0.75 + 0.6) % 1;
      rightPulseRef.current.position.y = -0.85 + t3 * 1.83;
    }
  });

  const emissiveColor = isThreatDetected ? '#ff3366' : isInvestigationActive ? '#ffaa00' : '#00f0ff';
  const emissiveMult = isThreatDetected ? 2.2 : glowIntensity;

  return (
    <group ref={ref}>
      {/* Structural Metallic Grooves / Channels */}
      <mesh geometry={leftBranchGeo}>
        <meshPhysicalMaterial
          color="#001824"
          emissive={emissiveColor}
          emissiveIntensity={0.8 * emissiveMult}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      <mesh geometry={diagBranchGeo}>
        <meshPhysicalMaterial
          color="#002233"
          emissive={emissiveColor}
          emissiveIntensity={1.0 * emissiveMult}
          roughness={0.15}
          metalness={0.95}
        />
      </mesh>

      <mesh geometry={rightBranchGeo}>
        <meshPhysicalMaterial
          color="#001824"
          emissive={emissiveColor}
          emissiveIntensity={0.8 * emissiveMult}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Auxiliary Circuit Traces */}
      <lineSegments geometry={feederPathsGeo}>
        <lineBasicMaterial
          color={emissiveColor}
          transparent
          opacity={0.7}
          linewidth={1.5}
        />
      </lineSegments>

      {/* Traveling Circuit Light Pulses */}
      <group ref={pulseGroupRef}>
        <mesh ref={leftPulseRef} position={[-0.52, 0, 0.13]}>
          <sphereGeometry args={[0.038, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        <mesh ref={diagPulseRef} position={[0, 0, 0.14]}>
          <sphereGeometry args={[0.042, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        <mesh ref={rightPulseRef} position={[0.52, 0, 0.13]}>
          <sphereGeometry args={[0.038, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Connection soldered micro nodes */}
      {nodePoints.map((pos, idx) => (
        <group key={idx} position={pos}>
          {/* Outer Ring */}
          <mesh>
            <cylinderGeometry args={[0.035, 0.035, 0.03, 12]} />
            <meshStandardMaterial
              color="#0f1923"
              metalness={0.95}
              roughness={0.2}
            />
          </mesh>
          {/* Inner Emissive Core */}
          <mesh position={[0, 0, 0.018]}>
            <circleGeometry args={[0.02, 12]} />
            <meshBasicMaterial
              color={idx % 4 === 0 ? '#00ff88' : emissiveColor}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
});

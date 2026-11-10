import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * ORBITAL NETWORK SYSTEM
 * Three concentric telemetry orbits surrounding the NEXSHIELD Core:
 * - Orbit 1: Thin metallic ring with telemetry nodes & slow rotation
 * - Orbit 2: Segmented/broken illuminated cyan arc ring spinning counter
 * - Orbit 3: Inclined dotted trajectory path with data packet markers
 */
export const OrbitalRings = React.forwardRef(function OrbitalRings(
  { isThreatDetected = false, isDefending = false },
  ref
) {
  const orbit1Ref = useRef();
  const orbit2Ref = useRef();
  const orbit3Ref = useRef();
  const packetRef = useRef();

  // Orbit 1: Continuous metallic circular ring with 4 satellite micro-nodes
  const orbit1Nodes = useMemo(() => {
    const nodes = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI * 2) / 4;
      nodes.push([Math.cos(angle) * 2.7, Math.sin(angle) * 2.7, 0]);
    }
    return nodes;
  }, []);

  // Orbit 2: Broken circular segments (segmented arcs)
  const orbit2Segments = useMemo(() => {
    const segments = [];
    const radius = 3.25;
    const numArcs = 6;
    for (let i = 0; i < numArcs; i++) {
      const startAngle = (i * Math.PI * 2) / numArcs + 0.15;
      const arcLength = ((Math.PI * 2) / numArcs) * 0.65;
      const curve = new THREE.EllipseCurve(
        0, 0,
        radius, radius,
        startAngle, startAngle + arcLength,
        false, 0
      );
      const points = curve.getPoints(24);
      const v3 = points.map((p) => new THREE.Vector3(p.x, p.y, 0));
      segments.push(new THREE.BufferGeometry().setFromPoints(v3));
    }
    return segments;
  }, []);

  // Orbit 3: Dotted orbital trajectory
  const orbit3Points = useMemo(() => {
    const points = [];
    const radius = 3.8;
    const count = 90;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const speedMult = isDefending ? 1.6 : isThreatDetected ? 1.4 : 1.0;

    if (orbit1Ref.current) {
      orbit1Ref.current.rotation.z = time * 0.12 * speedMult;
    }

    if (orbit2Ref.current) {
      orbit2Ref.current.rotation.z = -time * 0.18 * speedMult;
    }

    if (orbit3Ref.current) {
      orbit3Ref.current.rotation.z = time * 0.08 * speedMult;
    }

    if (packetRef.current) {
      const t = time * 1.5;
      packetRef.current.position.x = Math.cos(t) * 3.8;
      packetRef.current.position.y = Math.sin(t) * 3.8;
    }
  });

  const cyanColor = isThreatDetected ? '#ff3366' : '#00f0ff';

  return (
    <group ref={ref}>
      {/* ORBIT 1 — Metallic Ring with Nodes (Inclination: 65° X, 15° Y) */}
      <group ref={orbit1Ref} rotation={[1.1, 0.25, 0]}>
        <mesh>
          <torusGeometry args={[2.7, 0.012, 16, 96]} />
          <meshStandardMaterial
            color="#223040"
            metalness={0.9}
            roughness={0.25}
          />
        </mesh>
        {orbit1Nodes.map((pos, idx) => (
          <group key={idx} position={pos}>
            <mesh>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshBasicMaterial color={cyanColor} />
            </mesh>
            <mesh>
              <ringGeometry args={[0.06, 0.08, 16]} />
              <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ORBIT 2 — Broken Segmented Glowing Arcs (Inclination: -45° X, -20° Y) */}
      <group ref={orbit2Ref} rotation={[-0.75, -0.35, 0.2]}>
        {orbit2Segments.map((geo, idx) => (
          <line key={idx} geometry={geo}>
            <lineBasicMaterial
              color={idx % 2 === 0 ? cyanColor : '#00a8ff'}
              transparent
              opacity={0.85}
              linewidth={2}
            />
          </line>
        ))}
      </group>

      {/* ORBIT 3 — Fine Dotted Path with Moving Data Packet (Inclination: 20° X, 40° Y) */}
      <group ref={orbit3Ref} rotation={[0.35, 0.7, -0.2]}>
        <points geometry={orbit3Points}>
          <pointsMaterial
            color="#00f0ff"
            size={0.035}
            transparent
            opacity={0.4}
            sizeAttenuation
          />
        </points>

        <mesh ref={packetRef}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
});

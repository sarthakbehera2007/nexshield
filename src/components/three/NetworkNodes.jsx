import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * NETWORK NODE SYSTEM
 * 60 deterministic 3D cybersecurity infrastructure nodes distributed
 * across foreground, midground, and background telemetry zones.
 * Nodes pulse with activity, isolate malicious threat entities,
 * and converge into defensive barriers during security events.
 */
export const NetworkNodes = React.forwardRef(function NetworkNodes(
  { isThreatDetected = false, isInvestigationActive = false, isDefending = false },
  ref
) {
  const count = 56;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const meshRef = useRef();

  // Deterministic node generation
  const nodeData = useMemo(() => {
    const nodes = [];
    // Pseudo-random deterministic generator
    let seed = 42;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let i = 0; i < count; i++) {
      // Stratify into depths: foreground, midground, background
      const depthTier = i % 3;
      let z = 0;
      let spread = 3.5;

      if (depthTier === 0) {
        // Foreground
        z = rng() * 1.5 + 0.5;
        spread = 4.2;
      } else if (depthTier === 1) {
        // Midground (aligned with shield plane)
        z = (rng() - 0.5) * 1.2;
        spread = 4.8;
      } else {
        // Background
        z = -rng() * 2.2 - 0.5;
        spread = 5.5;
      }

      // Avoid placing nodes right in center of shield (keep radius > 1.8)
      const angle = rng() * Math.PI * 2;
      const radius = 2.0 + rng() * spread;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * (radius * 0.75);

      // Node classification: normal (cyan/blue), active (green), or threat vulnerability (red in alert)
      const isVulnerable = i === 12 || i === 23 || i === 37;
      const isGreen = i % 7 === 0;

      nodes.push({
        origPos: new THREE.Vector3(x, y, z),
        pos: new THREE.Vector3(x, y, z),
        baseScale: rng() * 0.04 + 0.035,
        speed: rng() * 1.5 + 0.5,
        phase: rng() * Math.PI * 2,
        isVulnerable,
        isGreen,
      });
    }

    return nodes;
  }, [count]);

  const colors = useMemo(() => {
    const cyan = new THREE.Color(0x00f0ff);
    const blue = new THREE.Color(0x0066ff);
    const green = new THREE.Color(0x00ff88);
    const red = new THREE.Color(0xff2255);
    const gold = new THREE.Color(0xffaa00);

    const colorArray = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const node = nodeData[i];
      let c = cyan;

      if (isThreatDetected && node.isVulnerable) {
        c = red;
      } else if (isInvestigationActive && node.isVulnerable) {
        c = gold;
      } else if (isDefending && node.isVulnerable) {
        c = cyan; // neutralised
      } else if (node.isGreen) {
        c = green;
      } else if (i % 2 === 0) {
        c = blue;
      }

      c.toArray(colorArray, i * 3);
    }

    return colorArray;
  }, [nodeData, isThreatDetected, isInvestigationActive, isDefending, count]);

  // Update instance matrix and pulsating scales on every frame
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const node = nodeData[i];
      const pulse = Math.sin(time * node.speed + node.phase) * 0.015;
      const scale = node.baseScale + pulse;

      // Subtle atmospheric hover
      const hoverY = Math.sin(time * 0.5 + node.phase) * 0.08;

      dummy.position.copy(node.origPos);
      dummy.position.y += hoverY;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={ref}>
      <instancedMesh
        ref={meshRef}
        args={[null, null, count]}
      >
        <sphereGeometry args={[1, 12, 12]}>
          <instancedBufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </sphereGeometry>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </instancedMesh>
    </group>
  );
});

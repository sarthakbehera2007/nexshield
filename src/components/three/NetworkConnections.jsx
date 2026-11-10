import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Fine dynamic vector connection lines forming the cybersecurity mesh topology.
 * In alert state, suspicious breach paths illuminate in high-contrast amber/red;
 * in defence mode, perimeter safety lines close around the core.
 */
export const NetworkConnections = React.forwardRef(function NetworkConnections(
  { isThreatDetected = false, isInvestigationActive = false, isDefending = false },
  ref
) {
  const { normalLinesGeo, threatLinesGeo, perimeterGeo } = useMemo(() => {
    // Generate deterministic connections between nearby points
    let seed = 77;
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const count = 48;
    const positions = [];
    for (let i = 0; i < count; i++) {
      const angle = rng() * Math.PI * 2;
      const radius = 2.0 + rng() * 3.8;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * (radius * 0.75);
      const z = (rng() - 0.5) * 2.0;
      positions.push(new THREE.Vector3(x, y, z));
    }

    // Connect node pairs with distance < 2.4
    const normalLinePts = [];
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (positions[i].distanceTo(positions[j]) < 2.2) {
          normalLinePts.push(positions[i], positions[j]);
        }
      }
    }

    // Specific targeted threat correlation vectors (Section 4 Investigation)
    const threatPts = [
      new THREE.Vector3(-3.2, 1.8, 0.4),
      new THREE.Vector3(-1.8, 1.1, 0.2),
      new THREE.Vector3(-1.8, 1.1, 0.2),
      new THREE.Vector3(-0.6, 0.3, 0.1),
      new THREE.Vector3(-0.6, 0.3, 0.1),
      new THREE.Vector3(0, 0.05, 0.15), // breaches toward shield core
    ];

    // Defensive hexagonal perimeter vectors (Section 5 Defence)
    const perimeterPts = [];
    const pRadius = 2.4;
    const sides = 6;
    for (let i = 0; i < sides; i++) {
      const a1 = (i / sides) * Math.PI * 2;
      const a2 = ((i + 1) / sides) * Math.PI * 2;
      perimeterPts.push(
        new THREE.Vector3(Math.cos(a1) * pRadius, Math.sin(a1) * (pRadius * 1.1), 0.1),
        new THREE.Vector3(Math.cos(a2) * pRadius, Math.sin(a2) * (pRadius * 1.1), 0.1)
      );
    }

    return {
      normalLinesGeo: new THREE.BufferGeometry().setFromPoints(normalLinePts),
      threatLinesGeo: new THREE.BufferGeometry().setFromPoints(threatPts),
      perimeterGeo: new THREE.BufferGeometry().setFromPoints(perimeterPts),
    };
  }, []);

  return (
    <group ref={ref}>
      {/* Normal Mesh Connectivity */}
      <lineSegments geometry={normalLinesGeo}>
        <lineBasicMaterial
          color="#00a8cc"
          transparent
          opacity={0.22}
          linewidth={1}
        />
      </lineSegments>

      {/* Investigation / Attack Vector Path */}
      {(isThreatDetected || isInvestigationActive) && (
        <lineSegments geometry={threatLinesGeo}>
          <lineBasicMaterial
            color={isThreatDetected ? '#ff3366' : '#ffaa00'}
            transparent
            opacity={0.85}
            linewidth={2}
          />
        </lineSegments>
      )}

      {/* Defensive Perimeter Barrier (Section 5) */}
      {isDefending && (
        <lineSegments geometry={perimeterGeo}>
          <lineBasicMaterial
            color="#00ffcc"
            transparent
            opacity={0.9}
            linewidth={2}
          />
        </lineSegments>
      )}
    </group>
  );
});

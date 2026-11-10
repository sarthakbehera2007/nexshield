import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * NEXSHIELD 3D N MONOGRAM
 * A machined titanium multi-layer geometric N structure with:
 * - Physical extrusion depth and precision beveled metallic edges
 * - Recessed circuit channel routed through the core
 * - Cyan emissive perimeter contour
 * - Embedded micro-telemetry connection nodes
 */
export const NMonogram = React.forwardRef(function NMonogram(
  { glowIntensity = 1.0, isAlert = false, isDefending = false },
  ref
) {
  const pulseLightRef = useRef();

  // Create the extruded 3D "N" solid monogram
  const { nSolidGeo, nEdgeGeo, recessedGrooveGeo, nodes } = useMemo(() => {
    const shape = new THREE.Shape();

    // Geometric N coordinates with faceted chamfers
    // Left upright left-edge
    shape.moveTo(-0.66, -1.15);
    shape.lineTo(-0.66, 0.95);
    shape.lineTo(-0.52, 1.18); // top-left chamfer
    shape.lineTo(-0.28, 1.18); // top left inner
    shape.lineTo(-0.28, 0.35); // inner notch before diagonal junction

    // Diagonal traverse to right upright
    shape.lineTo(0.32, -0.65);
    shape.lineTo(0.32, 0.95);
    shape.lineTo(0.48, 1.18);  // top-right chamfer
    shape.lineTo(0.66, 1.18);  // top-right corner
    shape.lineTo(0.66, -0.95); // right outer down
    shape.lineTo(0.52, -1.18); // bottom-right chamfer
    shape.lineTo(0.28, -1.18); // bottom right inner
    shape.lineTo(0.28, -0.35); // inner notch

    // Diagonal return
    shape.lineTo(-0.32, 0.65);
    shape.lineTo(-0.32, -0.95);
    shape.lineTo(-0.48, -1.15); // bottom-left inner chamfer
    shape.closePath();

    const extrudeSettings = {
      steps: 2,
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.045,
      bevelSize: 0.035,
      bevelOffset: 0,
      bevelSegments: 4,
    };

    const solidGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    solidGeo.center();

    // Edge highlight line geometry
    const pts = shape.getPoints(32);
    const v3 = pts.map((p) => new THREE.Vector3(p.x, p.y, 0.16));
    v3.push(v3[0].clone());
    const edgeGeo = new THREE.BufferGeometry().setFromPoints(v3);

    // Recessed circuit conduit spline tracing the backbone of the N
    const conduitCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-0.47, -0.9, 0.16),
        new THREE.Vector3(-0.47, 0.85, 0.16),
        new THREE.Vector3(-0.15, 0.35, 0.16),
        new THREE.Vector3(0.15, -0.35, 0.16),
        new THREE.Vector3(0.47, -0.85, 0.16),
        new THREE.Vector3(0.47, 0.9, 0.16),
      ],
      false,
      'chordal',
      0.1
    );

    const grooveGeo = new THREE.TubeGeometry(conduitCurve, 48, 0.026, 8, false);

    // Micro connection nodes on the surface
    const microNodes = [
      [-0.47, 0.9, 0.16],
      [-0.47, 0.0, 0.16],
      [-0.47, -0.9, 0.16],
      [0.47, 0.9, 0.16],
      [0.47, 0.0, 0.16],
      [0.47, -0.9, 0.16],
      [0.0, 0.0, 0.17],
    ];

    return {
      nSolidGeo: solidGeo,
      nEdgeGeo: edgeGeo,
      recessedGrooveGeo: grooveGeo,
      nodes: microNodes,
    };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (pulseLightRef.current) {
      pulseLightRef.current.position.y = Math.sin(time * 1.8) * 0.75;
    }
  });

  const cyanColor = isAlert ? '#FF3B69' : isDefending ? '#19E68C' : '#00DFFF';

  return (
    <group ref={ref} position={[0, 0, 0.08]}>
      {/* Primary Titanium Machined N Body */}
      <mesh geometry={nSolidGeo} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#0F1722"
          emissive="#060C14"
          emissiveIntensity={0.25}
          metalness={0.94}
          roughness={0.22}
          clearcoat={0.45}
          clearcoatRoughness={0.15}
          reflectivity={0.95}
        />
      </mesh>

      {/* Recessed Glowing Circuit Backbone */}
      <mesh geometry={recessedGrooveGeo}>
        <meshStandardMaterial
          color="#001824"
          emissive={cyanColor}
          emissiveIntensity={1.8 * glowIntensity}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Fine Cyan Emissive Contour Edge Highlight */}
      <line geometry={nEdgeGeo}>
        <lineBasicMaterial
          color={cyanColor}
          transparent
          opacity={0.85}
          linewidth={2}
        />
      </line>

      {/* Traveling Circuit Pulse */}
      <mesh ref={pulseLightRef} position={[0, 0, 0.18]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Micro Telemetry Solder Nodes */}
      {nodes.map((pos, idx) => (
        <group key={idx} position={pos}>
          <mesh>
            <cylinderGeometry args={[0.035, 0.035, 0.025, 8]} />
            <meshStandardMaterial color="#0A1018" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0, 0.015]}>
            <circleGeometry args={[0.02, 12]} />
            <meshBasicMaterial color={idx === 6 ? '#19E68C' : cyanColor} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

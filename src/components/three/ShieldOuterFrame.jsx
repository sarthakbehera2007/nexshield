import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createShieldShape, outerFrameExtrudeSettings } from './ShieldGeometry';

/**
 * OUTER SHIELD HOUSING
 * Precision dark titanium protective frame with physical extrusion depth,
 * beveled faceted edges, and cyan perimeter contour illumination.
 */
export const ShieldOuterFrame = React.forwardRef(function ShieldOuterFrame(props, ref) {
  const frameGeometry = useMemo(() => {
    const outerShape = createShieldShape(1.0, 0);
    const innerHole = createShieldShape(0.78, 0);
    outerShape.holes.push(innerHole);

    const geo = new THREE.ExtrudeGeometry(outerShape, outerFrameExtrudeSettings);
    geo.center();
    return geo;
  }, []);

  const edgeLineGeo = useMemo(() => {
    const shape = createShieldShape(1.008, 0);
    const points = shape.getPoints();
    const vectors = points.map((p) => new THREE.Vector3(p.x, p.y, 0.22));
    vectors.push(vectors[0].clone());
    return new THREE.BufferGeometry().setFromPoints(vectors);
  }, []);

  const bolts = useMemo(() => {
    return [
      [-1.3, 1.5, 0.22],
      [1.3, 1.5, 0.22],
      [-1.6, 0.9, 0.22],
      [1.6, 0.9, 0.22],
      [-1.4, -0.3, 0.22],
      [1.4, -0.3, 0.22],
      [-0.75, -1.4, 0.22],
      [0.75, -1.4, 0.22],
      [0, -2.1, 0.22],
    ];
  }, []);

  return (
    <group ref={ref} {...props}>
      {/* Machined Dark Titanium Outer Housing */}
      <mesh geometry={frameGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#0B111A"
          emissive="#040810"
          emissiveIntensity={0.2}
          metalness={0.94}
          roughness={0.24}
          clearcoat={0.4}
          clearcoatRoughness={0.18}
          reflectivity={0.92}
        />
      </mesh>

      {/* Thin Cyan Edge Perimeter Illumination */}
      <line geometry={edgeLineGeo}>
        <lineBasicMaterial
          color="#00DFFF"
          transparent
          opacity={0.8}
          linewidth={2}
        />
      </line>

      {/* Precision Mechanical Fasteners */}
      {bolts.map((pos, idx) => (
        <group key={idx} position={pos}>
          <mesh>
            <cylinderGeometry args={[0.045, 0.045, 0.06, 6]} />
            <meshStandardMaterial
              color="#070C12"
              metalness={0.96}
              roughness={0.12}
            />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <ringGeometry args={[0.02, 0.038, 8]} />
            <meshBasicMaterial
              color={idx % 4 === 0 ? '#19E68C' : '#00DFFF'}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
});

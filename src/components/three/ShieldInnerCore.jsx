import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createShieldShape, innerCoreExtrudeSettings } from './ShieldGeometry';

/**
 * LAYER 2 — INNER SHIELD
 * Recessed graphite black plate serving as the architectural baseboard
 * for the illuminated N-circuit core and central power element.
 */
export const ShieldInnerCore = React.forwardRef(function ShieldInnerCore(props, ref) {
  const innerGeometry = useMemo(() => {
    // Slightly smaller than outer cutout so it sits recessed and nested
    const innerShape = createShieldShape(0.77, 0);
    const geo = new THREE.ExtrudeGeometry(innerShape, innerCoreExtrudeSettings);
    geo.center();
    return geo;
  }, []);

  // Subtle carbon/graphite hex patterned surface plate or backplate
  const backPlateGeo = useMemo(() => {
    const shape = createShieldShape(0.72, 0.05);
    const geo = new THREE.ShapeGeometry(shape);
    geo.center();
    return geo;
  }, []);

  return (
    <group ref={ref} position={[0, 0, -0.06]} {...props}>
      {/* Graphite Inner Plate */}
      <mesh geometry={innerGeometry} receiveShadow castShadow>
        <meshPhysicalMaterial
          color="#0d1017"
          emissive="#020408"
          emissiveIntensity={0.1}
          metalness={0.78}
          roughness={0.38}
          clearcoat={0.2}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* Recessed Technical Substrate */}
      <mesh geometry={backPlateGeo} position={[0, 0, 0.082]}>
        <meshStandardMaterial
          color="#06090e"
          roughness={0.65}
          metalness={0.6}
        />
      </mesh>
    </group>
  );
});

import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * CYBER BACKGROUND
 * Dark enterprise cybersecurity environment (#050810),
 * featuring a subtle isometric telemetry matrix grid and ambient star dust.
 */
export const CyberBackground = React.forwardRef(function CyberBackground(props, ref) {
  // Fine technical grid plane recessed behind scene
  const gridHelper = useMemo(() => {
    const size = 30;
    const divisions = 30;
    const grid = new THREE.GridHelper(size, divisions, 0x00f0ff, 0x071b2c);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -5;
    // Make grid transparent and subtle
    if (grid.material) {
      grid.material.transparent = true;
      grid.material.opacity = 0.12;
      grid.material.depthWrite = false;
    }
    return grid;
  }, []);

  // Distant ambient cybersecurity particles
  const dustGeo = useMemo(() => {
    const count = 180;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = -Math.random() * 8 - 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  return (
    <group ref={ref}>
      {/* Background Grid */}
      <primitive object={gridHelper} />

      {/* Atmospheric Star Dust */}
      <points geometry={dustGeo}>
        <pointsMaterial
          size={0.03}
          color="#00e5ff"
          transparent
          opacity={0.25}
          sizeAttenuation
        />
      </points>

      {/* Subtle vignette plane */}
      <mesh position={[0, 0, -6]}>
        <planeGeometry args={[35, 25]} />
        <meshBasicMaterial
          color="#050810"
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
});

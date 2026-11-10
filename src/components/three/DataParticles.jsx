import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ParticleEngine } from '../../animations/particleAnimation';

/**
 * DATA PARTICLE SYSTEM
 * Multi-stream high-speed telemetry packets traveling along orbital vectors,
 * node-to-node pathways, and converging on the central shield core.
 */
export const DataParticles = React.forwardRef(function DataParticles(
  { count = 150 },
  ref
) {
  const pointsRef = useRef();
  const engine = useMemo(() => new ParticleEngine(count), [count]);

  const { geometry } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(engine.particles, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(engine.colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(engine.sizes, 1));
    return { geometry: geo };
  }, [engine]);

  useFrame((state, delta) => {
    engine.update(delta);
    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={ref}>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          opacity={0.88}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
});

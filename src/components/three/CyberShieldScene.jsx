import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NMonogram } from './NMonogram';
import { EnergyCore } from './EnergyCore';
import { ShieldOuterFrame } from './ShieldOuterFrame';
import { ShieldInnerCore } from './ShieldInnerCore';
import { OrbitalRings } from './OrbitalRings';
import { NetworkNodes } from './NetworkNodes';
import { NetworkConnections } from './NetworkConnections';
import { DataParticles } from './DataParticles';
import { CyberLighting } from './CyberLighting';
import { CyberBackground } from './CyberBackground';
import { CameraController } from './CameraController';
import { setupPointerParallax } from '../../animations/pointerInteraction';
import gsap from 'gsap';

// Inner rig — all 3D objects + animation logic
function ShieldRig({ scrollState, parallaxState, isThreatDetected, isInvestigationActive, isDefending, isMobile }) {
  const shieldGroupRef = useRef();
  const orbitalRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const clampedDelta = Math.min(delta, 0.05);
    const lerpSpeed = 1.0 - Math.pow(0.008, clampedDelta);

    if (shieldGroupRef.current) {
      const targetX = isMobile ? 0 : (scrollState?.shieldPosX ?? 1.0) + (parallaxState?.x ?? 0) * 0.16;
      const targetY = (scrollState?.shieldPosY ?? 0) + (parallaxState?.y ?? 0) * 0.1 + Math.sin(time * 1.1) * 0.035;

      shieldGroupRef.current.position.x = THREE.MathUtils.lerp(shieldGroupRef.current.position.x, targetX, lerpSpeed);
      shieldGroupRef.current.position.y = THREE.MathUtils.lerp(shieldGroupRef.current.position.y, targetY, lerpSpeed);

      const targetRotX = (scrollState?.shieldRotX ?? 0) - (parallaxState?.y ?? 0) * 0.12;
      const targetRotY = (scrollState?.shieldRotY ?? -0.12) + (parallaxState?.x ?? 0) * 0.2;
      const targetRotZ = (scrollState?.shieldRotZ ?? 0) - (parallaxState?.x ?? 0) * 0.04;

      shieldGroupRef.current.rotation.x = THREE.MathUtils.lerp(shieldGroupRef.current.rotation.x, targetRotX, lerpSpeed);
      shieldGroupRef.current.rotation.y = THREE.MathUtils.lerp(shieldGroupRef.current.rotation.y, targetRotY, lerpSpeed);
      shieldGroupRef.current.rotation.z = THREE.MathUtils.lerp(shieldGroupRef.current.rotation.z, targetRotZ, lerpSpeed);
    }

    if (orbitalRef.current) {
      orbitalRef.current.position.x = THREE.MathUtils.lerp(orbitalRef.current.position.x, (parallaxState?.x ?? 0) * 0.08, lerpSpeed);
      orbitalRef.current.position.y = THREE.MathUtils.lerp(orbitalRef.current.position.y, (parallaxState?.y ?? 0) * 0.08, lerpSpeed);
    }
  });

  return (
    <>
      {/* Core shield hardware assembly */}
      <group ref={shieldGroupRef}>
        <ShieldOuterFrame />
        <ShieldInnerCore />
        <NMonogram
          glowIntensity={scrollState?.circuitGlow ?? 1.0}
          isAlert={isThreatDetected}
          isDefending={isDefending}
        />
        <EnergyCore isThreatDetected={isThreatDetected} isDefending={isDefending} />
      </group>

      {/* Telemetry orbital rings */}
      <OrbitalRings
        ref={orbitalRef}
        isThreatDetected={isThreatDetected}
        isDefending={isDefending}
      />

      {/* Network topology */}
      <NetworkNodes
        isThreatDetected={isThreatDetected}
        isInvestigationActive={isInvestigationActive}
        isDefending={isDefending}
      />
      <NetworkConnections
        isThreatDetected={isThreatDetected}
        isInvestigationActive={isInvestigationActive}
        isDefending={isDefending}
      />
    </>
  );
}

export function CyberShieldScene({ scrollState, currentSection = 0, isThreat = false, isDefend = false }) {
  const [isMobile, setIsMobile] = useState(false);
  const [parallaxState, setParallaxState] = useState({ x: 0, y: 0 });
  const lightsRef = useRef();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const { getParallax, cleanup } = setupPointerParallax({});
    let raf;
    const loop = () => {
      const p = getParallax();
      setParallaxState(p);
      if (lightsRef.current?.updatePointerParallax) {
        lightsRef.current.updatePointerParallax(p.x, p.y);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); cleanup(); };
  }, [isMobile]);

  const isThreatDetected = isThreat || currentSection === 2 || currentSection === 3;
  const isInvestigationActive = currentSection === 3;
  const isDefending = isDefend || currentSection === 4 || currentSection === 5;

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 44, near: 0.1, far: 50 }}
        dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        shadows
      >
        <color attach="background" args={['#05080E']} />
        <CyberLighting ref={lightsRef} isThreatDetected={isThreatDetected} isDefending={isDefending} />
        <CyberBackground />
        <ShieldRig
          scrollState={scrollState}
          parallaxState={parallaxState}
          isThreatDetected={isThreatDetected}
          isInvestigationActive={isInvestigationActive}
          isDefending={isDefending}
          isMobile={isMobile}
        />
        <DataParticles count={isMobile ? 50 : 140} />
        <CameraController scrollState={scrollState} parallaxState={parallaxState} isMobile={isMobile} />
      </Canvas>
    </div>
  );
}

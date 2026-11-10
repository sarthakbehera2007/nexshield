import gsap from 'gsap';

/**
 * Creates the cinematic 8-10 second master intro sequence for NEXSHIELD.
 * Coordinates shield assembly, orbital ring power-up, network nodes,
 * circuit trace illumination, energy core ignition, and UI reveals.
 */
export function createIntroTimeline({
  shieldGroupRef,
  outerFrameRef,
  innerCoreRef,
  nCircuitRef,
  energyCoreRef,
  orbitalRef,
  networkRef,
  lightsRef,
  uiContainerRef,
  onSequenceComplete,
}) {
  const masterTl = gsap.timeline({
    paused: true,
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      if (onSequenceComplete) onSequenceComplete();
    },
  });

  // Initial Scene States (Sequence 01 — Darkness prep)
  if (shieldGroupRef?.current) {
    gsap.set(shieldGroupRef.current.position, { z: -8, y: -0.5 });
    gsap.set(shieldGroupRef.current.rotation, { x: 0.35, y: -0.4, z: -0.1 });
    gsap.set(shieldGroupRef.current.scale, { x: 0.05, y: 0.05, z: 0.05 });
  }

  if (outerFrameRef?.current) {
    gsap.set(outerFrameRef.current.position, { z: 4 });
    gsap.set(outerFrameRef.current.scale, { x: 1.4, y: 1.4, z: 1.4 });
  }

  if (innerCoreRef?.current) {
    gsap.set(innerCoreRef.current.position, { z: -3 });
  }

  if (nCircuitRef?.current) {
    gsap.set(nCircuitRef.current, { visible: false });
  }

  if (energyCoreRef?.current) {
    gsap.set(energyCoreRef.current.scale, { x: 0.01, y: 0.01, z: 0.01 });
  }

  if (orbitalRef?.current) {
    gsap.set(orbitalRef.current.scale, { x: 0.1, y: 0.1, z: 0.1 });
    gsap.set(orbitalRef.current.rotation, { x: 0.8, y: 0, z: -0.5 });
  }

  if (networkRef?.current) {
    gsap.set(networkRef.current.scale, { x: 0.2, y: 0.2, z: 0.2 });
  }

  // SEQUENCE 01 — DARKNESS (0 - 1.0s)
  // Scene begins deeply dark; central point awakens; ambient key lights warm up subtly
  masterTl.to(
    {},
    {
      duration: 1.0,
      onStart: () => {
        if (lightsRef?.current?.setIntensity) {
          lightsRef.current.setIntensity(0.1, 0.2);
        }
      },
    },
    0
  );

  // SEQUENCE 02 — ORBIT FORMATION (1.0 - 2.5s)
  // Orbital rings expand and assemble around central position; nodes ignite
  if (orbitalRef?.current) {
    masterTl.to(
      orbitalRef.current.scale,
      {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: 1.5,
        ease: 'power2.out',
      },
      1.0
    );
    masterTl.to(
      orbitalRef.current.rotation,
      {
        y: Math.PI * 0.5,
        duration: 1.5,
        ease: 'power1.inOut',
      },
      1.0
    );
  }

  if (networkRef?.current) {
    masterTl.to(
      networkRef.current.scale,
      {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: 1.6,
        ease: 'back.out(1.2)',
      },
      1.2
    );
  }

  // SEQUENCE 03 — SHIELD REVEAL (2.5 - 4.0s)
  // Metallic components slide into place, layers align with machined mechanical precision
  if (shieldGroupRef?.current) {
    masterTl.to(
      shieldGroupRef.current.scale,
      {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: 1.8,
        ease: 'power3.out',
      },
      2.2
    );
    masterTl.to(
      shieldGroupRef.current.position,
      {
        z: 0,
        y: 0,
        duration: 1.8,
        ease: 'power3.out',
      },
      2.2
    );
    masterTl.to(
      shieldGroupRef.current.rotation,
      {
        x: 0.05,
        y: -0.15,
        z: 0.02,
        duration: 2.0,
        ease: 'power2.out',
      },
      2.2
    );
  }

  if (outerFrameRef?.current) {
    masterTl.to(
      outerFrameRef.current.position,
      {
        z: 0,
        duration: 1.4,
        ease: 'power3.out',
      },
      2.5
    );
    masterTl.to(
      outerFrameRef.current.scale,
      {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: 1.4,
        ease: 'power3.out',
      },
      2.5
    );
  }

  if (innerCoreRef?.current) {
    masterTl.to(
      innerCoreRef.current.position,
      {
        z: 0,
        duration: 1.2,
        ease: 'power3.out',
      },
      2.7
    );
  }

  // Circuit awakens
  masterTl.to(
    {},
    {
      duration: 0.8,
      onStart: () => {
        if (nCircuitRef?.current) {
          nCircuitRef.current.visible = true;
          if (nCircuitRef.current.activateCircuit) {
            nCircuitRef.current.activateCircuit();
          }
        }
      },
    },
    3.2
  );

  // SEQUENCE 04 — ENERGY ACTIVATION (4.0 - 5.5s)
  // Central core flares, cyan light pulses through tubes and orbits accelerate
  if (energyCoreRef?.current) {
    masterTl.to(
      energyCoreRef.current.scale,
      {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: 1.2,
        ease: 'back.out(2)',
      },
      4.0
    );
  }

  masterTl.to(
    {},
    {
      duration: 1.2,
      onStart: () => {
        if (lightsRef?.current?.pulseCyan) {
          lightsRef.current.pulseCyan();
        }
      },
    },
    4.1
  );

  // SEQUENCE 05 — FINAL HERO STATE & UI ENTRANCE (5.5 - 8.0s)
  // Shield settles into poised position, subtle idle float takes over, UI cards stagger in
  if (shieldGroupRef?.current) {
    masterTl.to(
      shieldGroupRef.current.rotation,
      {
        x: 0,
        y: -0.1,
        z: 0,
        duration: 2.2,
        ease: 'power2.inOut',
      },
      5.5
    );
  }

  // Trigger UI entrance if passed
  if (uiContainerRef?.current) {
    const heroElements = uiContainerRef.current.querySelectorAll('.hero-anim');
    if (heroElements && heroElements.length > 0) {
      masterTl.fromTo(
        heroElements,
        {
          opacity: 0,
          y: 35,
          filter: 'blur(8px)',
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          stagger: 0.12,
          ease: 'power3.out',
        },
        5.2
      );
    }
  }

  return masterTl;
}

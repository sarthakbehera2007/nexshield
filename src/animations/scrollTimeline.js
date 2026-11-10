import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Orchestrates cinematic 3D camera, shield, lighting, and node transitions
 * across the 6 narrative sections using GSAP ScrollTrigger.
 */
export function initScrollChoreography({
  shieldGroupRef,
  cameraRef,
  networkRef,
  circuitRef,
  orbitalRef,
  defenseBarrierRef,
  containerRef,
  onSectionChange,
}) {
  const triggers = [];

  if (!containerRef?.current || !shieldGroupRef?.current) return () => {};

  // Track global state targets for smooth lerping in render loop
  const scrollState = {
    section: 0,
    cameraPosZ: 5.5,
    cameraPosY: 0,
    shieldRotX: 0,
    shieldRotY: -0.15,
    shieldRotZ: 0,
    shieldPosX: 1.2,
    shieldPosY: 0,
    circuitGlow: 1.0,
    threatDetected: false,
    investigationActive: false,
    defenseActive: false,
  };

  const sections = containerRef.current.querySelectorAll('.scroll-section');

  sections.forEach((sectionEl, index) => {
    const st = ScrollTrigger.create({
      trigger: sectionEl,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => activateSection(index),
      onEnterBack: () => activateSection(index),
    });
    triggers.push(st);
  });

  function activateSection(index) {
    scrollState.section = index;
    if (onSectionChange) onSectionChange(index);

    switch (index) {
      case 0: // SECTION 1 — HERO
        gsap.to(scrollState, {
          cameraPosZ: 5.8,
          cameraPosY: 0,
          shieldPosX: 1.3,
          shieldPosY: 0,
          shieldRotX: 0,
          shieldRotY: -0.18,
          shieldRotZ: 0,
          circuitGlow: 1.0,
          threatDetected: false,
          investigationActive: false,
          defenseActive: false,
          duration: 1.4,
          ease: 'power2.out',
        });
        break;

      case 1: // SECTION 2 — INTELLIGENCE ("THREATS DON'T ANNOUNCE THEMSELVES")
        gsap.to(scrollState, {
          cameraPosZ: 4.8,
          cameraPosY: 0.2,
          shieldPosX: 1.1,
          shieldPosY: 0.1,
          shieldRotX: 0.12,
          shieldRotY: 0.25, // rotated 10-15 degrees
          shieldRotZ: -0.05,
          circuitGlow: 1.6,
          threatDetected: false,
          investigationActive: false,
          defenseActive: false,
          duration: 1.4,
          ease: 'power2.out',
        });
        break;

      case 2: // SECTION 3 — DETECTION ("DETECT EVERY SIGNAL")
        gsap.to(scrollState, {
          cameraPosZ: 4.0,
          cameraPosY: -0.1,
          shieldPosX: 0.8,
          shieldPosY: 0,
          shieldRotX: 0.05,
          shieldRotY: 0.0, // Face forward to reveal internal circuit
          shieldRotZ: 0,
          circuitGlow: 2.4,
          threatDetected: true,
          investigationActive: false,
          defenseActive: false,
          duration: 1.4,
          ease: 'power2.out',
        });
        break;

      case 3: // SECTION 4 — INVESTIGATION ("CONNECT THE ATTACK")
        gsap.to(scrollState, {
          cameraPosZ: 4.3,
          cameraPosY: -0.2,
          shieldPosX: -0.9, // Move shield left to reveal attack timeline on right
          shieldPosY: 0.2,
          shieldRotX: 0.15,
          shieldRotY: -0.3,
          shieldRotZ: 0.08,
          circuitGlow: 1.8,
          threatDetected: true,
          investigationActive: true,
          defenseActive: false,
          duration: 1.5,
          ease: 'power2.out',
        });
        break;

      case 4: // SECTION 5 — DEFENCE ("STOP THE BREACH")
        gsap.to(scrollState, {
          cameraPosZ: 4.5,
          cameraPosY: 0,
          shieldPosX: 0, // Centered authority
          shieldPosY: 0,
          shieldRotX: 0,
          shieldRotY: 0,
          shieldRotZ: 0,
          circuitGlow: 3.0,
          threatDetected: false,
          investigationActive: false,
          defenseActive: true,
          duration: 1.6,
          ease: 'power2.out',
        });
        break;

      case 5: // SECTION 6 — FINAL CTA ("INTELLIGENCE THAT DEFENDS")
        gsap.to(scrollState, {
          cameraPosZ: 5.6,
          cameraPosY: 0.1,
          shieldPosX: 0,
          shieldPosY: 0.1,
          shieldRotX: -0.05,
          shieldRotY: 0.05,
          shieldRotZ: 0,
          circuitGlow: 2.0,
          threatDetected: false,
          investigationActive: false,
          defenseActive: true,
          duration: 1.8,
          ease: 'power2.out',
        });
        break;

      default:
        break;
    }
  }

  // Return teardown function and state object
  return {
    scrollState,
    cleanup: () => {
      triggers.forEach((t) => t.kill());
    },
  };
}

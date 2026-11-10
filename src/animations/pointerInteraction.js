import gsap from 'gsap';

/**
 * Handles smooth, restrained pointer parallax across the shield,
 * camera, orbital rings, and dynamic lights.
 */
export function setupPointerParallax({
  targetRef,
  orbitRef,
  networkRef,
  lightRef,
}) {
  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    isHovered: false,
  };

  const xTo = gsap.quickTo(pointer, 'x', { duration: 0.8, ease: 'power2.out' });
  const yTo = gsap.quickTo(pointer, 'y', { duration: 0.8, ease: 'power2.out' });

  const handlePointerMove = (event) => {
    // Normalized coordinates from -1 to 1
    const { clientX, clientY } = event;
    const normX = (clientX / window.innerWidth) * 2 - 1;
    const normY = -(clientY / window.innerHeight) * 2 + 1;

    pointer.isHovered = true;
    xTo(normX);
    yTo(normY);
  };

  const handlePointerLeave = () => {
    pointer.isHovered = false;
    xTo(0);
    yTo(0);
  };

  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  document.body.addEventListener('pointerleave', handlePointerLeave, { passive: true });

  return {
    getParallax: () => ({
      x: pointer.x,
      y: pointer.y,
      isHovered: pointer.isHovered,
    }),
    cleanup: () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.body.removeEventListener('pointerleave', handlePointerLeave);
    },
  };
}

import * as THREE from 'three';

/**
 * Creates custom mathematical vectors and THREE.Shape profiles
 * for NEXSHIELD's multi-layered cybernetic shield architecture.
 */

export function createShieldShape(scale = 1.0, inset = 0) {
  const shape = new THREE.Shape();

  // Coordinates with inset offset to allow concentric frame beveling
  // Shield silhouette:
  // - Angular top crest: (0, 1.9)
  // - Top shoulder peak left/right: (-1.4, 1.7) to (1.4, 1.7)
  // - Upper shoulder chamfer: (-1.8, 1.1) to (1.8, 1.1)
  // - Mid-body inward bevel: (-1.6, -0.2) to (1.6, -0.2)
  // - Lower tapering facet: (-0.9, -1.5) to (0.9, -1.5)
  // - Bottom piercing apex: (0, -2.4)

  const s = scale;
  const i = inset;

  const topCenterY = (1.9 - i) * s;
  const shoulderX = (1.35 - i * 0.8) * s;
  const shoulderY = (1.65 - i * 0.8) * s;
  const outerFlangeX = (1.75 - i) * s;
  const outerFlangeY = (1.05 - i * 0.5) * s;
  const midFlangeX = (1.55 - i) * s;
  const midFlangeY = (-0.25 - i * 0.2) * s;
  const taperX = (0.85 - i * 0.6) * s;
  const taperY = (-1.55 + i * 0.4) * s;
  const bottomApexY = (-2.35 + i * 1.2) * s;

  // Start at top center apex
  shape.moveTo(0, topCenterY);

  // Right upper edge & shoulder
  shape.lineTo(shoulderX * 0.6, topCenterY - 0.08 * s);
  shape.lineTo(shoulderX, shoulderY);
  shape.lineTo(outerFlangeX, outerFlangeY);

  // Right mid-body tapering curve / facets
  shape.lineTo(midFlangeX, midFlangeY);
  shape.lineTo(taperX, taperY);

  // Right bottom to apex
  shape.lineTo(0, bottomApexY);

  // Left bottom to taper
  shape.lineTo(-taperX, taperY);
  shape.lineTo(-midFlangeX, midFlangeY);

  // Left mid-body & shoulder
  shape.lineTo(-outerFlangeX, outerFlangeY);
  shape.lineTo(-shoulderX, shoulderY);
  shape.lineTo(-shoulderX * 0.6, topCenterY - 0.08 * s);

  // Close back to top center apex
  shape.closePath();

  return shape;
}

export function createShieldHoleShape(scale = 0.82) {
  return createShieldShape(scale, 0);
}

/**
 * Creates extrusion settings for distinct physical depth and beveled edges.
 */
export const outerFrameExtrudeSettings = {
  steps: 2,
  depth: 0.32,
  bevelEnabled: true,
  bevelThickness: 0.08,
  bevelSize: 0.06,
  bevelOffset: 0,
  bevelSegments: 4,
};

export const innerCoreExtrudeSettings = {
  steps: 1,
  depth: 0.16,
  bevelEnabled: true,
  bevelThickness: 0.04,
  bevelSize: 0.03,
  bevelSegments: 3,
};

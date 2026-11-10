import * as THREE from 'three';

/**
 * Procedural particle mathematics for data packets flowing through
 * orbital vectors, telemetry nodes, and converging on NEXSHIELD core.
 */
export class ParticleEngine {
  constructor(count = 140) {
    this.count = count;
    this.particles = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.colors = new Float32Array(count * 3);
    this.sizes = new Float32Array(count);
    this.modes = new Uint8Array(count); // 0: orbit, 1: node-wander, 2: core-inflow

    this.cyan = new THREE.Color(0x00f0ff);
    this.green = new THREE.Color(0x00ff88);
    this.white = new THREE.Color(0xddeeff);
    this.blue = new THREE.Color(0x0066ff);

    this.init();
  }

  init() {
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const mode = Math.random() < 0.65 ? 0 : Math.random() < 0.85 ? 1 : 2;
      this.modes[i] = mode;

      if (mode === 0) {
        // Orbit stream
        const angle = Math.random() * Math.PI * 2;
        const radius = 2.4 + Math.random() * 1.6;
        const ySpread = (Math.random() - 0.5) * 1.2;
        this.particles[i3] = Math.cos(angle) * radius;
        this.particles[i3 + 1] = ySpread;
        this.particles[i3 + 2] = Math.sin(angle) * radius;

        // Angular velocity
        this.velocities[i3] = (Math.random() * 0.4 + 0.3) * (Math.random() < 0.5 ? 1 : -1);
        this.velocities[i3 + 1] = radius;
        this.velocities[i3 + 2] = angle;
      } else if (mode === 1) {
        // Network node wanderers
        this.particles[i3] = (Math.random() - 0.5) * 6;
        this.particles[i3 + 1] = (Math.random() - 0.5) * 5;
        this.particles[i3 + 2] = (Math.random() - 0.5) * 3 - 0.5;

        this.velocities[i3] = (Math.random() - 0.5) * 0.2;
        this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.2;
        this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
      } else {
        // Core convergent pulses
        const angle = Math.random() * Math.PI * 2;
        const dist = 3.5 + Math.random() * 1.5;
        this.particles[i3] = Math.cos(angle) * dist;
        this.particles[i3 + 1] = (Math.random() - 0.5) * 2;
        this.particles[i3 + 2] = Math.sin(angle) * dist;

        this.velocities[i3] = angle;
        this.velocities[i3 + 1] = dist; // remaining distance
        this.velocities[i3 + 2] = Math.random() * 1.5 + 1.0; // speed
      }

      // Color assignment
      const randColor = Math.random();
      let c;
      if (randColor < 0.7) {
        c = this.cyan;
      } else if (randColor < 0.85) {
        c = this.green; // verified packet
      } else if (randColor < 0.95) {
        c = this.blue;
      } else {
        c = this.white;
      }

      this.colors[i3] = c.r;
      this.colors[i3 + 1] = c.g;
      this.colors[i3 + 2] = c.b;

      this.sizes[i] = Math.random() * 3.5 + 1.8;
    }
  }

  update(delta) {
    const clampedDelta = Math.min(delta, 0.05);

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const mode = this.modes[i];

      if (mode === 0) {
        // Orbital trajectory
        this.velocities[i3 + 2] += this.velocities[i3] * clampedDelta;
        const angle = this.velocities[i3 + 2];
        const radius = this.velocities[i3 + 1];

        this.particles[i3] = Math.cos(angle) * radius;
        this.particles[i3 + 2] = Math.sin(angle) * radius;
      } else if (mode === 1) {
        // Floating packet drift bounded in box
        this.particles[i3] += this.velocities[i3] * clampedDelta;
        this.particles[i3 + 1] += this.velocities[i3 + 1] * clampedDelta;
        this.particles[i3 + 2] += this.velocities[i3 + 2] * clampedDelta;

        if (Math.abs(this.particles[i3]) > 3.2) this.velocities[i3] *= -1;
        if (Math.abs(this.particles[i3 + 1]) > 2.8) this.velocities[i3 + 1] *= -1;
        if (Math.abs(this.particles[i3 + 2]) > 2.2) this.velocities[i3 + 2] *= -1;
      } else {
        // Converge toward shield core (0, 0, 0)
        this.velocities[i3 + 1] -= this.velocities[i3 + 2] * clampedDelta;

        if (this.velocities[i3 + 1] <= 0.3) {
          // Reset pulse outward
          this.velocities[i3 + 1] = 4.0 + Math.random() * 1.5;
          this.velocities[i3] = Math.random() * Math.PI * 2;
        }

        const angle = this.velocities[i3];
        const dist = this.velocities[i3 + 1];

        this.particles[i3] = Math.cos(angle) * dist;
        this.particles[i3 + 2] = Math.sin(angle) * dist * 0.7;
      }
    }
  }
}

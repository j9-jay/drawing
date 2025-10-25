/**
 * Main Roulette Game Class
 * Manages game state, canvas, and coordinates all game modules
 */

import { Participant, RouletteState, CameraState, SpinSpeed, SpinConfig } from '../shared/types/roulette';
import { ZOOM_DEFAULT } from './constants/camera';
import { DECELERATION_THRESHOLD } from './constants/spin';
import { RouletteRenderer } from './rendering/RouletteRenderer';
import { updateSpinPhysics } from './animation/SpinPhysics';
import { startSpin, createSpinConfig, determineWinner } from './animation/SpinController';
import { showWinner, hideWinner } from './ui/WinnerDisplay';
import { updateCameraZoom, applyCameraShake, applyCameraZoomLerp } from './rendering/CameraEffects';
import { setupEventListeners } from './ui/EventHandlers';
import { loadParticipants, saveParticipants } from './storage/RouletteStorage';

export class RouletteGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: RouletteRenderer;
  private participants: Participant[] = [];
  private state: RouletteState = 'idle';
  private currentAngle: number = 0;
  private currentVelocity: number = 0;
  private spinConfig: SpinConfig | null = null;
  private cameraState: CameraState;
  private animationId: number | null = null;
  private lastTimestamp: number = 0;
  private totalRotation: number = 0; // Track total rotation for min cycles validation
  private targetFontSize: number = 0; // Target font size for dynamic zoom

  constructor() {
    // Get canvas element
    this.canvas = document.getElementById('roulette-canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;

    // Initialize renderer
    this.renderer = new RouletteRenderer(this.ctx);

    // Initialize camera state
    this.cameraState = {
      zoom: ZOOM_DEFAULT,
      targetZoom: ZOOM_DEFAULT,
      shakeOffset: { x: 0, y: 0 }
    };

    this.init();
  }

  private init(): void {
    this.setupCanvas();
    this.loadSettings();
    this.setupEventListeners();
    this.startGameLoop();
  }

  private setupCanvas(): void {
    // Resize canvas to fill container
    const resizeCanvas = () => {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  /**
   * Load saved settings from localStorage
   * Restores participants if available, otherwise sets default
   */
  private loadSettings(): void {
    const savedParticipants = loadParticipants();

    if (savedParticipants.length >= 2) {
      this.participants = savedParticipants;
      console.log(`Loaded ${savedParticipants.length} participants from storage`);
    } else {
      // No saved participants, use default
      this.participants = [
        { name: '홍길동', weight: 1 },
        { name: '김철수', weight: 1 },
        { name: '이영희', weight: 1 },
        { name: '박민수', weight: 1 }
      ];
      console.log('Using default participants (no saved data)');
    }
  }

  /**
   * Parse participants from string with optional weights
   * Format: "Name*weight" (e.g., "홍길동*2" for weight 2)
   * @param input - Comma or newline-separated names with optional weights
   * @returns Parsed participants array
   */
  parseParticipants(input: string): Participant[] {
    return input
      .split(/[,\n]/) // Split by comma or newline
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0)
      .map(entry => {
        // Check for weight pattern: "Name*3" (name must be 1-50 characters)
        const match = entry.match(/^(.{1,50})\*(\d+)$/);

        if (match) {
          const name = match[1].trim();
          if (name.length === 0) {
            // Empty name after trimming, use as-is without weight
            return { name: entry, weight: 1 };
          }
          const weight = parseInt(match[2], 10);
          return { name, weight: Math.max(1, weight) }; // Minimum weight is 1
        }

        // No weight specified, default to 1
        return { name: entry, weight: 1 };
      })
      .filter(p => p.name.length > 0); // Filter out empty names
  }

  /**
   * Set participants and reset game state
   * Automatically saves to localStorage
   * @param participants - New participants array
   */
  setParticipants(participants: Participant[]): void {
    if (participants.length < 2) {
      console.warn('At least 2 participants required');
      return;
    }

    this.participants = participants;
    this.reset();

    // Auto-save to localStorage
    saveParticipants(participants);
  }

  /**
   * Reset game to initial state
   */
  private reset(): void {
    this.currentAngle = 0;
    this.currentVelocity = 0;
    this.totalRotation = 0;
    this.targetFontSize = 0;
    this.state = 'idle';
    this.spinConfig = null;
    hideWinner();
  }

  /**
   * Start spinning the roulette
   * @param speed - Spin speed preset (WEAK, NORMAL, STRONG)
   */
  public startSpinning(speed: SpinSpeed = 'NORMAL'): void {
    // Prevent starting if already spinning
    if (this.state === 'spinning' || this.state === 'decelerating') {
      console.warn('Roulette is already spinning');
      return;
    }

    // Validate participants
    if (this.participants.length < 2) {
      console.warn('At least 2 participants required to start spin');
      return;
    }

    // Reset state
    this.reset();

    // Create spin configuration
    this.spinConfig = createSpinConfig(speed);

    // Set initial velocity
    this.currentVelocity = startSpin(speed);

    // Update state
    this.state = 'spinning';

    console.log(`Spin started: ${speed} (${this.currentVelocity} rad/s)`);
  }

  /**
   * Stop the spin (for manual stop - not used in physics-based spin)
   */
  public stopSpinning(): void {
    if (this.state === 'spinning' || this.state === 'decelerating') {
      this.currentVelocity = 0;
      this.onSpinStopped();
    }
  }

  /**
   * Handle spin stopped event
   * Determine winner and show results
   */
  private onSpinStopped(): void {
    this.state = 'stopped';

    // Reset camera zoom to default (smoothly)
    this.cameraState.targetZoom = ZOOM_DEFAULT;

    // Determine winner
    const winner = determineWinner(this.currentAngle, this.participants);

    if (winner) {
      console.log(`Winner: ${winner.name} at angle ${this.currentAngle.toFixed(4)} rad`);
      showWinner(winner);
    } else {
      console.error('Failed to determine winner');
    }
  }

  private setupEventListeners(): void {
    setupEventListeners(this);
  }

  private startGameLoop(): void {
    const loop = (timestamp: number) => {
      this.update(timestamp);
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  /**
   * Update game state for one frame
   * Handles physics simulation and state transitions
   *
   * @param timestamp - Current frame timestamp from requestAnimationFrame
   */
  private update(timestamp: number): void {
    // Initialize lastTimestamp on first frame (assume 16ms for 60FPS)
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp - 16;
    }

    // Calculate deltaTime in seconds
    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    // Cap deltaTime to prevent physics instability (max 100ms)
    const cappedDeltaTime = Math.min(deltaTime, 0.1);

    // Only update physics if spinning
    if (this.state === 'spinning' || this.state === 'decelerating') {
      this.updatePhysics(cappedDeltaTime);
    }

    // Update camera effects
    this.updateCamera(timestamp, cappedDeltaTime);
  }

  /**
   * Update target font size for dynamic zoom
   * Calculates the expected winner's text size
   */
  private updateTargetFontSize(): void {
    const winner = determineWinner(this.currentAngle, this.participants);
    if (!winner) {
      this.targetFontSize = 0;
      return;
    }

    // Calculate total weight
    const totalWeight = this.participants.reduce((sum, p) => sum + p.weight, 0);
    const fullCircle = Math.PI * 2;

    // Calculate winner's sector angle
    const sectorAngle = fullCircle * (winner.weight / totalWeight);

    // Calculate font size for this sector
    this.targetFontSize = this.renderer.calculateFontSizeForSector(winner.name, sectorAngle);

    console.log(`Target winner: ${winner.name}, fontSize: ${this.targetFontSize}px`);
  }

  /**
   * Update camera effects
   * Handles zoom transitions and shake effects
   *
   * @param timestamp - Current frame timestamp
   * @param deltaTime - Time elapsed since last frame in seconds
   */
  private updateCamera(timestamp: number, deltaTime: number): void {
    // Update zoom based on state
    if (this.state === 'spinning' || this.state === 'decelerating') {
      // Dynamic zoom during spin
      updateCameraZoom(
        this.cameraState,
        Math.abs(this.currentVelocity),
        deltaTime,
        this.targetFontSize, // Pass target font size for dynamic zoom
        this.canvas.height   // Pass canvas height for zoom calculation
      );
    } else if (this.state === 'stopped') {
      // Smooth lerp to targetZoom when stopped
      applyCameraZoomLerp(this.cameraState);
    }

    // Apply shake effect if active
    applyCameraShake(this.cameraState, timestamp);
  }

  /**
   * Update physics simulation
   * Applies friction, updates angle, checks stop condition
   *
   * @param deltaTime - Time elapsed since last frame in seconds
   */
  private updatePhysics(deltaTime: number): void {
    if (!this.spinConfig) {
      return;
    }

    // Store previous angle to calculate rotation delta
    const prevAngle = this.currentAngle;

    // Update physics
    const physicsResult = updateSpinPhysics(
      this.currentAngle,
      this.currentVelocity,
      this.spinConfig,
      deltaTime
    );

    // Update state
    this.currentAngle = physicsResult.angle;
    this.currentVelocity = physicsResult.velocity;

    // Calculate rotation delta (handle wrap-around correctly)
    const TWO_PI = Math.PI * 2;
    let rotationDelta = (physicsResult.angle - prevAngle + TWO_PI) % TWO_PI;

    // Handle edge case: if delta is very close to 2π, it's actually ~0
    if (rotationDelta > Math.PI) {
      rotationDelta -= TWO_PI;
    }

    this.totalRotation += Math.abs(rotationDelta);

    // Check if spinning should transition to decelerating
    if (this.state === 'spinning' && this.currentVelocity < this.spinConfig.initialVelocity * DECELERATION_THRESHOLD) {
      this.state = 'decelerating';

      // Calculate target font size for dynamic zoom
      this.updateTargetFontSize();

      console.log('Entering deceleration phase');
    }

    // Check stop condition
    if (physicsResult.stopped) {
      // Validate minimum rotation
      const minRotation = this.spinConfig.minRotations * Math.PI * 2;

      if (this.totalRotation >= minRotation) {
        console.log(`Spin complete: ${(this.totalRotation / (Math.PI * 2)).toFixed(2)} rotations`);
        this.onSpinStopped();
      } else {
        // This shouldn't happen if physics are tuned correctly
        console.warn(
          `Spin stopped too early: ${(this.totalRotation / (Math.PI * 2)).toFixed(2)} / ${this.spinConfig.minRotations} rotations`
        );
        this.onSpinStopped();
      }
    }
  }

  private render(): void {
    // Delegate rendering to RouletteRenderer
    this.renderer.render(
      this.participants,
      this.currentAngle,
      this.cameraState,
      this.canvas.width,
      this.canvas.height
    );
  }

  /**
   * Get current game state
   * @returns Current roulette state
   */
  public getState(): RouletteState {
    return this.state;
  }

  /**
   * Get current angle
   * @returns Current angle in radians
   */
  public getAngle(): number {
    return this.currentAngle;
  }

  /**
   * Get current velocity
   * @returns Current angular velocity in rad/s
   */
  public getVelocity(): number {
    return this.currentVelocity;
  }

  /**
   * Get participants
   * @returns Current participants array
   */
  public getParticipants(): Participant[] {
    return [...this.participants];
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

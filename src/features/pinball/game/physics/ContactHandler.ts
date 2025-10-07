/**
 * Contact event handlers for physics collisions
 */

import { World, Vec2 } from 'planck';
import { BounceCircle, Bubble } from '../../shared/types';

/**
 * Handle bounce circle collision
 */
function handleBounceCircleContact(userDataA: any, userDataB: any): void {
  if (userDataA?.type === 'bounceCircle' || userDataB?.type === 'bounceCircle') {
    const bounceCircleData = userDataA?.type === 'bounceCircle' ? userDataA : userDataB;
    const bounceCircle = bounceCircleData.entity as BounceCircle;
    if (bounceCircle) {
      bounceCircle.bounceAnimation = 0;
    }
  }
}

/**
 * Handle jump pad collision
 */
function handleJumpPadContact(
  userDataA: any,
  userDataB: any,
  fixtureA: any,
  fixtureB: any
): void {
  if (userDataA?.type === 'jumppad' || userDataB?.type === 'jumppad') {
    const jumpPadData = userDataA?.type === 'jumppad' ? userDataA : userDataB;
    const marbleFixture = jumpPadData === userDataA ? fixtureB : fixtureA;
    const marbleBody = marbleFixture.getBody();
    const bounceMultiplier = jumpPadData.bounceMultiplier || 1.6;

    // Additional upward impulse for extra bounce
    const currentVel = marbleBody.getLinearVelocity();
    const upwardImpulse = Vec2(0, -Math.abs(currentVel.y) * (1000 - 1) * 5);
    marbleBody.applyLinearImpulse(upwardImpulse, marbleBody.getWorldCenter());
  }
}

/**
 * Handle bubble collision
 */
function handleBubbleContact(userDataA: any, userDataB: any): void {
  if (userDataA?.type === 'bubble' || userDataB?.type === 'bubble') {
    const bubbleData = userDataA?.type === 'bubble' ? userDataA : userDataB;
    const bubble = bubbleData.entity as Bubble;
    if (bubble && !bubble.popped) {
      bubble.popped = true;
      bubble.popAnimation = 0;
    }
  }
}

/**
 * Setup contact listener for world
 */
export function setupContactListener(world: World): void {
  world.on('begin-contact', (contact: any) => {
    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();
    const userDataA = fixtureA.getUserData();
    const userDataB = fixtureB.getUserData();

    // Handle all collision types (only one will match per contact)
    handleBounceCircleContact(userDataA, userDataB);
    handleJumpPadContact(userDataA, userDataB, fixtureA, fixtureB);
    handleBubbleContact(userDataA, userDataB);
  });
}
import { CircleCollider } from "../system/circleCollider.js";
import { PhysicsConfig, ANIMAL_LEVEL } from "../../constant.js";
import { Physics } from "../system/physics.js";

export class Collision {

    constructor() {
        this.restitution = PhysicsConfig.restitution;
        this.colliderIds = new WeakMap();
        this.nextColliderId = 1;
        this.activeContactPairs = new Set();
        this.seenContactPairs = new Set();
    }

    beginFrame() {
        this.seenContactPairs.clear();
    }

    endFrame() {
        for (const pairKey of this.activeContactPairs) {
            if (!this.seenContactPairs.has(pairKey)) {
                this.activeContactPairs.delete(pairKey);
            }
        }
    }

    //Handle collision between 2 colliders by merge
    resolveCollisionCircleToCircleByMerge(colliderA, colliderB) {
        let newRadius = Physics.computeNewRadiusByLevel(colliderA, colliderB);
        let newCircle = new CircleCollider((colliderA.x + colliderB.x) / 2, (colliderA.y + colliderB.y) / 2, newRadius);

        const m1 = colliderA.computeMass();
        const m2 = colliderB.computeMass();

        const newVx = (m1 * colliderA.vx + m2 * colliderB.vx) / (m1 + m2);

        const newVy = (m1 * colliderA.vy + m2 * colliderB.vy) / (m1 + m2);

        newCircle.vx = newVx;
        newCircle.vy = newVy + 50;

        return newCircle;

    }

    resolveNormalCircleToCircle(colliderA, colliderB) {
        const pairKey = this.getPairKey(colliderA, colliderB);
        this.seenContactPairs.add(pairKey);
        const isNewContact = !this.activeContactPairs.has(pairKey);

        const { normal: vCollisionNorm, distance } = Physics.computeCollisionNormalAndDistance(colliderA, colliderB);
        Physics.resolvePenetration(colliderA, colliderB, vCollisionNorm, distance);

        const rv = Physics.getRelativeVelocity(colliderA, colliderB);
        const relativeSpeed = rv.x * vCollisionNorm.x + rv.y * vCollisionNorm.y;

        const restitution = (isNewContact && Math.abs(relativeSpeed) > 100) ? PhysicsConfig.restitution : 0;
        const impulseResult = Physics.computeImpulseVelocity(colliderA, colliderB, vCollisionNorm, restitution);

        let normalImpulse = 0;
        if (impulseResult !== undefined) {
            Physics.applyImpulse(colliderA, colliderB, impulseResult.impulse);
            normalImpulse = Math.sqrt(impulseResult.impulse.x ** 2 + impulseResult.impulse.y ** 2);
        }

        // if contact is already active (resting), pin the normal velocity to zero to prevent jittering and sliding
        if (!isNewContact) {
            Physics.pinRestingContactVelocity(colliderA, colliderB, vCollisionNorm);
        }

        if (isNewContact) this.activeContactPairs.add(pairKey);
        return { normal: vCollisionNorm, normalImpulse };
    }

    resolveFrictionCircleToCircle(colliderA, colliderB, normal, normalImpulse) {
        Physics.applyRollingFrictionCircleToCircle(colliderA, colliderB, normal, normalImpulse);
    }

    computeNewRadiusByLevel(colliderA, colliderB) {
        if (colliderA.radius !== colliderB.radius) return;
        const levelA = colliderA.getLevel();
        let newradius = ANIMAL_LEVEL[levelA + 1].radius;
        return newradius;
    }

    getPairKey(colliderA, colliderB) {
        const idA = this.getColliderId(colliderA);
        const idB = this.getColliderId(colliderB);

        return idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;
    }

    getColliderId(collider) {
        if (!this.colliderIds.has(collider)) {
            this.colliderIds.set(collider, this.nextColliderId++);
        }

        return this.colliderIds.get(collider);
    }
}

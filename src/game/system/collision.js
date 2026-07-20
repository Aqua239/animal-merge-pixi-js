import { CircleCollider } from "../system/circleCollider.js";
import { PhysicsConfig, ANIMAL_LEVEL } from "../../constant.js";
import { Physics } from "../system/physics.js";

export class Collision {

    constructor() {
        this.restitution = PhysicsConfig.restitution;
        this.colliderIds = new WeakMap();
        this.nextColliderId = 1;
        this.activeCollisionPairs = new Set();
        this.seenCollisionPairs = new Set();
        this.warmStartImpulses = new Map();
    }

    beginFrame() {
        this.seenCollisionPairs.clear();
    }

    endFrame() {
        for (const pairKey of this.activeCollisionPairs) {
            if (!this.seenCollisionPairs.has(pairKey)) {
                this.activeCollisionPairs.delete(pairKey);
                this.warmStartImpulses.delete(pairKey);
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
        newCircle.vy = newVy;

        return newCircle;

    }

    resolveVelocityCircleToCircle(colliderA, colliderB) {
        const pairKey = this.getPairKey(colliderA, colliderB);
        this.seenCollisionPairs.add(pairKey);
        const isNewCollision = !this.activeCollisionPairs.has(pairKey);

        const { normal: vCollisionNorm } = Physics.computeCollisionNormalAndDistance(colliderA, colliderB);
        const rv = Physics.getRelativeVelocity(colliderA, colliderB);
        const relativeSpeed = rv.x * vCollisionNorm.x + rv.y * vCollisionNorm.y;
        const isVerticalHit = Math.abs(vCollisionNorm.y) > 0.5;
        const restitution = (isNewCollision && isVerticalHit && Math.abs(relativeSpeed) > 100) ? PhysicsConfig.restitution : 0;
        const impulseResult = Physics.computeImpulseVelocity(colliderA, colliderB, vCollisionNorm, restitution);

        let normalImpulse = 0;
        if (impulseResult !== undefined) {
            const rawImpulse = Math.sqrt(impulseResult.impulse.x ** 2 + impulseResult.impulse.y ** 2);
            const oldImpulse = this.warmStartImpulses.get(pairKey) || 0;
            const newImpulse = Math.max(0, oldImpulse + rawImpulse);
            const appliedImpulseMag = newImpulse - oldImpulse;
            this.warmStartImpulses.set(pairKey, newImpulse);

            if (appliedImpulseMag > 0) {
                const appliedImpulse = {
                    x: appliedImpulseMag * vCollisionNorm.x,
                    y: appliedImpulseMag * vCollisionNorm.y
                };
                Physics.applyImpulse(colliderA, colliderB, appliedImpulse);
            }
            normalImpulse = appliedImpulseMag;
        }

        if (!isNewCollision) {
            Physics.pinRestingContactVelocity(colliderA, colliderB, vCollisionNorm);
        }

        if (isNewCollision) this.activeCollisionPairs.add(pairKey);
        return { normal: vCollisionNorm, normalImpulse };
    }

    resolveNormalCircleToCircle(colliderA, colliderB) {
        const { normal, distance } = Physics.computeCollisionNormalAndDistance(colliderA, colliderB);
        const penetration = Physics.resolvePenetration(colliderA, colliderB, normal, distance);
        const velResult = this.resolveVelocityCircleToCircle(colliderA, colliderB);

        return { normal: velResult.normal, normalImpulse: velResult.normalImpulse, penetration };
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

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

    // (circleCollider, circleCollider) -> void
    resolveCollisionCircleToCircleByPush(colliderA, colliderB) {
        const pairKey = this.getPairKey(colliderA, colliderB);
        this.seenContactPairs.add(pairKey);

        const { normal: vCollisionNorm, distance } = Physics.computeCollisionNormalAndDistance(colliderA, colliderB);

        Physics.resolvePenetration(colliderA, colliderB, vCollisionNorm, distance);
        const impulseResult = Physics.computeImpulseVelocity(colliderA, colliderB, vCollisionNorm);

        if (impulseResult === undefined) return;

        const { impulse } = impulseResult;

        Physics.applyImpulse(colliderA, colliderB, impulse);

        if (!this.activeContactPairs.has(pairKey)) {
            Physics.updateAngularVelocity(colliderA, colliderB, vCollisionNorm);
            this.activeContactPairs.add(pairKey);
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

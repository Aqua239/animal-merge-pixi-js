import { CircleCollider } from "../system/circleCollider.js";
import { PhysicsConfig, ANIMAL_LEVEL } from "../../constant.js";
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

    // (CircleCollider, CircleCollider) -> Boolean, has Collision: true
    detectCollisionCircleToCircle(colliderA, colliderB) {
        let dx = colliderA.x - colliderB.x;
        let dy = colliderA.y - colliderB.y;
        let distance = dx * dx + dy * dy;
        let radiusSum = colliderA.radius + colliderB.radius;
        return distance <= radiusSum * radiusSum;
    }

    //(circleCollider, x, width) -> void
    detectAndHandleCollisionCircleOnLeftRight(collider, x, width) {
        if (collider.x - collider.radius <= x) {
            collider.vx = Math.abs(collider.vx) * this.restitution;
            collider.x = x + collider.radius;
        }
        if (collider.x + collider.radius >= x + width) {
            collider.vx = -Math.abs(collider.vx) * this.restitution;
            collider.x = x + width - collider.radius;
        }
    }

    detectAndHandleCollisionCircleInBottom(collider, y, height) {
        if (collider.y + collider.radius >= y + height) {
            collider.vy = -Math.abs(collider.vy) * this.restitution;
            collider.y = y + height - collider.radius;

            if (Math.abs(collider.vy) < PhysicsConfig.stopVthreshold) {
                collider.vy = 0;
            }

            // rolling friction
            let contactVx = collider.vx - (collider.angularVelocity * collider.radius);
            if (Math.abs(contactVx) > 0.1) {
                let frictionImpulse = -contactVx * PhysicsConfig.FRICTION;
                collider.vx += frictionImpulse;
                let spinDelta = -(frictionImpulse / collider.radius) * PhysicsConfig.spinFactor * 100;

                collider.angularVelocity += spinDelta;
                collider.angularVelocity = Math.max(
                    -PhysicsConfig.maxAngularVelocity,
                    Math.min(PhysicsConfig.maxAngularVelocity, collider.angularVelocity)
                );
            }
        }
    }

    //Check collision of circle with top to gameover
    detectCollisionCircleOverTop(collider, y) {
        if (collider.y - collider.radius <= y) {
            return true;
        }
        return false;
    }

    //(circleCollider, box(x,y,width,height))
    detectAndHandleCollisionCircleToBox(collider, box) {
        this.detectAndHandleCollisionCircleOnLeftRight(collider, box.x, box.width);
        this.detectAndHandleCollisionCircleInBottom(collider, box.y, box.height);
    }

    // (circleCollider, circleCollider) -> void
    resolveCollisionCircleToCircleByPush(colliderA, colliderB) {
        const pairKey = this.getPairKey(colliderA, colliderB);
        this.seenContactPairs.add(pairKey);

        const { normal: vCollisionNorm, distance } = this.computeCollisionNormalAndDistance(colliderA, colliderB);

        this.resolvePenetration(colliderA, colliderB, vCollisionNorm, distance);
        const impulseResult = this.computeImpulseVelocity(colliderA, colliderB, vCollisionNorm);

        if (impulseResult === undefined) return;

        const { impulse } = impulseResult;

        this.applyImpulse(colliderA, colliderB, impulse);

        if (!this.activeContactPairs.has(pairKey)) {
            this.updateAngularVelocity(colliderA, colliderB, vCollisionNorm);
            this.activeContactPairs.add(pairKey);
        }
    }

    //Handle collision between 2 colliders by merge
    resolveCollisionCircleToCircleByMerge(colliderA, colliderB) {
        let newRadius = this.computeNewRadiusByLevel(colliderA, colliderB);
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

    //compute normal, distance
    computeCollisionNormalAndDistance(colliderA, colliderB) {
        const vCollision = {
            x: colliderB.x - colliderA.x,
            y: colliderB.y - colliderA.y,
        };

        let distance = Math.sqrt(
            vCollision.x * vCollision.x + vCollision.y * vCollision.y
        );

        let vCollisionNorm;
        //fix divide by 0
        if (distance === 0) {
            vCollisionNorm = { x: 1, y: 0 };
            distance = 1;
        } else {
            vCollisionNorm = {
                x: vCollision.x / distance,
                y: vCollision.y / distance,
            };
        }

        return { normal: vCollisionNorm, distance: distance };
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

    //Handle penetration issue between 2 colliders
    resolvePenetration(colliderA, colliderB, normal, distance) {
        const penetration = colliderA.radius + colliderB.radius - distance;

        const invMassA = 1 / colliderA.computeMass();
        const invMassB = 1 / colliderB.computeMass();

        const correction = penetration / (invMassA + invMassB);

        colliderA.x -= correction * invMassA * normal.x;
        colliderA.y -= correction * invMassA * normal.y;

        colliderB.x += correction * invMassB * normal.x;
        colliderB.y += correction * invMassB * normal.y;
    }

    //Compute impluse veclocity
    computeImpulseVelocity(colliderA, colliderB, normal) {
        const invMassA = 1 / colliderA.computeMass();
        const invMassB = 1 / colliderB.computeMass();

        const rv = this.getRelativeVelocity(colliderA, colliderB);

        const speed = rv.x * normal.x + rv.y * normal.y;

        if (speed > 0) return;

        const j = (-(1 + this.restitution) * speed) / (invMassA + invMassB);

        const impulse = {
            x: j * normal.x,
            y: j * normal.y,
        };

        return { impulse };
    }

    //Update vecto vx,vy of collider based on gravity and friction
    applyImpulse(colliderA, colliderB, impluse) {

        if (impluse === undefined) return;

        const invMassA = 1 / colliderA.computeMass();
        const invMassB = 1 / colliderB.computeMass();

        colliderA.vx -= impluse.x * invMassA;
        colliderA.vy -= impluse.y * invMassA;

        colliderB.vx += impluse.x * invMassB;
        colliderB.vy += impluse.y * invMassB;
    }

    getRelativeVelocity(colliderA, colliderB) {
        return {
            x: colliderB.vx - colliderA.vx,
            y: colliderB.vy - colliderA.vy,
        };
    }

    updateAngularVelocity(colliderA, colliderB, normal) {
        const tangent = {
            x: -normal.y,
            y: normal.x,
        };

        const tangentSpeed =
            (colliderB.vx - colliderA.vx) * tangent.x +
            (colliderB.vy - colliderA.vy) * tangent.y;

        if (Math.abs(tangentSpeed) < PhysicsConfig.spinThreshold) {
            return;
        }

        const spinDelta = Math.max(
            -PhysicsConfig.maxAngularVelocity,
            Math.min(PhysicsConfig.maxAngularVelocity, tangentSpeed * PhysicsConfig.spinFactor)
        );

        colliderA.angularVelocity = -spinDelta;
        colliderB.angularVelocity = spinDelta;

        colliderA.angularVelocity = Math.max(-PhysicsConfig.maxAngularVelocity, Math.min(PhysicsConfig.maxAngularVelocity, colliderA.angularVelocity));
        colliderB.angularVelocity = Math.max(-PhysicsConfig.maxAngularVelocity, Math.min(PhysicsConfig.maxAngularVelocity, colliderB.angularVelocity));
    }
}

import { PhysicsConfig } from "../../constant.js";
export class Physics {

    constructor() {
    }

    //Handle penetration issue between 2 colliders
    static resolvePenetration(colliderA, colliderB, normal, distance) {
        const penetration = colliderA.radius + colliderB.radius - distance;

        const invMassA = 1 / colliderA.computeMass();
        const invMassB = 1 / colliderB.computeMass();

        const correction = penetration / (invMassA + invMassB);

        colliderA.x -= correction * invMassA * normal.x;
        colliderA.y -= correction * invMassA * normal.y;

        colliderB.x += correction * invMassB * normal.x;
        colliderB.y += correction * invMassB * normal.y;
    }

    //Compute vector
    static computeNewRadiusByLevel(colliderA, colliderB) {
        if (colliderA.radius !== colliderB.radius) return;
        const levelA = colliderA.getLevel();
        let newradius = ANIMAL_LEVEL[levelA + 1].radius;
        return newradius;
    }

    //compute normal, distance
    static computeCollisionNormalAndDistance(colliderA, colliderB) {
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

    //Compute impluse veclocity
    static computeImpulseVelocity(colliderA, colliderB, normal) {
        const invMassA = 1 / colliderA.computeMass();
        const invMassB = 1 / colliderB.computeMass();

        const rv = this.getRelativeVelocity(colliderA, colliderB);

        const speed = rv.x * normal.x + rv.y * normal.y;

        if (speed > 0) return;

        const j = (-(1 + PhysicsConfig.restitution) * speed) / (invMassA + invMassB);

        const impulse = {
            x: j * normal.x,
            y: j * normal.y,
        };

        return { impulse };
    }

    //Update vecto vx,vy of collider based on gravity and friction
    static applyImpulse(colliderA, colliderB, impluse) {

        if (impluse === undefined) return;

        const invMassA = 1 / colliderA.computeMass();
        const invMassB = 1 / colliderB.computeMass();

        colliderA.vx -= impluse.x * invMassA;
        colliderA.vy -= impluse.y * invMassA;

        colliderB.vx += impluse.x * invMassB;
        colliderB.vy += impluse.y * invMassB;
    }

    static getRelativeVelocity(colliderA, colliderB) {
        return {
            x: colliderB.vx - colliderA.vx,
            y: colliderB.vy - colliderA.vy,
        };
    }

    static updateAngularVelocity(colliderA, colliderB, normal) {
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

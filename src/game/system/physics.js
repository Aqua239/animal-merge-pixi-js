import { PhysicsConfig, ANIMAL_LEVEL } from "../../constant.js";

export class Physics {

    constructor() {
    }

    //Handle penetration issue between 2 colliders
    static resolvePenetration(colliderA, colliderB, normal, distance) {
        const penetration = colliderA.radius + colliderB.radius - distance;

        const slop = PhysicsConfig.baumgarteSlop;
        const percent = PhysicsConfig.baumgartePercent;

        const penetrationCorrection = Math.max(0, penetration - slop);
        if (penetrationCorrection <= 0) return 0;

        const invMassA = 1 / colliderA.computeMass();
        const invMassB = 1 / colliderB.computeMass();

        const correction = (penetrationCorrection / (invMassA + invMassB)) * percent;

        colliderA.x -= correction * invMassA * normal.x;
        colliderA.y -= correction * invMassA * normal.y;

        colliderB.x += correction * invMassB * normal.x;
        colliderB.y += correction * invMassB * normal.y;

        return penetrationCorrection;
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
    static computeImpulseVelocity(colliderA, colliderB, normal, restitution = PhysicsConfig.restitution) {
        const invMassA = 1 / colliderA.computeMass();
        const invMassB = 1 / colliderB.computeMass();

        const rv = this.getRelativeVelocity(colliderA, colliderB);
        const speed = rv.x * normal.x + rv.y * normal.y;

        if (speed > 0) return;

        let j = (-(1 + restitution) * speed) / (invMassA + invMassB);

        //limit impluse
        const maxImpulse = PhysicsConfig.maxImpulse;
        j = Math.max(-maxImpulse, Math.min(maxImpulse, j));

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

    static applyRollingFrictionCircleToCircle(colliderA, colliderB, normal, normalImpulse = 0) {
        const baseThreshold = PhysicsConfig.rollingStaticSpeedThreshold;
        const speedThresholdA = baseThreshold * (245 / colliderA.radius);
        const speedThresholdB = baseThreshold * (245 / colliderB.radius);
        const isStaticA = Math.abs(colliderA.prevVx) < speedThresholdA && Math.abs(colliderA.prevVy) < speedThresholdA;
        const isStaticB = Math.abs(colliderB.prevVx) < speedThresholdB && Math.abs(colliderB.prevVy) < speedThresholdB;

        // Keep rolling resistance active to drain spin when touching/resting
        colliderA.angularVelocity *= isStaticA ? PhysicsConfig.rollingStaticDamping : PhysicsConfig.rollingMovingDamping;
        colliderB.angularVelocity *= isStaticB ? PhysicsConfig.rollingStaticDamping : PhysicsConfig.rollingMovingDamping;

        const tangent = { x: -normal.y, y: normal.x };

        const vA_contact = (colliderA.vx * tangent.x + colliderA.vy * tangent.y) + colliderA.angularVelocity * colliderA.radius;
        const vB_contact = (colliderB.vx * tangent.x + colliderB.vy * tangent.y) - colliderB.angularVelocity * colliderB.radius;

        const slip = vA_contact - vB_contact;
        // circle-circle
        if (Math.abs(slip) < 0.5) {
            colliderA.angularVelocity = isStaticA ? 0 : Math.max(-PhysicsConfig.maxAngularVelocity, Math.min(PhysicsConfig.maxAngularVelocity, colliderA.angularVelocity));
            colliderB.angularVelocity = isStaticB ? 0 : Math.max(-PhysicsConfig.maxAngularVelocity, Math.min(PhysicsConfig.maxAngularVelocity, colliderB.angularVelocity));
            return;
        }

        const { invMass: invMassA, invI: invIA } = this.computeColliderInertia(colliderA);
        const { invMass: invMassB, invI: invIB } = this.computeColliderInertia(colliderB);

        const effectiveMass = invMassA + invMassB + colliderA.radius * colliderA.radius * invIA + colliderB.radius * colliderB.radius * invIB;

        const frictionImpulse = this.computeClampedFrictionImpulse(slip, effectiveMass, normalImpulse);

        colliderA.vx += frictionImpulse * invMassA * tangent.x;
        colliderA.vy += frictionImpulse * invMassA * tangent.y;
        colliderB.vx -= frictionImpulse * invMassB * tangent.x;
        colliderB.vy -= frictionImpulse * invMassB * tangent.y;

        let deltaWA = frictionImpulse * colliderA.radius * invIA;
        let deltaWB = frictionImpulse * colliderB.radius * invIB;

        // Prevent angular velocity overshoot by clamping it to the required change to make slip 0
        const maxDeltaWA = Math.abs(slip) / colliderA.radius;
        const maxDeltaWB = Math.abs(slip) / colliderB.radius;

        if (Math.abs(deltaWA) > maxDeltaWA) deltaWA = Math.sign(deltaWA) * maxDeltaWA;
        if (Math.abs(deltaWB) > maxDeltaWB) deltaWB = Math.sign(deltaWB) * maxDeltaWB;

        colliderA.angularVelocity += deltaWA;
        colliderB.angularVelocity += deltaWB;

        colliderA.angularVelocity = Math.max(-PhysicsConfig.maxAngularVelocity, Math.min(PhysicsConfig.maxAngularVelocity, colliderA.angularVelocity));
        colliderB.angularVelocity = Math.max(-PhysicsConfig.maxAngularVelocity, Math.min(PhysicsConfig.maxAngularVelocity, colliderB.angularVelocity));
    }

    // Impulse-based floor rolling friction
    static applyRollingFrictionCircleToGround(collider, normalImpulse = 0) {
        const speedThreshold = PhysicsConfig.rollingStaticSpeedThreshold * (245 / collider.radius);
        const isStatic = Math.abs(collider.prevVx) < speedThreshold
            && Math.abs(collider.prevVy) < speedThreshold;

        const slip = collider.vx - collider.angularVelocity * collider.radius;
        if (Math.abs(slip) < 0.5) {
            collider.angularVelocity = isStatic ? 0 : Math.max(-PhysicsConfig.maxAngularVelocity, Math.min(PhysicsConfig.maxAngularVelocity, collider.angularVelocity));
            return;
        }

        const { invMass, invI } = this.computeColliderInertia(collider);

        //effectiveMass = invMass + radius * radius * invI
        const effectiveMass = invMass + collider.radius * collider.radius * invI;

        const frictionImpulse = this.computeClampedFrictionImpulse(-slip, effectiveMass, normalImpulse);

        collider.vx -= frictionImpulse * invMass;

        let deltaW = frictionImpulse * collider.radius * invI;
        const maxDeltaW = Math.abs(slip) / collider.radius;
        if (Math.abs(deltaW) > maxDeltaW) deltaW = Math.sign(deltaW) * maxDeltaW;

        collider.angularVelocity += deltaW;
        collider.angularVelocity = Math.max(-PhysicsConfig.maxAngularVelocity, Math.min(PhysicsConfig.maxAngularVelocity, collider.angularVelocity));
    }

    static updateAngularVelocity(colliderA, colliderB, normal) {
        const tangent = { x: -normal.y, y: normal.x };
        const tangentSpeed = (colliderB.vx - colliderA.vx) * tangent.x + (colliderB.vy - colliderA.vy) * tangent.y;

        if (Math.abs(tangentSpeed) < PhysicsConfig.spinThreshold) {
            return;
        }

        const spinDelta = Math.max(-PhysicsConfig.maxAngularVelocity, Math.min(PhysicsConfig.maxAngularVelocity, tangentSpeed * PhysicsConfig.spinFactor));

        colliderA.angularVelocity += spinDelta;
        colliderB.angularVelocity += spinDelta;

        colliderA.angularVelocity = Math.max(-PhysicsConfig.maxAngularVelocity, Math.min(PhysicsConfig.maxAngularVelocity, colliderA.angularVelocity));
        colliderB.angularVelocity = Math.max(-PhysicsConfig.maxAngularVelocity, Math.min(PhysicsConfig.maxAngularVelocity, colliderB.angularVelocity));
    }

    static computeColliderInertia(collider) {
        const invMass = 1 / collider.computeMass();
        // Use 300 * invMass / r^2 to balance highly responsive angular rotation
        // while avoiding clamping overshoot oscillation for small circles (first 4 levels)
        const invI = 300 * invMass / (collider.radius * collider.radius);
        return { invMass, invI };
    }

    static computeClampedFrictionImpulse(slip, effectiveMass, normalImpulse) {
        let frictionImpulse = -slip / effectiveMass;
        const maxFriction = PhysicsConfig.FRICTION * normalImpulse;
        if (Math.abs(frictionImpulse) > maxFriction) {
            frictionImpulse = Math.sign(frictionImpulse) * maxFriction;
        }
        return frictionImpulse;
    }

    // Process resting contact to prevent jittering and sliding of stacked circles
    static pinRestingContactVelocity(colliderA, colliderB, normal) {
        const invMassA = 1 / colliderA.computeMass();
        const invMassB = 1 / colliderB.computeMass();

        const rv = this.getRelativeVelocity(colliderA, colliderB);
        const speed = rv.x * normal.x + rv.y * normal.y;

        if (speed >= 0) return; // It's separating, no need to force

        const j = -speed / (invMassA + invMassB);
        colliderA.vx -= j * invMassA * normal.x;
        colliderA.vy -= j * invMassA * normal.y;
        colliderB.vx += j * invMassB * normal.x;
        colliderB.vy += j * invMassB * normal.y;
    }
}

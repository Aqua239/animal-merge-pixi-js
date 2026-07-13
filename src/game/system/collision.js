import { CircleCollider } from "../system/circleCollider.js";
import { PhysicsConfig } from "../system/physicConfig.js";

export class Collision {

    constructor() {
        this.restitution = PhysicsConfig.restitution;
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
        const { normal: vCollisionNorm, distance } = this.computeCollisionNormalAndDistance(colliderA, colliderB);

        //Update positions to resolve penetration
        this.resolvePenetration(colliderA, colliderB, vCollisionNorm, distance);
        const contactPoint = this.computeContactPoint(colliderA, colliderB, vCollisionNorm);
        const impulseResult = this.computeImpulseVelocity(colliderA, colliderB, vCollisionNorm);

        if (impulseResult === undefined) return;

        const { j, impulse } = impulseResult;

        this.applyImpulse(colliderA, colliderB, impulse);
        const frictionImpulse = this.computeFrictionImpulse(colliderA, colliderB, vCollisionNorm, j);
        // this.applyImpulse(colliderA, colliderB, frictionImpulse);

        this.updateAngularVelocity(colliderA, colliderB, frictionImpulse, contactPoint);
        console.log("Angular Velocity A:", colliderA.angularVelocity, "Angular Velocity B:", colliderB.angularVelocity);

    }


    //Handle collision between 2 colliders by merge
    resolveCollisionCircleToCircleByMerge(colliderA, colliderB) {
        let newRadius = colliderA.radius + colliderB.radius;
        let newCircle = new CircleCollider(
            (colliderA.x + colliderB.x) / 2,
            (colliderA.y + colliderB.y) / 2,
            newRadius
        );

        const m1 = colliderA.computeMass();
        const m2 = colliderB.computeMass();

        const newVx = (m1 * colliderA.vx + m2 * colliderB.vx) / (m1 + m2);

        const newVy = (m1 * colliderA.vy + m2 * colliderB.vy) / (m1 + m2);

        newCircle.vx = newVx;
        newCircle.vy = newVy;

        return newCircle;

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

        return { j, impulse };
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

    //rotation helpers
    computeRotationalVelocity(collider, contactPoint) {
        const r = this.computeLeverArm(collider, contactPoint);

        const rotationalVelocity = {
            x: -collider.angularVelocity * r.y,
            y: collider.angularVelocity * r.x,
        };
        return rotationalVelocity;
    }

    computeContactPoint(colliderA, colliderB, normal) {
        const dx = colliderB.x - colliderA.x;
        const dy = colliderB.y - colliderA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) {
            return { x: colliderA.x, y: colliderA.y };
        }

        const depth = colliderA.radius + colliderB.radius - distance;
        const contactDistance = colliderA.radius - (depth / 2);

        return {
            x: colliderA.x + normal.x * contactDistance,
            y: colliderA.y + normal.y * contactDistance
        };
    }

    computeLeverArm(collider, contactPoint) {

        return {
            x: contactPoint.x - collider.x,
            y: contactPoint.y - collider.y,
        };
    }

    computeFrictionImpulse(colliderA, colliderB, normal, normalImpulse) {
        const contactPoint = this.computeContactPoint(colliderA, colliderB, normal);

        const rotA = this.computeRotationalVelocity(colliderA, contactPoint);
        const rotB = this.computeRotationalVelocity(colliderB, contactPoint);

        const velA = {
            x: colliderA.vx + rotA.x,
            y: colliderA.vy + rotA.y,
        };

        const velB = {
            x: colliderB.vx + rotB.x,
            y: colliderB.vy + rotB.y,
        };

        const rv = {
            x: velB.x - velA.x,
            y: velB.y - velA.y,
        };

        const speed = rv.x * normal.x + rv.y * normal.y;

        let tangent = {
            x: rv.x - speed * normal.x,
            y: rv.y - speed * normal.y,
        };

        const len = Math.hypot(tangent.x, tangent.y);

        if (len < 1e-6)
            return { x: 0, y: 0 };

        tangent.x /= len;
        tangent.y /= len;

        const vt = rv.x * tangent.x + rv.y * tangent.y;

        const invMassA = 1 / colliderA.computeMass();
        const invMassB = 1 / colliderB.computeMass();

        let jt = -vt / (invMassA + invMassB);

        const mu = 0.3;

        jt = Math.max(
            -mu * normalImpulse,
            Math.min(jt, mu * normalImpulse)
        );

        const frictionImpulse = { x: jt * tangent.x, y: jt * tangent.y };

        return frictionImpulse;
    }

    updateAngularVelocity(colliderA, colliderB, impulse, contactPoint) {
        if (!impulse) return;

        // Lever arm from the center to the contact point
        const rA = {
            x: contactPoint.x - colliderA.x,
            y: contactPoint.y - colliderA.y,
        };

        const rB = {
            x: contactPoint.x - colliderB.x,
            y: contactPoint.y - colliderB.y,
        };

        // Torque = r × J
        const torqueA = rA.x * impulse.y - rA.y * impulse.x;

        const torqueB = rB.x * impulse.y - rB.y * impulse.x;

        // Moment of inertia
        const inertiaA = colliderA.computeInertia();
        const inertiaB = colliderB.computeInertia();

        // Δω = τ / I
        colliderA.angularVelocity += torqueA / inertiaA;

        // B get -impluse
        colliderB.angularVelocity -= torqueB / inertiaB;
    }
}

import { Collider } from "./collider.js";
import { ANIMAL_LEVEL, PhysicsConfig } from "../../constant";
import { Physics } from "./physics.js";

export class CircleCollider extends Collider {
    constructor(x, y, radius) {
        super(x, y);
        this.radius = radius;
        this.angle = 0;           // rad
        this.angularVelocity = 0; // rad/s — only meaningful while on floor
        this.prevVx = 0;
        this.prevVy = 0;
        this.stableTime = 0;
    }

    update(timestep) {
        this.prevVx = this.vx;
        this.prevVy = this.vy;

        // If both velocities are below the threshold, the object is at rest.
        if (Math.abs(this.vx) < PhysicsConfig.stopVthreshold && Math.abs(this.vy) < PhysicsConfig.stopVthreshold) {
            this.vx = 0;
            this.vy = 0;
            this.angularVelocity = 0;
        }

        // Gravity + linear damping
        this.vy += PhysicsConfig.gravity * timestep;
        this.vx *= Math.exp(-PhysicsConfig.linearDamping * timestep);

        // Spin decay
        this.angularVelocity *= Math.exp(-PhysicsConfig.angularDamping * timestep);
        if (Math.abs(this.angularVelocity) < PhysicsConfig.angularStopThreshold) {
            this.angularVelocity = 0;
        }

        this.angle += this.angularVelocity * timestep;
        super.update(timestep);
    }

    computeMass() {
        return Math.PI * this.radius * this.radius;
    }

    getLevel() {
        for (let level in ANIMAL_LEVEL) {
            if (ANIMAL_LEVEL[level].radius === this.radius) {
                return parseInt(level);
            }
        }
        return null;
    }

    // (CircleCollider, CircleCollider) -> Boolean
    checkCollisionWithCircle(colliderOther) {
        const dx = this.x - colliderOther.x;
        const dy = this.y - colliderOther.y;
        const radiusSum = this.radius + colliderOther.radius;
        return dx * dx + dy * dy < radiusSum * radiusSum;
    }

    checkCollisionCircleOnLeftRight(x, width) {
        if (this.x - this.radius < x) {
            this.vx = Math.abs(this.vx) * PhysicsConfig.restitution;
            this.x = x + this.radius;
        }
        if (this.x + this.radius > x + width) {
            this.vx = -Math.abs(this.vx) * PhysicsConfig.restitution;
            this.x = x + width - this.radius;
        }
    }

    checkCollisionCircleInBottom(y, height) {
        if (this.y + this.radius > y + height) {
            this.vy = -Math.abs(this.vy) * PhysicsConfig.restitution;
            this.y = y + height - this.radius;

            if (Math.abs(this.vy) < PhysicsConfig.stopVthreshold) this.vy = 0;

            if (Math.abs(this.vx) < PhysicsConfig.stopVthreshold) {
                this.vx = 0;
                this.angularVelocity = 0;
            } else {
                const normalImpulse = this.computeMass() * PhysicsConfig.gravity * 0.016 / 10;
                Physics.applyRollingFrictionCircleToGround(this, normalImpulse);
            }
        }
    }

    checkCollisionCircleToBox(box) {
        this.checkCollisionCircleOnLeftRight(box.x, box.width);
        this.checkCollisionCircleInBottom(box.y, box.height);
    }

    checkCollisionCircleOverTop(y) {
        return this.y - this.radius <= y;
    }
}

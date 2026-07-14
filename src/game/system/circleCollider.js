import { Collider } from "./collider.js";
import { ANIMAL_LEVEL, PhysicsConfig } from "../../constant";

export class CircleCollider extends Collider {
    constructor(x, y, radius) {
        super(x, y);
        this.radius = radius;
        this.angle = 0;     //rad
        this.angularVelocity = 0;      //rad/s
    }

    update(timestep) {
        const g = PhysicsConfig.gravity;
        this.vy += g * timestep;
        this.vx *= Math.exp(-PhysicsConfig.linearDamping * timestep);

        if (Math.abs(this.vx) < PhysicsConfig.stopVthreshold) {
            this.vx = 0;
        }

        if (Math.abs(this.vy) < PhysicsConfig.stopVthreshold) {
            this.vy = 0;
        }

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

    // (CircleCollider, CircleCollider) -> Boolean, has Collision: true
    checkCollisionWithCircle(colliderOther) {
        let dx = this.x - colliderOther.x;
        let dy = this.y - colliderOther.y;
        let distance = dx * dx + dy * dy;
        let radiusSum = this.radius + colliderOther.radius;
        return distance <= radiusSum * radiusSum;
    }

    checkCollisionCircleOnLeftRight(x, width) {
        if (this.x - this.radius <= x) {
            this.vx = Math.abs(this.vx) * PhysicsConfig.restitution;
            this.x = x + this.radius;
        }
        if (this.x + this.radius >= x + width) {
            this.vx = -Math.abs(this.vx) * PhysicsConfig.restitution;
            this.x = x + width - this.radius;
        }
    }

    checkCollisionCircleInBottom(y, height) {
        if (this.y + this.radius >= y + height) {
            this.vy = -Math.abs(this.vy) * PhysicsConfig.restitution;
            this.y = y + height - this.radius;

            if (Math.abs(this.vy) < PhysicsConfig.stopVthreshold) {
                this.vy = 0;
            }

            // rolling friction
            this.rollingFriction();
            // console.log("rolling friction: vx = ", this.vx, "angularVelocity = ", this.angularVelocity);
        }
    }

    rollingFriction() {
        let contactVx = this.vx - (this.angularVelocity * this.radius);
        if (Math.abs(contactVx) > 0.1) {
            let frictionImpulse = -contactVx * PhysicsConfig.FRICTION;
            this.vx += frictionImpulse;
            let spinDelta = -(frictionImpulse / this.radius) * PhysicsConfig.spinFactor * 100;

            this.angularVelocity += spinDelta;
            this.angularVelocity = Math.max(
                -PhysicsConfig.maxAngularVelocity,
                Math.min(PhysicsConfig.maxAngularVelocity, this.angularVelocity)
            );
        }
    }
    //box(x,y,width,height)
    checkCollisionCircleToBox(box) {
        this.checkCollisionCircleOnLeftRight(box.x, box.width);
        this.checkCollisionCircleInBottom(box.y, box.height);
    }

    //Check collision of circle with top to gameover
    checkCollisionCircleOverTop(y) {
        if (this.y - this.radius <= y) {
            return true;
        }
        return false;
    }
}

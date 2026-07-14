import { Collider } from "./collider.js";
import { PhysicsConfig } from "./physicConfig.js";

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
}

import { Collider } from "./collider.js";

export class CircleCollider extends Collider {
    constructor(x, y, radius) {
        super(x, y);
        this.radius = radius;
    }

    update(timestep) {
        const g = 9.81;
        this.vy += g * timestep;
        super.update(timestep);
    }

    computeMass() {
        return Math.PI * this.radius * this.radius;
    }
}

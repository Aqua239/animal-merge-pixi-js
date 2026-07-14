import { PhysicsConfig } from "../../constant.js";
export class Collider {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = PhysicsConfig.initialVelocityX;
        this.vy = PhysicsConfig.initialVelocityY;
    }

    update(timestep) {
        this.x = this.x + this.vx * timestep;
        this.y = this.y + this.vy * timestep;
    }
}

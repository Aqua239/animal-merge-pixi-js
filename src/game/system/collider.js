class collider {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;

    }

    update(timestep) {
        this.x = this.x + this.vx * timestep;
        this.y = this.y + this.vy * timestep;
    }
}

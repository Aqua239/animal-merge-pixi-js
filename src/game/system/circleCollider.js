class circleCollider extends collider {
    constructor(x, y, radius) {
        super(x, y);
        this.radius = radius;
    }

    update(timestep) {
        super.update(timestep);
    }

    computeMass() {
        return Math.PI * this.radius * this.radius;
    }
}

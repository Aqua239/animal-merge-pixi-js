import CircleCollider from './circleCollider.js';
import Collision from './collision.js';

export default class Physics {

    constructor() {
        this.circleColliders = [];
        this.systemCollision = new Collision();
    }

    update(timestep) {
    }

    handleCollisionsCircleToCircle(circleColliderA, circleColliderB) {
    }

    //(CircleCollider, y) => boolean, if true --> gameover
    handleCollisionsCircleToTop(circleCollider, y) {
    }

    //(CircleCollider, Box (x,y,width,height)) => void
    handleCollisionsCircleToBox(circleCollider, Box) {
    }

    handleCollisionsAllCircles() {
        for (let i = 0; i < this.circleColliders.length; i++) {
            for (let j = i + 1; j < this.circleColliders.length; j++) {
                this.handleCollisionsCircleToCircle(this.circleColliders[i], this.circleColliders[j]);
            }
        }
    }

    handleCollisionsAllCirclesToTop(y) {
        for (const collider of this.circleColliders) {
            this.handleCollisionsCircleToTop(collider, y);
        }
    }

    handleCollisionsAllCirclesToBox(Box) {
        for (const collider of this.circleColliders) {
            this.handleCollisionsCircleToBox(collider, Box);
        }
    }
}

import { CircleCollider } from './circleCollider.js';
import { Collision } from './collision.js';

export class Physics {

    constructor() {
        this.circleColliders = [];
        this.box = null; // {x,y,width,height}
        this.systemCollision = new Collision();
    }

    update(timestep) {
        this.handleCollisionsAllCircles();
        this.handleCollisionsAllCirclesToBox(this.box);
        for (const collider of this.circleColliders) {
            collider.update(timestep);
        }
    }

    //pipeline
    // physics.beginFrame();
    // for --> physics.handleCollisionsCircleToCircle();
    // for --> physics.handleCollisionsCircleToTop();
    // physics.endFrame();
    //
    beginFrame() {
        this.systemCollision.beginFrame();
    }

    endFrame() {
        this.systemCollision.endFrame();
    }

    // If diff radius --> pussh --> return void
    // If same radius --> merge --> return new CircleCollider
    handleCollisionsCircleToCircle(circleColliderA, circleColliderB) {
        if (!this.systemCollision.detectCollisionCircleToCircle(circleColliderA, circleColliderB)) return;

        if (circleColliderA.radius == circleColliderB.radius) {
            return this.systemCollision.resolveCollisionCircleToCircleByMerge(circleColliderA, circleColliderB);
        } else {
            this.systemCollision.resolveCollisionCircleToCircleByPush(circleColliderA, circleColliderB);
        }
    }

    //(CircleCollider, y) => boolean, if true --> gameover
    handleCollisionsCircleToTop(circleCollider, y) {
        return this.systemCollision.detectCollisionCircleOverTop(circleCollider, y);
    }

    //(CircleCollider, Box (x,y,width,height)) => void
    handleCollisionsCircleToBox(circleCollider, Box) {
        this.systemCollision.detectAndHandleCollisionCircleToBox(circleCollider, Box);
    }

    //Additional methods
    handleCollisionsAllCircles() {
        // for (let i = 0; i < this.circleColliders.length; i++) {
        //     for (let j = i + 1; j < this.circleColliders.length; j++) {
        //         const circleColliderA = this.circleColliders[i];
        //         const circleColliderB = this.circleColliders[j];

        //         if (!this.systemCollision.detectCollisionCircleToCircle(circleColliderA, circleColliderB)) continue;

        //         if (circleColliderA.radius == circleColliderB.radius) {
        //             let newCircle = this.systemCollision.resolveCollisionCircleToCircleByMerge(circleColliderA, circleColliderB);
        //             this.circleColliders.splice(j, 1);
        //             this.circleColliders.splice(i, 1);
        //             i--;
        //             j--;
        //             this.circleColliders.push(newCircle);
        //         } else {
        //             this.systemCollision.resolveCollisionCircleToCircleByPush(circleColliderA, circleColliderB);
        //         }
        //     }
        // }
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

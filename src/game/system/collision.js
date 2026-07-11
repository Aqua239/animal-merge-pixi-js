import { CircleCollider } from "../system/circleCollider.js";

export class Collision {

    constructor() {
        this.restitution = 0.7;
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

        //Update positions to resolve penetration
        this.resolvePenetration(colliderA, colliderB, vCollisionNorm, distance);

        this.updateVelocity(colliderA, colliderB, vCollisionNorm);
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

    //Handle penetration issue between 2 colliders
    resolvePenetration(colliderA, colliderB, normal, distance) {
        const penetration = colliderA.radius + colliderB.radius - distance;
        if (penetration <= 0) return;

        const invMassA = 1 / colliderA.computeMass();
        const invMassB = 1 / colliderB.computeMass();

        const correction = penetration / (invMassA + invMassB);

        colliderA.x -= correction * invMassA * normal.x;
        colliderA.y -= correction * invMassA * normal.y;

        colliderB.x += correction * invMassB * normal.x;
        colliderB.y += correction * invMassB * normal.y;
    }

    //Update vecto vx,vy of collider based on gravity and friction
    updateVelocity(colliderA, colliderB, normal) {
        const invMassA = 1 / colliderA.computeMass();
        const invMassB = 1 / colliderB.computeMass();

        const rv = this.getRelativeVelocity(colliderA, colliderB);

        const speed = rv.x * normal.x + rv.y * normal.y;

        if (speed > 0) return;

        const j = (-(1 + this.restitution) * speed) / (invMassA + invMassB);

        colliderA.vx -= j * normal.x * invMassA;
        colliderA.vy -= j * normal.y * invMassA;

        colliderB.vx += j * normal.x * invMassB;
        colliderB.vy += j * normal.y * invMassB;
    }

    getRelativeVelocity(colliderA, colliderB) {
        return {
            x: colliderB.vx - colliderA.vx,
            y: colliderB.vy - colliderA.vy,
        };
    }
}

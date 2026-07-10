export class collision {

    constructor() {
        this.restitution = 0.3;
    }

    // (circleCollider, circleCollider) -> Boolean, has Collision: true
    detectCollisionCircletoCircle(colliderA, colliderB) {
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
    resolveCollisionCircletoCircle(colliderA, colliderB) {
        // console.log("Resolving collision between circle A and circle B");
        let vCollision = { x: colliderB.x - colliderA.x, y: colliderB.y - colliderA.y };
        let distance = Math.sqrt(vCollision.x * vCollision.x + vCollision.y * vCollision.y);
        let vCollisionNorm = { x: vCollision.x / distance, y: vCollision.y / distance };
        let vRelativeVelocity = { x: colliderA.vx - colliderB.vx, y: colliderA.vy - colliderB.vy };
        let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
        if (speed < 0) {
            return;
        }

        console.log("Tính toán xong vecto")
        console.log("colliderA.x: " + colliderA.x + ", colliderA.y: " + colliderA.y);
        console.log("colliderB.x: " + colliderB.x + ", colliderB.y: " + colliderB.y);
        speed *= this.restitution;

        //update
        let impulse = (2 * speed) / (colliderA.computeMass() + colliderB.computeMass());
        colliderA.vx -= (impulse * colliderB.computeMass() * vCollisionNorm.x);
        colliderA.vy -= (impulse * colliderB.computeMass() * vCollisionNorm.y);
        colliderB.vx += (impulse * colliderA.computeMass() * vCollisionNorm.x);
        colliderB.vy += (impulse * colliderA.computeMass() * vCollisionNorm.y);
    }


}

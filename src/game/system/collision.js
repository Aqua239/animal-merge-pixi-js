export class collision {

    // (circleCollider, circleCollider) -> Boolean, has Collision: true
    detectCollisionCircletoCircle(colliderA, colliderB) {
        let dx = colliderA.x - colliderB.x;
        let dy = colliderA.y - colliderB.y;
        let distance = dx * dx + dy * dy;
        let radiusSum = colliderA.radius + colliderB.radius;
        return distance <= radiusSum * radiusSum;
    }

    //(circleCollider, x, width) -> Boolean, has Collision: true
    detectCollisionCircleOnLeftRight(collider, x, width) {
        if (collider.x - collider.radius <= x) {
            return true;
        }
        if (collider.x + collider.radius >= x + width) {
            return true;
        }
        return false;
    }

    detectCollisionCircleInBottom(collider, y, height) {
        if (collider.y + collider.radius >= y + height) {
            return true;
        }
        return false;
    }

    detectCollisionCircleOverTop(collider, y) {
        if (collider.y - collider.radius <= y) {
            return true;
        }
        return false;
    }

    //(circleCollider, box(x,y,width,height)) -> Boolean, has Collision: true
    detectCollisionCircleToBox(collider, box) {
        console.log("detectCollisionCircleToBox: " + collider.x + ", " + collider.y + ", " + collider.radius);
        console.log("Box: x: " + box.x + ", y: " + box.y + ", width: " + box.width + ", height: " + box.height);
        return this.detectCollisionCircleOnLeftRight(collider, box.x, box.width) ||
            this.detectCollisionCircleInBottom(collider, box.y, box.height);
    }

    // (circleCollider, circleCollider) -> void
    resolveCollisionCircletoCircle(colliderA, colliderB) {
        // let vCollision = { x: colliderB.x - colliderA.x, y: colliderB.y - colliderA.y };
        // let distance = Math.sqrt(vCollision.x * vCollision.x + vCollision.y * vCollision.y);
        // let vCollisionNorm = { x: vCollision.x / distance, y: vCollision.y / distance };
        // let vRelativeVelocity = { x: colliderA.vx - colliderB.vx, y: colliderA.vy - colliderB.vy };
        // let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
        // if (speed < 0) {
        //     return;
        // }

        // //update
        // let impulse = (2 * speed) / (colliderA.computeMass() + colliderB.computeMass());
        // colliderA.vx -= (impulse * colliderB.computeMass() * vCollisionNorm.x);
        // colliderA.vy -= (impulse * colliderB.computeMass() * vCollisionNorm.y);
        // colliderB.vx += (impulse * colliderA.computeMass() * vCollisionNorm.x);
        // colliderB.vy += (impulse * colliderA.computeMass() * vCollisionNorm.y);
    }
}

class collision {
    // (circleCollider, circleCollider) -> Boolean
    detectCollisionCircletoCircle(colliderA, colliderB) {
        let dx = colliderA.x - colliderB.x;
        let dy = colliderA.y - colliderB.y;
        let distance = dx * dx + dy * dy;
        return distance < (colliderA.radius + colliderB.radius) * (colliderA.radius + colliderB.radius);
    }

    resolveCollisionCircletoCircle(colliderA, colliderB) {
    }
}

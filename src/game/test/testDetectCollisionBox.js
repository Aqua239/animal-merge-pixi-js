import { CircleCollider } from "../system/circleCollider.js";
import { Collision } from "../system/collision.js";

const Box = { x: 15, y: 15, width: 100, height: 100 };
const collisionSystem = new Collision();

console.log("Detect circle to box collision ");
const A = new CircleCollider(20, 20, 10);
const B = new CircleCollider(5, 5, 10);
const C = new CircleCollider(50, 50, 10);
const D = new CircleCollider(120, 120, 10);
const E = new CircleCollider(50, 50, 30);

console.log("Case 1: ");
console.log(collisionSystem.detectCollisionCircleToBox(A, Box));
console.log("Case 2:");
console.log(collisionSystem.detectCollisionCircleToBox(B, Box));
console.log("Case 3:");
console.log(collisionSystem.detectCollisionCircleToBox(C, Box));
console.log("Case 4: ");
console.log(collisionSystem.detectCollisionCircleToBox(D, Box));
console.log("Case 5: ");
console.log(collisionSystem.detectCollisionCircleToBox(E, Box));

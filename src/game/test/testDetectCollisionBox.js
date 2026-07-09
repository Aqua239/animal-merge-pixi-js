import { circleCollider } from "../system/circleCollider.js";
import { collision } from "../system/collision.js";

const Box = { x: 15, y: 15, width: 100, height: 100 };
const collisionSystem = new collision();

console.log("Detect circle to box collision ");
const A = new circleCollider(20, 20, 10);
const B = new circleCollider(5, 5, 10);
const C = new circleCollider(50, 50, 10);
const D = new circleCollider(120, 120, 10);
const E = new circleCollider(50, 50, 30);

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

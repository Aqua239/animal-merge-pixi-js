import { CircleCollider } from "../system/circleCollider.js";
import { Collision } from "../system/collision.js";

const A = new CircleCollider(20, 0, 10);
const B = new CircleCollider(40, 0, 10);
const C = new CircleCollider(25, 0, 10);

const collisionSystem = new Collision();
console.log("case 1: false");
console.log("radius A: " + A.radius + ", radius B: " + B.radius);
console.log(collisionSystem.detectCollisionCircletoCircle(A, B)); // false
console.log("case 2: true");
console.log(collisionSystem.detectCollisionCircletoCircle(A, C)); // true

console.log("Detect edge collision");
const D = new CircleCollider(95, 0, 10);
const E = new CircleCollider(20, 0, 10);
const E1 = new CircleCollider(50, 0, 10);
console.log("Left-Right")
console.log("Case 1: false");
console.log(collisionSystem.detectCollisionCircleOnLeftRight(D, 15, 100)); // false
console.log("Case 2: true");
console.log(collisionSystem.detectCollisionCircleOnLeftRight(E, 15, 100)); // true
console.log("Case 3: false");
console.log(collisionSystem.detectCollisionCircleOnLeftRight(E1, 15, 100)); // true


console.log("Bottom");
const F = new CircleCollider(20, 95, 10);
const G = new CircleCollider(20, 20, 10);
const H = new CircleCollider(20, 105, 10);
console.log("Case 1: false");
console.log(collisionSystem.detectCollisionCircleInBottom(G, 15, 100));
console.log("Case 2: false");
console.log(collisionSystem.detectCollisionCircleInBottom(F, 15, 100));
console.log("Case 3: true");
console.log(collisionSystem.detectCollisionCircleInBottom(H, 15, 100));


console.log("Over Top");
const I = new CircleCollider(20, 5, 10);
const J = new CircleCollider(20, 20, 10);
const K = new CircleCollider(20, 25, 10);
console.log("Case 1: true");
console.log(collisionSystem.detectCollisionCircleOverTop(I, 15));
console.log("Case 2: true");
console.log(collisionSystem.detectCollisionCircleOverTop(J, 15));
console.log("Case 3: true");
console.log(collisionSystem.detectCollisionCircleOverTop(K, 15));
console.log("Case 4: false");
const L = new CircleCollider(20, 30, 10);
console.log(collisionSystem.detectCollisionCircleOverTop(L, 15));

import { CircleCollider } from "../system/circleCollider.js";

const A = new CircleCollider(0, 0, 35);
console.log(A.getLevel()); // should return 5

const B = new CircleCollider(0, 0, 60);
console.log(B.getLevel()); // should return 10

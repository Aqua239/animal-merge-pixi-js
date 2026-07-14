import { ANIMAL_LEVEL } from "../../constant";

const levelKeys = Object.keys(ANIMAL_LEVEL);
const maxLevelKey = Math.max(...levelKeys);

export const PhysicsConfig = {
    gravity: 9.81,
    restitution: 0.5,
    angularDamping: 1.2,
    angularStopThreshold: 0.02,
    spinThreshold: 0.18,
    spinFactor: 0.04,
    maxAngularVelocity: 2.5,
    timeStep: 1 / 60,
    maxRadius: ANIMAL_LEVEL[ANIMAL_LEVEL.length - 1].radius,
};

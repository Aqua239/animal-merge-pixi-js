import { Collision } from "../system/collision.js";
import { PhysicsConfig, ANIMAL_LEVEL } from "../../constant.js";
import { Physics } from "../system/physics.js";

export class World {
    /**
     * @param {object} box - { x, y, width, height } bounding box
     * @param {function} [onMerge] - optional callback(colliderA, colliderB, newCollider)
     *        called when two same-level animals merge. Should return the new animal-like object
     *        to add to the world, or null to let World create a default one.
     */
    constructor(box, onMerge = null) {
        this.animals = []; //Animal-like[]
        this.collisionSystem = new Collision();
        this.box = box;
        this.onMerge = onMerge;
    }

    addAnimal(animal) {
        this.animals.push(animal);
    }

    removeAnimal(animal) {
        const index = this.animals.indexOf(animal);
        if (index !== -1) {
            this.animals.splice(index, 1);
        }
    }

    update(dt) {
        this.collisionSystem.beginFrame();

        const subSteps = 4;
        const velocityIterations = 4;
        const positionIterations = 3;
        const subDt = dt / subSteps;

        for (let step = 0; step < subSteps; step++) {
            this.updatePositions(subDt);
            this.animals.sort((a, b) => b.collider.y - a.collider.y);

            const collisions = this.detectAndMergeCircleCollisions();

            const groundCollisionSet = new Set();
            const circleCollisionMap = new Map();

            for (let i = 0; i < velocityIterations; i++) {
                this.handleCollisionsCirclesToTop(-300);

                for (const animal of this.handleCollisionsCirclesToBoxes()) {
                    groundCollisionSet.add(animal);
                }

                for (const { animalA, animalB } of collisions) {
                    const { normal, normalImpulse } =
                        this.collisionSystem.resolveVelocityCircleToCircle(animalA.collider, animalB.collider);

                    const key = this.collisionSystem.getPairKey(animalA.collider, animalB.collider);
                    if (circleCollisionMap.has(key)) {
                        const existing = circleCollisionMap.get(key);
                        existing.normalImpulse += normalImpulse;
                        existing.normal = normal;
                    } else {
                        circleCollisionMap.set(key, { animalA, animalB, normal, normalImpulse });
                    }
                }
            }

            for (let i = 0; i < positionIterations; i++) {
                for (const { animalA, animalB } of collisions) {
                    const cA = animalA.collider;
                    const cB = animalB.collider;
                    const { normal, distance } = Physics.computeCollisionNormalAndDistance(cA, cB);
                    Physics.resolvePenetration(cA, cB, normal, distance);
                }
                for (const animal of this.animals) {
                    if (animal.isPhysicsActive) {
                        animal.collider.clampPositionToBox(this.box);
                    }
                }
                this.handleCollisionsCirclesToTop(-300);
            }

            for (const animal of groundCollisionSet) {
                animal.collider.applyGroundFriction(subDt);
            }

            for (const c of circleCollisionMap.values()) {
                this.collisionSystem.resolveFrictionCircleToCircle(
                    c.animalA.collider,
                    c.animalB.collider,
                    c.normal,
                    c.normalImpulse
                );
            }
        }

        this.syncAnimalPositions();
        this.collisionSystem.endFrame();
    }

    detectAndMergeCircleCollisions() {
        const collisions = [];
        const toAdd = [];
        const toRemove = new Set();

        const keys = Object.keys(ANIMAL_LEVEL);
        const maxLevel = Math.max(...keys);

        for (let i = 0; i < this.animals.length; i++) {
            const animalA = this.animals[i];
            if (toRemove.has(animalA) || !animalA.isPhysicsActive) continue;

            for (let j = i + 1; j < this.animals.length; j++) {
                const animalB = this.animals[j];
                if (toRemove.has(animalB) || !animalB.isPhysicsActive) continue;

                const cA = animalA.collider;
                const cB = animalB.collider;

                if (!cA.checkCollisionWithCircle(cB)) continue;

                if (animalA.level === animalB.level && animalA.level < maxLevel) {
                    const newCollider = this.collisionSystem.resolveCollisionCircleToCircleByMerge(cA, cB);
                    let newAnimal = this.onMerge ? this.onMerge(animalA, animalB, newCollider) : null;
                    if (newAnimal && newAnimal.collider) {
                        newAnimal.collider.vx = 0;
                        newAnimal.collider.vy = 0;
                    }
                    if (!newAnimal) {
                        newAnimal = {
                            collider: newCollider,
                            level: animalA.level + 1,
                            isPhysicsActive: true,
                            x: newCollider.x,
                            y: newCollider.y
                        };
                    }
                    toAdd.push(newAnimal);
                    toRemove.add(animalA);
                    toRemove.add(animalB);
                    break;
                } else {
                    collisions.push({ animalA, animalB });
                }
            }
        }

        toRemove.forEach(a => this.removeAnimal(a));
        toAdd.forEach(a => this.addAnimal(a));

        return collisions.filter(c => !toRemove.has(c.animalA) && !toRemove.has(c.animalB));
    }

    updatePositions(dt) {
        for (const animal of this.animals) {
            if (animal.isPhysicsActive) {
                animal.collider.update(dt);
            }
        }
    }

    syncAnimalPositions() {
        for (const animal of this.animals) {
            if (animal.isPhysicsActive) {
                animal.x = animal.collider.x;
                animal.y = animal.collider.y;
            }
        }
    }

    handleCollisionsCirclesToBoxes() {
        const touching = [];
        for (const animal of this.animals) {
            if (animal.isPhysicsActive) {
                if (animal.collider.checkCollisionCircleToBox(this.box)) {
                    touching.push(animal);
                }
            }
        }
        return touching;
    }

    handleCollisionsCirclesToCircles() {
        const contacts = [];
        const toAdd = [];
        const toRemove = new Set();

        for (let i = 0; i < this.animals.length; i++) {
            const animalA = this.animals[i];
            if (toRemove.has(animalA)) continue;

            for (let j = i + 1; j < this.animals.length; j++) {
                const animalB = this.animals[j];
                if (toRemove.has(animalB)) continue;

                const cA = animalA.collider;
                const cB = animalB.collider;
                if (!cA.checkCollisionWithCircle(cB)) continue;

                const keys = Object.keys(ANIMAL_LEVEL);
                const maxLevel = Math.max(...keys);
                if (animalA.level === animalB.level && animalA.level < maxLevel) {
                    const newCollider = this.collisionSystem.resolveCollisionCircleToCircleByMerge(cA, cB);
                    let newAnimal = this.onMerge ? this.onMerge(animalA, animalB, newCollider) : null;
                    newAnimal.collider.vx = 0;
                    newAnimal.collider.vy = 0;
                    if (!newAnimal) {
                        newAnimal = { collider: newCollider, level: animalA.level + 1, isPhysicsActive: true, x: newCollider.x, y: newCollider.y };
                    }
                    toAdd.push(newAnimal);
                    toRemove.add(animalA);
                    toRemove.add(animalB);
                    break;
                } else {
                    const { normal, normalImpulse } = this.collisionSystem.resolveNormalCircleToCircle(cA, cB);
                    contacts.push({ animalA, animalB, normal, normalImpulse });
                }
            }
        }

        toRemove.forEach(a => this.removeAnimal(a));
        toAdd.forEach(a => this.addAnimal(a));

        return contacts.filter(c => !toRemove.has(c.animalA) && !toRemove.has(c.animalB));
    }

    handleCollisionsCirclesToTop(y) {
        for (const animal of this.animals) {
            if (animal.collider.checkCollisionCircleOverTop(y)) {
                animal.collider.y = y + animal.collider.radius;
                animal.collider.vy = 0;
            }
        }
    }

    checkCollisionCircleToTop(y) {
        for (const animal of this.animals) {
            if (animal.isPhysicsActive) {
                if (animal.collider.checkCollisionCircleOverTop(y)) {
                    return true;
                }
            }
        }
        return false;
    }

    activateItemFly() {
        this.animals.sort((a, b) => a.collider.y - b.collider.y);
        for (const animal of this.animals) {
            if (animal.isPhysicsActive) {
                // Heavier animals (higher level) fly less
                const levelFactor = Math.max(0.15, 1 - (animal.level - 1) * 0.05);
                animal.collider.vy = -1800 * levelFactor;
                animal.collider.vx = (Math.random() - 0.5) * 5000 * levelFactor;
                animal.collider.wake();
            }
        }
    }
}

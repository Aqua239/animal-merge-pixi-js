import { Collision } from "../system/collision.js";
import { PhysicsConfig, ANIMAL_LEVEL } from "../../constant.js";

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

        this.updatePositions(dt);
        this.animals.sort((a, b) => b.collider.y - a.collider.y);

        const maxloop = 20;
        const groundContactSet = new Set();
        const circleContactMap = new Map();

        for (let i = 0; i < maxloop; i++) {

            this.handleCollisionsCirclesToTop(-300);
            const groundContacts = this.handleCollisionsCirclesToBoxes();
            const circleContacts = this.handleCollisionsCirclesToCircles();

            for (const a of groundContacts) groundContactSet.add(a);
            for (const c of circleContacts) {
                const key = this.collisionSystem.getPairKey(c.animalA.collider, c.animalB.collider);
                if (circleContactMap.has(key)) {
                    const existing = circleContactMap.get(key);
                    existing.normalImpulse += c.normalImpulse;
                    existing.normal = c.normal; //total impluse
                } else {
                    circleContactMap.set(key, { ...c });
                }
            }
        }

        for (const animal of groundContactSet) {
            animal.collider.applyGroundFriction();
        }
        for (const c of circleContactMap.values()) {
            this.collisionSystem.resolveFrictionCircleToCircle(
                c.animalA.collider, c.animalB.collider, c.normal, c.normalImpulse
            );
        }

        this.syncAnimalPositions();
        this.collisionSystem.endFrame();
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
                console.log("detect top");
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

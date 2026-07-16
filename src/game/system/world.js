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

        // Save pre-update positions
        const preX = this.animals.map(a => a.collider.x);
        const preY = this.animals.map(a => a.collider.y);

        this.updatePositions(dt);
        const maxloop = 80;
        for (let i = 0; i < maxloop; i++) {
            const groundContacts = this.handleCollisionsCirclesToBoxes();
            const circleContacts = this.handleCollisionsCirclesToCircles();

            for (const animal of groundContacts) {
                animal.collider.applyGroundFriction();
            }
            for (const c of circleContacts) {
                this.collisionSystem.resolveFrictionCircleToCircle(c.animalA.collider, c.animalB.collider, c.normal, c.normalImpulse);
            }
        }
        this.syncAnimalPositions();
        this.collisionSystem.endFrame();

        this.processRestingContacts(preX, preY, dt);

    }

    // Stop if the animal is resting on the ground for a while, to prevent jittering and sliding
    processRestingContacts(preX, preY, dt) {
        this.animals.forEach((animal, i) => {
            if (!animal.isPhysicsActive) return;
            const c = animal.collider;
            if (c.isSleeping) return;

            const dx = Math.abs(c.x - preX[i]);
            const dy = Math.abs(c.y - preY[i]);

            const isResting = dx < PhysicsConfig.sleepPosEpsilon
                && dy < PhysicsConfig.sleepPosEpsilon;

            if (isResting) {
                c.stableTime += dt;
                if (c.stableTime > PhysicsConfig.sleepTimeThreshold) {
                    c.vx = 0;
                    c.vy = 0;
                    c.angularVelocity = 0;
                    c.isSleeping = true;
                }
            } else {
                c.stableTime = 0;
            }
        });
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
            if (animal.isPhysicsActive && !animal.collider.isSleeping) {
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

                // 1 sleeping --> wake up another
                if (cA.isSleeping && !cB.isSleeping) cA.wake();
                if (cB.isSleeping && !cA.isSleeping) cB.wake();

                if (cA.isSleeping && cB.isSleeping) continue; // 2 sleeping, ignore

                const keys = Object.keys(ANIMAL_LEVEL);
                const maxLevel = Math.max(...keys);
                if (animalA.level === animalB.level && animalA.level < maxLevel) {
                    const newCollider = this.collisionSystem.resolveCollisionCircleToCircleByMerge(cA, cB);
                    let newAnimal = this.onMerge ? this.onMerge(animalA, animalB, newCollider) : null;
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
}

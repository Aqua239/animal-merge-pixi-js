import { Collision } from "../system/collision.js";

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
        const maxloop = 10;
        for (let i = 0; i < maxloop; i++) {
            this.handleCollisionsCirclesToBoxes();
            this.handleCollisionsCirclesToCircles();
        }
        this.collisionSystem.endFrame();
    }

    updatePositions(dt) {
        for (const animal of this.animals) {
            if (animal.isPhysicsActive) {
                animal.collider.update(dt);
                animal.x = animal.collider.x;
                animal.y = animal.collider.y;
            }
        }
    }

    handleCollisionsCirclesToBoxes() {
        for (const animal of this.animals) {
            if (animal.isPhysicsActive) {
                animal.collider.checkCollisionCircleToBox(this.box);
            }
        }
    }

    handleCollisionsCirclesToCircles() {
        const toAdd = [];
        const toRemove = new Set();

        for (let i = 0; i < this.animals.length; i++) {
            const animalA = this.animals[i];
            if (toRemove.has(animalA)) continue; // if merged --> skip

            for (let j = i + 1; j < this.animals.length; j++) {
                const animalB = this.animals[j];
                if (toRemove.has(animalB)) continue;

                if (animalA.collider.checkCollisionWithCircle(animalB.collider)) {
                    if (animalA.level === animalB.level) {
                        const newCollider = this.collisionSystem.resolveCollisionCircleToCircleByMerge(animalA.collider, animalB.collider);
                        let newAnimal = null;
                        if (this.onMerge) {
                            newAnimal = this.onMerge(animalA, animalB, newCollider);
                        }
                        if (!newAnimal) {
                            // create a default new animal if onMerge didn't return one
                            newAnimal = {
                                collider: newCollider,
                                level: animalA.level + 1,
                                isPhysicsActive: true,
                                x: newCollider.x,
                                y: newCollider.y,
                            };
                        }
                        toAdd.push(newAnimal);
                        toRemove.add(animalA);
                        toRemove.add(animalB);
                        break; // if merged, abort
                    } else {
                        this.collisionSystem.resolveCollisionCircleToCircleByPush(animalA.collider, animalB.collider, true);
                    }
                }
            }
        }

        // conduct the removal and addition of animals after all collisions have been processed
        toRemove.forEach(a => this.removeAnimal(a));
        toAdd.forEach(a => this.addAnimal(a));
    }

    checkCollisionCircleToTop(y) {
        for (const animal of this.animals) {
            if (animal.isPhysicsActive) {
                if (animal.collider.checkCollisionCircleToTop(y)) {
                    return true;
                }
            }
        }
        return false;
    }
}

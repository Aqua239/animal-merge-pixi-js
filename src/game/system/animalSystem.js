import {ANIMAL_LEVEL, GAME_CONFIG} from "../../constant";
import { Animal } from "../entities/animal";
import { gameStore } from "../store/gameStore";

export class AnimalSystem {
    constructor(gameManager){
        this.gameManager = gameManager;
    }

    initSpawn(xSpawnNext, ySpawnNext, xSpawnCurrent, ySpawnCurrent){
        if(this.gameManager.nextAnimal === null){
            this.gameManager.isSpawner = true;
            let randomLevel = Math.floor(Math.random() * 5) + 1;
            this.gameManager.nextAnimal = this.spawnAnimal(
                xSpawnNext, ySpawnNext,
                randomLevel, true
            );
        }

        if(this.gameManager.currentAnimal === null){
            this.gameManager.isSpawner = true;
            let randomLevel = Math.floor(Math.random() * 5) + 1;
            this.gameManager.currentAnimal = this.spawnAnimal(
                xSpawnCurrent, ySpawnCurrent,
                randomLevel, false
            );
            this.gameManager.isDrop = true;
        }
    }

    stateAnimalForScene(xSpawn, ySpawn){
        if(this.gameManager.currentAnimal === null){
            this.gameManager.currentAnimal = this.gameManager.nextAnimal;
            if(this.gameManager.currentAnimal){
                this.gameManager.currentAnimal.x = GAME_CONFIG.GAME_AREA_WIDTH / 2 + Math.floor(Math.random() * 50);
                this.gameManager.currentAnimal.y = GAME_CONFIG.ANIMAL_SPAWN_Y;
                this.gameManager.currentAnimal.convertFromNextToCurrent();
                this.gameManager.isDrop = true;
            }
        }

        if(
            this.gameManager.nextAnimal === null ||
            this.gameManager.nextAnimal ===
            this.gameManager.currentAnimal
        ){
            this.gameManager.isSpawner = true;
            let randomLevel = Math.floor(Math.random() * 5) + 1;
            this.gameManager.nextAnimal = this.spawnAnimal(xSpawn, ySpawn, randomLevel, true);
        }
    }

    spawnAnimal(xSpawn, ySpawn, level, isNextAnimal){
        if(!this.gameManager.isSpawner) return;
        this.gameManager.isSpawner = false;
        let newAnimal = new Animal(level, xSpawn, ySpawn, isNextAnimal);
        this.gameManager.gameContainer.addChild(newAnimal);
        return newAnimal;
    }

    // handleAnimalCollisions(animal1, animal2){
    //     const mergedCollider =
    //         this.gameManager.physics.handleCollisionsCircleToCircle(
    //                 animal1.collider,
    //                 animal2.collider
    //             );

    //     if(!mergedCollider) return;
    //     this.mergeAnimals(animal1, animal2, mergedCollider);
    // }

    mergeAnimals(animal1, animal2, mergedCollider){
        const nextConfig = ANIMAL_LEVEL[animal1.level + 1];
        if(!nextConfig) return;

        animal1.isMerging = true;
        animal2.isMerging = true;

        this.gameManager.removeAnimalToPhysicState(animal1);
        this.gameManager.removeAnimalToPhysicState(animal2);
        this.gameManager.removeAnimalFromPool(animal1);
        this.gameManager.removeAnimalFromPool(animal2);

        this.gameManager.score += animal1.score;
        this.gameManager.gameScreen.updateCurrentScore(this.gameManager.score);

        if(gameStore.showHighestScore() < this.gameManager.score){
            this.gameManager.gameScreen.updateHighScore(this.gameManager.score);
        }

        mergedCollider.radius =nextConfig.radius;
        const mergedAnimal = new Animal(
            animal1.level + 1,
            mergedCollider.x,
            mergedCollider.y,
            false
        );

        mergedAnimal.attachCollider(mergedCollider);
        this.gameManager.gameContainer.addChild(mergedAnimal);
        this.gameManager.animalPool.push(mergedAnimal);
        this.gameManager.removeItemController.handleAnimalEvent(mergedAnimal);
        animal1.destroy();
        animal2.destroy();

        return mergedAnimal;
    }
}

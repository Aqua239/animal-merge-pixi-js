import { sound } from "@pixi/sound";

import { ANIMAL_LEVEL, GAME_CONFIG } from "../constant";

import { Animal } from "./entities/animal";
import { gameStore } from "./store/gameStore";
import { playMergeEffect } from "../UI/effects/effects";

export class AnimalManager {
    constructor(gameManager){
        this.gameManager = gameManager;
    }

    initSpawn(xSpawnNext, ySpawnNext, xSpawnCurrent, ySpawnCurrent){
        if(this.gameManager.nextAnimal === null){
            this.gameManager.isSpawner = true;
            let randomLevel = Math.floor(Math.random() * 5) + 1;
            this.gameManager.nextAnimal = this.spawnAnimal(
                xSpawnNext,
                ySpawnNext,
                randomLevel,
                true
            );
        }

        if(this.gameManager.currentAnimal === null){
            this.gameManager.isSpawner = true;
            let randomLevel = Math.floor(Math.random() * 5) + 1;
            this.gameManager.currentAnimal = this.spawnAnimal(
                xSpawnCurrent,
                ySpawnCurrent,
                randomLevel,
                false
            );
            this.gameManager.isDrop = true;
        }
    }

    stateAnimalForScene(xSpawn, ySpawn){
        if(this.gameManager.currentAnimal === null){
            this.gameManager.currentAnimal = this.gameManager.nextAnimal;

            if(this.gameManager.currentAnimal){
                this.gameManager.currentAnimal.convertFromNextToCurrent();

                const randomOffset = Math.floor(Math.random() * 11) - 5;
                this.gameManager.currentAnimal.spawnOffset = randomOffset;
                const spawnPositionX = this.gameManager.inputSystem.pointerX + randomOffset;
                this.gameManager.currentAnimal.x = this.gameManager.inputSystem.getAnimalPositionX(
                    this.gameManager.world.box,
                    this.gameManager.currentAnimal.radius,
                    spawnPositionX
                );

                this.gameManager.currentAnimal.y = GAME_CONFIG.ANIMAL_SPAWN_Y;
                this.gameManager.isDrop = true;
            }
        }

        if(
            this.gameManager.nextAnimal === null ||
            this.gameManager.nextAnimal === this.gameManager.currentAnimal
        ){
            this.gameManager.isSpawner = true;
            let randomLevel = Math.floor(Math.random() * 10) + 1;
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

    mergeAnimals(animal1, animal2, mergedCollider) {
        const nextConfig = ANIMAL_LEVEL[animal1.level + 1];
        if(!nextConfig) return;

        animal1.isMerging = true;
        animal2.isMerging = true;

        this.gameManager.removeAnimalToPhysicState(animal1);
        this.gameManager.removeAnimalToPhysicState(animal2);
        this.gameManager.removeAnimalFromPool(animal1);
        this.gameManager.removeAnimalFromPool(animal2);

        // SFX
        sound.play('sound_sfx_atlas', {sprite: "merge", volume: 1});

        mergedCollider.radius = nextConfig.radius;
        const mergedAnimal = new Animal(
            animal1.level + 1,
            mergedCollider.x,
            mergedCollider.y,
            false
        );

        this.gameManager.score += mergedAnimal.score;
        this.gameManager.gameScreen.updateCurrentScore(this.gameManager.score);

        if(gameStore.showHighestScore() < this.gameManager.score){
            this.gameManager.gameScreen.updateHighScore(this.gameManager.score);
        }

        gameStore.addCoin(mergedAnimal.coin);
        this.gameManager.gameScreen.updateCoin(gameStore.getCoin());

        mergedAnimal.attachCollider(mergedCollider);

        mergedAnimal.scale.set(0);
        mergedAnimal.targetScale = 1;

        mergedAnimal.updateScale = () => {
            if (mergedAnimal.scale.x < 0.95) {
                mergedAnimal.scale.x += 0.15;
                mergedAnimal.scale.y += 0.15;
            } else {
                mergedAnimal.scale.set(1);
                mergedAnimal.updateScale = null;
            }
        };

        this.gameManager.gameContainer.addChild(mergedAnimal);
        this.gameManager.animalPool.push(mergedAnimal);
        this.gameManager.buttonController.handleAnimalEvent(mergedAnimal);
        this.gameManager.updateMergeTree();
        animal1.destroy();
        animal2.destroy();

        // VFX
        const effectScale = (nextConfig.radius / 85) * 2.0;
        playMergeEffect(
            mergedCollider.x,
            mergedCollider.y,
            this.gameManager.gameContainer,
            effectScale
        );
        return mergedAnimal;
    }
}

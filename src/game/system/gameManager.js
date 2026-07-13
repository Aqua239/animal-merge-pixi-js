import { ANIMAL_LEVEL } from "../../constant";
import { Animal } from "../entities/animal";
import { PhysicsConfig } from "../system/physicConfig";
import { Physics } from "./physics";

export class GameManager{
    constructor(app){
        this.app = app;

        this.isGameOver = false;
        this.isGameRunning = false;
        this.isGamePause = false;

        this.score = 0;
        this.topCollisionTime = 0;
        this.isSpawner = false;
        this.isDrop = false;
        this.isChangeTopCollisionTime = false;

        this.currentAnimal = null;
        this.nextAnimal = null;
        this.animalPool = [];

        this.physics = new Physics();
        this.physics.box = {x: 100, y: 100, width: 500, height: 450};

        this.listenEvent();
        this.start();
    }

    start(){
        if(this.isGameRunning) return;
        this.isGameRunning = true;
        this.isGamePause = false;
        this.isGameOver = false;

        this.app.ticker.add(this.update.bind(this));
        this.initSpawn(550,50,50,50);
    }

    pause(){
        if(this.isGamePause) return;
        this.isGamePause = true;
        this.isGameOver = false;
        this.isGameRunning = false;
    }

    resume(){
        if(!this.isGamePause) return;
        this.isGamePause = false;
    }

    gameover(){
        if(this.isGameOver) return;
        this.isGameOver = true;
        this.isGamePause = false;
        this.isGameRunning = false;
    }

    reset(){
        this.score = 0;
        this.currentAnimal = null;
        this.nextAnimal = null;
        this.animalPool = [];
    }

    update(ticker){
        if(!this.isGameRunning || this.isGameOver || this.isGamePause) return;

        const timestep = PhysicsConfig.timeStep * ticker.deltaTime;
        this.physics.update(timestep);

        for(let i = 0; i < this.animalPool.length; i++){
            for(let j = i + 1; j < this.animalPool.length; j++){
                if(this.animalPool[i].isMerging || this.animalPool[j].isMerging) continue;
                this.handleAnimalCollisions(
                    this.animalPool[i],
                    this.animalPool[j]
                );
            }
        }

        this.checkAnimaltoTop(ticker.lastTime);

        for(let animal of this.animalPool){
            animal.setSpriteFollowCollider();
        }
    }

    initSpawn(xSpawnNext, ySpawnNext, xSpawnCurrent, ySpawnCurrent){
        if(this.nextAnimal === null){
            this.isSpawner = true;
            let randomLevel = Math.floor(Math.random() * 3) + 1;
            this.nextAnimal = this.spawnAnimal(xSpawnNext, ySpawnNext, randomLevel, true);
        }

        if(this.currentAnimal === null){
            this.isSpawner = true;
            let randomLevel = Math.floor(Math.random() * 3) + 1;
            this.currentAnimal = this.spawnAnimal(xSpawnCurrent, ySpawnCurrent, randomLevel, false);
            this.isDrop = true;
        }
    }

    stateAnimalForScene(xSpawn, ySpawn){
        if(this.currentAnimal === null){
            this.currentAnimal = this.nextAnimal;
            if(this.currentAnimal){
                this.currentAnimal.x = 50;
                this.currentAnimal.y = 50;
                this.currentAnimal.convertFromNextToCurrent();
                this.isDrop = true;
            }
        }

        if(this.nextAnimal === null || this.nextAnimal === this.currentAnimal){
            this.isSpawner = true;
            let randomLevel = Math.floor(Math.random() * 3) + 1;
            this.nextAnimal = this.spawnAnimal(xSpawn, ySpawn, randomLevel, true);
        }
    }

    spawnAnimal(xSpawn, ySpawn, level, isNextAnimal){
        if(!this.isSpawner) return;
        this.isSpawner = false;
        let newAnimal = new Animal(level, xSpawn, ySpawn, isNextAnimal);
        this.app.stage.addChild(newAnimal);
        return newAnimal;
    }

    listenEvent(){
        this.app.stage.eventMode = "static";
        this.app.stage.hitArea = this.app.screen;

        this.app.stage.on("pointermove", (event) => {
            if(!this.canInteractWithCurrentAnimal()) return;

            this.currentAnimal.x = event.global.x;
        });

        this.app.stage.on("pointerdown", () => {
            if(!this.canInteractWithCurrentAnimal()) return;

            this.dropAnimal();
        });
    }

    handleAnimalEvent(animal){
        animal.eventMode = "static";
        animal.cursor = "pointer";
        animal.on("pointerdown", (event) => {
            event.stopPropagation();

            this.removeAnimalToPhysicState(animal);
            this.removeAnimalFromPool(animal);
            animal.destroy();
        })
    }

    canInteractWithCurrentAnimal(){
        return (this.isGameRunning &&
            !this.isGamePause &&
            !this.isGameOver &&
            this.isDrop &&
            this.currentAnimal !== null
        );
    }

    addAnimalToPhysicState(animal){
        let checkStateAnimal = this.physics.circleColliders.includes(animal.collider)
        if(checkStateAnimal) return;

        this.physics.circleColliders.push(animal.collider);
    }

    removeAnimalToPhysicState(animal){
        let indexAnimal = this.physics.circleColliders.indexOf(animal.collider);
        this.physics.circleColliders.splice(indexAnimal, 1);
    }

    removeAnimalFromPool(animal){
        let indexAnimal = this.animalPool.indexOf(animal);
        this.animalPool.splice(indexAnimal, 1);
    }

    dropAnimal(){
        if(!this.canInteractWithCurrentAnimal()) return;

        this.isDrop = false;
        this.currentAnimal.convertPhysicMode();

        this.animalPool.push(this.currentAnimal);
        this.addAnimalToPhysicState(this.currentAnimal);
        this.handleAnimalEvent(this.currentAnimal);
        this.currentAnimal = null;

        setTimeout(() => {
            if(this.isGameRunning && !this.isGameOver){
                this.stateAnimalForScene(550,50);
            }
        }, 1000);
    }

    handleAnimalCollisions(animal1, animal2){
        const mergedCollider =
            this.physics.handleCollisionsCircleToCircle(
                animal1.collider,
                animal2.collider
            );

        if (!mergedCollider) return;
        this.mergeAnimals(animal1, animal2, mergedCollider);
    }

    mergeAnimals(animal1, animal2, mergedCollider){
        const nextConfig = ANIMAL_LEVEL[animal1.level + 1];
        if(!nextConfig) return;

        animal1.isMerging = true;
        animal2.isMerging = true;

        this.removeAnimalToPhysicState(animal1);
        this.removeAnimalToPhysicState(animal2);
        this.removeAnimalFromPool(animal1);
        this.removeAnimalFromPool(animal2);

        this.score += animal1.score;

        mergedCollider.radius = nextConfig.radius;
        const mergedAnimal = new Animal(
            animal1.level + 1,
            mergedCollider.x,
            mergedCollider.y,
            false
        );

        mergedAnimal.attachCollider(mergedCollider);

        this.app.stage.addChild(mergedAnimal);
        this.animalPool.push(mergedAnimal);
        this.addAnimalToPhysicState(mergedAnimal);
        this.handleAnimalEvent(mergedAnimal);
        animal1.destroy();
        animal2.destroy();
    }

    checkAnimaltoTop(deltaTime){
        if(this.physics.handleCollisionsAllCirclesToTop(530)){
            if(!this.isChangeTopCollisionTime){
                this.topCollisionTime = deltaTime;
                this.isChangeTopCollisionTime = true;
            }else{
                if(deltaTime - this.topCollisionTime >= 5000){
                    this.gameover();
                }
            }
        }else{
            this.topCollisionTime = 0;
            this.isChangeTopCollisionTime = false;
        }
    }
}

import { Texture } from "pixi.js";
import { ANIMAL_LEVEL, GAME_CONFIG, PhysicsConfig } from "../constant";
import { Animal } from "./entities/animal";
import { Physics } from "./system/physics";
import { RemoveItem } from "./entities/items/removeItem";
import GameOverPopup from "../overlays/gameOverPopup";

export class GameManager{
    constructor({app, gameContainer, gameScreen}){
        this.app = app;
        this.gameContainer = gameContainer;
        this.gameScreen = gameScreen;

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
        this.gameOverPopup = null;
        this.physics.box = {
            x: 0,
            y: GAME_CONFIG.CEILING_Y,
            width: GAME_CONFIG.GAME_AREA_WIDTH,
            height: GAME_CONFIG.FLOOR_Y - GAME_CONFIG.CEILING_Y
        };

        this.listenEvent();
        this.start();

        this.removeItem = new RemoveItem({
            texture: Texture.WHITE,
            quantity: 1,
            x: 50,
            y: 200,
            width: 50,
            height: 50,
            onUse: (item) => {
                this.setRemoveAnimalMode(item.isActive);
            },
        });

        this.gameContainer.addChild(this.removeItem);
    }

    start(){
        if(this.isGameRunning) return;
        this.isGameRunning = true;
        this.isGamePause = false;
        this.isGameOver = false;

        this.app.ticker.add(this.update.bind(this));
        this.initSpawn(
            GAME_CONFIG.NEXT_ANIMAL_POSITION_X,
            GAME_CONFIG.NEXT_ANIMAL_POSITION_Y,
            GAME_CONFIG.GAME_AREA_WIDTH/2,
            GAME_CONFIG.ANIMAL_SPAWN_Y
        );
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

        this.removeItem.deactivate();

        this.gameOverPopup = new GameOverPopup({
            score: this.score,
            onReplay: () => {this.replayGame()},

            onReturnMainMenu: () => {
            console.log("Return main menu");
            },
        });
        this.gameContainer.addChild(this.gameOverPopup);
        this.gameOverPopup.show();
    }

    reset() {
        if (this.currentAnimal) {
            this.currentAnimal.destroy();
            this.currentAnimal = null;
        }

        if (this.nextAnimal) {
            this.nextAnimal.destroy();
            this.nextAnimal = null;
        }

        for (const animal of this.animalPool) {
            if (!animal.destroyed) {
            animal.destroy();
            }
        }
        this.animalPool = [];
        this.physics.circleColliders.length = 0;
        this.score = 0;

        this.topCollisionTime = 0;
        this.isChangeTopCollisionTime = false;
        this.isSpawner = false;
        this.isDrop = false;

        this.isGameOver = false;
        this.isGamePause = false;
        this.isGameRunning = false;

        this.removeItem.deactivate();
    }

    replayGame(){
        if (this.gameOverPopup) {
            this.gameOverPopup.removeFromParent();

            this.gameOverPopup.destroy({
                children: true,
            });

            this.gameOverPopup = null;
        }

        this.reset();
        this.start();
    }

    update(ticker){
        if(!this.isGameRunning || this.isGameOver || this.isGamePause) return;

        const timestep = PhysicsConfig.timeStep * ticker.deltaMS;
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
            let randomLevel = Math.floor(Math.random() * 5) + 1;
            this.nextAnimal = this.spawnAnimal(xSpawnNext, ySpawnNext, randomLevel, true);
        }

        if(this.currentAnimal === null){
            this.isSpawner = true;
            let randomLevel = Math.floor(Math.random() * 5) + 1;
            this.currentAnimal = this.spawnAnimal(xSpawnCurrent, ySpawnCurrent, randomLevel, false);
            this.isDrop = true;
        }
    }

    stateAnimalForScene(xSpawn, ySpawn){
        if(this.currentAnimal === null){
            this.currentAnimal = this.nextAnimal;
            if(this.currentAnimal){
                this.currentAnimal.x = GAME_CONFIG.GAME_AREA_WIDTH/2 + Math.floor(Math.random()*50);
                this.currentAnimal.y = GAME_CONFIG.ANIMAL_SPAWN_Y;
                this.currentAnimal.convertFromNextToCurrent();
                this.isDrop = true;
            }
        }

        if(this.nextAnimal === null || this.nextAnimal === this.currentAnimal){
            this.isSpawner = true;
            let randomLevel = Math.floor(Math.random() * 5) + 1;
            this.nextAnimal = this.spawnAnimal(xSpawn, ySpawn, randomLevel, true);
        }
    }

    spawnAnimal(xSpawn, ySpawn, level, isNextAnimal){
        if(!this.isSpawner) return;
        this.isSpawner = false;
        let newAnimal = new Animal(level, xSpawn, ySpawn, isNextAnimal);
        this.gameContainer.addChild(newAnimal);
        return newAnimal;
    }

    listenEvent(){
        this.gameContainer.eventMode = "static";
        this.gameContainer.hitArea = {
            contains: (x, y) => {
                return (
                    x >= 0 &&
                    x <= GAME_CONFIG.SCREEN_WIDTH &&
                    y >= 0 &&
                    y <= GAME_CONFIG.SCREEN_HEIGHT
                );
            },
        };
        const box = this.physics.box;

        this.gameContainer.on("pointermove", (event) => {
            if(!this.canInteractWithCurrentAnimal()) return;
            const pointerPosition = event.getLocalPosition(this.gameContainer);

            if(this.detectCursorInBox(pointerPosition, box) && !this.removeItem.isActive){
                let animalPosition = Math.max(
                    box.x + this.currentAnimal.radius,
                    Math.min(pointerPosition.x, box.x + box.width - this.currentAnimal.radius)
                );

                this.currentAnimal.x = animalPosition;
            }
        });

        this.gameContainer.on("pointerdown", (event) => {
            if(!this.canInteractWithCurrentAnimal()) return;
            const pointerPosition = event.getLocalPosition(this.gameContainer);

            if(this.detectCursorInBox(pointerPosition, box) && !this.removeItem.isActive){
                this.dropAnimal();
            }
        });
    }

    detectCursorInBox(position, box){
        return box.x <= position.x &&
            position.x <= box.x + box.width &&
            box.y <= position.y &&
            position.y <= box.y + box.height
    }

    handleAnimalEvent(animal){
        animal.eventMode = "static";
        this.updateAnimalCursor(animal);

        animal.on("pointerdown", (event) => {
            if(!this.removeItem.isActive) return;

            event.stopPropagation();
            this.removeAnimalToPhysicState(animal);
            this.removeAnimalFromPool(animal);
            animal.destroy();
            this.removeItem.use();
        })
    }

    setRemoveAnimalMode(isActive) {
        if (this.currentAnimal) {
            this.currentAnimal.visible =!isActive;
        }

        for (const animal of this.animalPool) {
            this.updateAnimalCursor(animal, isActive);
            console.log(animal.cursor);
        }
    }

    updateAnimalCursor(animal, isActive) {
        animal.cursor = isActive
            ? "pointer"
            : "default";
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
                this.stateAnimalForScene(
                    GAME_CONFIG.NEXT_ANIMAL_POSITION_X,
                    GAME_CONFIG.NEXT_ANIMAL_POSITION_Y
                );
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
        this.gameScreen.updateCurrentScore(this.score);

        mergedCollider.radius = nextConfig.radius;
        const mergedAnimal = new Animal(
            animal1.level + 1,
            mergedCollider.x,
            mergedCollider.y,
            false
        );

        mergedAnimal.attachCollider(mergedCollider);

        this.gameContainer.addChild(mergedAnimal);
        this.animalPool.push(mergedAnimal);
        this.addAnimalToPhysicState(mergedAnimal);
        this.handleAnimalEvent(mergedAnimal);
        animal1.destroy();
        animal2.destroy();
    }

    checkAnimaltoTop(deltaTime){
        if(this.physics.handleCollisionsAllCirclesToTop(GAME_CONFIG.CEILING_Y)){
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

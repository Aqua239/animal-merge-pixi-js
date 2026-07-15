import { GAME_CONFIG, PhysicsConfig } from "../constant";
import { Physics } from "./system/physics";
import GameOverPopup from "../overlays/gameOverPopup";
import { InputSystem } from "./system/inputSystem";
import { AnimalSystem } from "./system/animalSystem";
import { RemoveItemController } from "./controller/removeItemController";

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

        this.animalSystem = new AnimalSystem(this);
        this.inputSystem = new InputSystem(this);
        this.removeItemController = new RemoveItemController(this);
        this.inputSystem.listenEvent();
        this.start();
    }

    start(){
        if(this.isGameRunning) return;
        this.isGameRunning = true;
        this.isGamePause = false;
        this.isGameOver = false;

        this.app.ticker.add(this.update.bind(this));
        this.animalSystem.initSpawn(
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
                this.animalSystem.handleAnimalCollisions(
                    this.animalPool[i],
                    this.animalPool[j]
                );
            }
        }

        this.checkAnimalToTop(ticker.lastTime);

        for(let animal of this.animalPool){
            animal.setSpriteFollowCollider();
        }
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

    checkAnimalToTop(deltaTime){
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

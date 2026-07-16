import { GAME_CONFIG, PhysicsConfig } from "../constant";
import { InputSystem } from "./system/inputSystem";
import { AnimalSystem } from "./system/animalSystem";
import { RemoveItemController } from "./controller/removeItemController";
import { GameOverController } from "./controller/gameOverController";
import { World } from "./system/world";
import { gameStore } from "./store/gameStore";

export class GameManager {
    constructor({ app, gameContainer, gameScreen }) {
        this.app = app;
        this.gameContainer = gameContainer;
        this.gameScreen = gameScreen;
        this.updateHandler = this.update.bind(this);

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

        // this.physics = new Physics();
        // this.physics.box = {
        this.box = {
            x: 0,
            y: GAME_CONFIG.CEILING_Y,
            width: GAME_CONFIG.GAME_AREA_WIDTH,
            height: GAME_CONFIG.FLOOR_Y - GAME_CONFIG.CEILING_Y
        };

        this.animalSystem = new AnimalSystem(this);
        this.inputSystem = new InputSystem(this);
        this.removeItemController = new RemoveItemController(this, gameScreen);
        this.gameOverController = new GameOverController(this);
        this.world = new World(this.box,
            (animal1, animal2, mergedCollider) => {
                return this.animalSystem.mergeAnimals(animal1, animal2, mergedCollider);
            }
        );

        this.inputSystem.listenEvent();
        this.start();
    }

    start() {
        if (this.isGameRunning) return;
        this.isGameRunning = true;
        this.isGamePause = false;
        this.isGameOver = false;

        this.app.ticker.remove(this.updateHandler);
        this.app.ticker.add(this.updateHandler);

        this.gameScreen.updateHighScore(gameStore.showHighestScore());
        this.gameScreen.updateCoin(gameStore.getCoin());
        this.animalSystem.initSpawn(
            GAME_CONFIG.NEXT_ANIMAL_POSITION_X,
            GAME_CONFIG.NEXT_ANIMAL_POSITION_Y,
            GAME_CONFIG.GAME_AREA_WIDTH / 2,
            GAME_CONFIG.ANIMAL_SPAWN_Y
        );
    }

    pause() {
        if (this.isGamePause) return;
        this.isGamePause = true;
        this.isGameOver = false;
        this.isGameRunning = false;
    }

    resume() {
        if (!this.isGamePause) return;
        this.isGamePause = false;
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
        this.world.animals.length = 0;
        this.score = 0;
        if (this.gameScreen) {
            this.gameScreen.updateCurrentScore(0);
        }

        this.topCollisionTime = 0;
        this.isChangeTopCollisionTime = false;
        this.isSpawner = false;
        this.isDrop = false;

        this.isGameOver = false;
        this.isGamePause = false;
        this.isGameRunning = false;

        this.removeItemController.removeItem.cancel();
    }

    update(ticker) {
        if (!this.isGameRunning || this.isGameOver || this.isGamePause) return;

        const timestep = PhysicsConfig.timeStep * ticker.deltaMS;
        // this.physics.update(timestep);

        // for(let i = 0; i < this.animalPool.length; i++){
        //     for(let j = i + 1; j < this.animalPool.length; j++){
        //         if(this.animalPool[i].isMerging || this.animalPool[j].isMerging) continue;
        //         this.animalSystem.handleAnimalCollisions(
        //             this.animalPool[i],
        //             this.animalPool[j]
        //         );
        //     }
        // }
        this.world.update(timestep);

        this.gameOverController.checkAnimalToTop(ticker.lastTime);

        for (let animal of this.animalPool) {
            animal.setSpriteFollowCollider();
        }
    }

    // addAnimalToPhysicState(animal){
    //     let checkStateAnimal = this.physics.circleColliders.includes(animal.collider)
    //     if(checkStateAnimal) return;
    addAnimalToPhysicState(animal) {
        let checkStateAnimal = this.world.animals.includes(animal);
        if (checkStateAnimal) return;
        this.world.animals.push(animal);
    }

    removeAnimalToPhysicState(animal) {
        let indexAnimal = this.world.animals.indexOf(animal);
        this.world.animals.splice(indexAnimal, 1);
    }

    removeAnimalFromPool(animal) {
        let indexAnimal = this.animalPool.indexOf(animal);
        this.animalPool.splice(indexAnimal, 1);
    }
}

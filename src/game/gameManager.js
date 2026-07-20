import { GAME_CONFIG, PhysicsConfig } from "../constant";
import { InputSystem } from "./system/inputSystem";
import { AnimalManager } from "./animalManager";
import { GameController } from "./controller/gameController";
import { World } from "./system/world";
import { ButtonController } from "./controller/buttonController";

export class GameManager {
    constructor({ app, gameContainer, gameScreen, leaderBoardPopup, onReturnMainMenu = null }) {
        this.app = app;
        this.gameContainer = gameContainer;
        this.gameScreen = gameScreen;
        this.leaderBoardPopup = leaderBoardPopup;
        this.onReturnMainMenu = onReturnMainMenu;
        this.updateHandler = this.update.bind(this);

        this.isGameOver = false;
        this.isGameRunning = false;
        this.isGamePause = false;

        this.score = 0;
        this.topCollisionTime = 0;
        this.isSpawner = false;
        this.isDrop = false;

        this.currentAnimal = null;
        this.nextAnimal = null;
        this.animalPool = [];
        this.itemFlyTimer = null;


        this.animalManager = new AnimalManager(this);
        this.inputSystem = new InputSystem(this);

        this.box = {
            x: 0,
            y: GAME_CONFIG.CEILING_Y,
            width: GAME_CONFIG.GAME_AREA_WIDTH,
            height: GAME_CONFIG.FLOOR_Y - GAME_CONFIG.CEILING_Y
        };

        this.world = new World(this.box,
            (animal1, animal2, mergedCollider) => {
                return this.animalManager.mergeAnimals(animal1, animal2, mergedCollider);
            }
        );

        this.buttonController = new ButtonController(this, gameScreen);
        this.gameController = new GameController(this);

        // window._world = this.world; //for debug

        this.inputSystem.listenEvent();
        this.gameController.start();
    }

    update(ticker) {
        // console.log(ticker.deltaMS);
        if (!this.isGameRunning || this.isGameOver || this.isGamePause) return;

        const timestep = PhysicsConfig.timeStep * ticker.deltaMS;
        this.world.update(timestep);
        this.gameController.checkAnimalToTop(ticker.deltaMS);

        for (let animal of this.animalPool) {
            animal.setSpriteFollowCollider();
            if (animal.updateScale) {
                animal.updateScale();
            }
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

    getHighestAnimalLevel() {
        let maxLevel = 0;

        for (const animal of this.animalPool) {
            if (animal.level > maxLevel) {
                maxLevel = animal.level;
            }
        }

        return maxLevel;
    }

    updateMergeTree() {
        const highestLevel = this.getHighestAnimalLevel();
        this.gameScreen.updateMergeTreeHighestLevel(highestLevel);
    }
}

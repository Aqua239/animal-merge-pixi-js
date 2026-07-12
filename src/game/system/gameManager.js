import { Animal } from "../entities/animal";

export class GameManager{
    constructor(app){
        this.app = app;

        this.isGameOver = false;
        this.isGameRunning = false;
        this.isGamePause = false;

        this.score = 0;
        this.isSpawner = false;
        this.isDrop = false;

        this.currentAnimal = null;
        this.nextAnimal = null;
        this.animalPool = [];

        this.physics = new Physics();
        this.physics.box = {x: 100, y: 100, width: 500, height: 650};

        this.listenEvent();
        this.start();
    }

    start(){
        if(this.isGameRunning) return;
        this.isGameRunning = true;
        this.isGamePause = false;
        this.isGameOver = false;

        this.app.ticker.add(this.update.bind(this));
        this.app.ticker.add(this.boundUpdate.bind(this));
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

    dropAnimal(){
        if(!this.canInteractWithCurrentAnimal()) return;

        this.isDrop = false;
        this.animalPool.push(this.currentAnimal);
        this.currentAnimal = null;

        setTimeout(() => {
            if(this.isGameRunning && !this.isGameOver){
                this.stateAnimalForScene(550,50);
            }
        }, 1000);
    }
}

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
    }

    start(){
        if(this.isGameRunning) return;
        this.isGameRunning = true;
        this.isGamePause = false;
        this.isGameOver = false;

        this.app.ticker.add(this.update.bind(this));

        this.initSpawn(100,50,50,50);
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
    }

    initSpawn(xSpawnNext, ySpawnNext, xSpawnCurrent, ySpawnCurrent){
        if(this.nextAnimal === null){
            this.isSpawner = true;
            let randomLevel = Math.floor(Math.random() * 3) + 1;
            this.nextAnimal = this.spawner(xSpawnNext, ySpawnNext, randomLevel);
        }

        if(this.currentAnimal === null){
            this.isSpawner = true;
            let randomLevel = Math.floor(Math.random() * 3) + 1;
            this.currentAnimal = this.spawner(xSpawnCurrent, ySpawnCurrent, randomLevel);
            this.isDrop = true;
        }
    }

    stateAnimalForScene(xSpawn, ySpawn){
        if(this.currentAnimal === null){
            this.currentAnimal = this.nextAnimal;
            if(this.currentAnimal){
                this.currentAnimal.x = 50;
                this.currentAnimal.y = 50;
                this.isDrop = true;
            }
        }

        if(this.nextAnimal === null || this.nextAnimal === this.currentAnimal){
            this.isSpawner = true;
            let randomLevel = Math.floor(Math.random() * 3) + 1;
            this.nextAnimal = this.spawner(xSpawn, ySpawn, randomLevel);
        }
    }

    spawnAnimal(xSpawn, ySpawn, level){
        if(!this.isSpawner) return;
        this.isSpawner = false;
        let newAnimal = new Animal(level, xSpawn, ySpawn);
        this.app.stage.addChild(newAnimal);
        return newAnimal;
    }
}

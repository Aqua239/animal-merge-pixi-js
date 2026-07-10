export class GameManager{
    constructor(app){
        this.app = app;

        this.isGameOver = false;
        this.isGameRunning = false;
        this.isGamePause = false;

        this.score = 0;

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
    }

    pause(){}

    resume(){}

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

    update(){}
}

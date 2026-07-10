class GameManager{
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

    start(){}

    pause(){}

    resume(){}

    gameover(){}

    reset(){}

    update(){}
}

import { GAME_CONFIG } from "../../constant";
import GameOverPopup from "../../overlays/gameOverPopup";

export class GameOverController {
    constructor(gameManager){
        this.gameManager = gameManager;
        this.gameOverPopup = null;
    }

    gameOver(){
        if(this.gameManager.isGameOver) return;

        this.gameManager.isGameOver = true;
        this.gameManager.isGamePause = false;
        this.gameManager.isGameRunning = false;

        this.gameManager.removeItemController.removeItem.deactivate();

        this.gameOverPopup = new GameOverPopup({
            score: this.gameManager.score,
            onReplay: () => {this.replayGame();},
            onReturnMainMenu: () => {
                console.log("Return main menu");
            },
        });

        this.gameManager.gameContainer.addChild(this.gameOverPopup);
        this.gameOverPopup.show();
    }

    replayGame(){
        if(this.gameOverPopup){
            this.gameOverPopup.removeFromParent();
            this.gameOverPopup.destroy({
                children: true,
            });
            this.gameOverPopup = null;
        }

        this.gameManager.reset();
        this.gameManager.start();
    }

    checkAnimalToTop(deltaTime){
        if(this.gameManager.world.checkCollisionCircleToTop(GAME_CONFIG.CEILING_Y)){
            if(!this.gameManager.isChangeTopCollisionTime){
                this.gameManager.topCollisionTime = deltaTime;
                this.gameManager.isChangeTopCollisionTime = true;
            }else{
                if(deltaTime - this.gameManager.topCollisionTime >= 5000){
                    this.gameOver();
                }
            }
        }else{
            this.gameManager.topCollisionTime = 0;

            this.gameManager.isChangeTopCollisionTime = false;
        }
    }
}

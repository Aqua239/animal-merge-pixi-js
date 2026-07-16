import { GAME_CONFIG } from "../../constant";
import GameOverPopup from "../../overlays/gameOverPopup";
import { gameStore } from "../store/gameStore";

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

        this.gameManager.removeItemController.removeItem.cancel();

        this.gameOverPopup = new GameOverPopup({
            score: this.gameManager.score,
            onReplay: () => {this.replayGame();},
            onReturnMainMenu: () => {this.backHomeScreen();},
        });

        gameStore.updateScores(this.gameManager.score);
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

    backHomeScreen(){
        if(this.gameOverPopup){
            this.gameOverPopup.removeFromParent();
            this.gameOverPopup.destroy({
                children: true,
            });
            this.gameOverPopup = null;
        }

        this.gameManager.reset();
        if(this.gameManager.onReturnMainMenu){
            this.gameManager.onReturnMainMenu();
        }
    }

    checkAnimalToTop(deltaMS){
        if(this.gameManager.world.checkCollisionCircleToTop(GAME_CONFIG.CEILING_Y)){
            if (this.gameManager.removeItemController.removeItem.isActive) return;

            this.gameManager.topCollisionTime += deltaMS;
            console.log(this.gameManager.topCollisionTime);

            if (this.gameManager.topCollisionTime >= 5000) {
                this.gameOver();
            }
        }else {
            this.gameManager.topCollisionTime = 0;
        }
    }
}

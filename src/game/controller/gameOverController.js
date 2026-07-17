import { GAME_CONFIG } from "../../constant";
import GameOverPopup from "../../overlays/gameOverPopup";
import { gameStore } from "../store/gameStore";

export class GameOverController {
    constructor(gameManager){
        this.gameManager = gameManager;
        this.gameOverPopup = null;

        this.previousCountdown = null;
        this.isCountdownVisible = false;
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
        this.gameManager.leaderBoardPopup.updateScores(gameStore.showListScore());
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

        this.resetCountdown();
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
        const isAnimalTouchingTop = this.gameManager.world.checkCollisionCircleToTop(GAME_CONFIG.CEILING_Y);
        if(!isAnimalTouchingTop) {
            this.gameManager.topCollisionTime = 0;
            this.hideCountdown();
            return;
        }

        const isRemoveItemActive = this.gameManager.removeItemController.removeItem.isActive;
        if(isRemoveItemActive) return;

        this.gameManager.topCollisionTime += deltaMS;
        const countdownText = Math.floor((5000 - this.gameManager.topCollisionTime) / 1000) + 1;
        if(countdownText < 5){
            this.showCountdown();
            if(this.previousCountdown !== countdownText){
                this.gameManager.gameScreen.updateCountdown(countdownText);
                this.previousCountdown = countdownText;
            }
        }

        if(this.gameManager.topCollisionTime >= 5000){
            this.gameOver();
        }
    }

    showCountdown(){
        if(this.isCountdownVisible) return;

        this.gameManager.gameScreen.showCountdown();
        this.isCountdownVisible = true;
    }

    hideCountdown(){
        if(!this.isCountdownVisible) return;

        this.gameManager.gameScreen.hideCountdown();

        this.isCountdownVisible = false;
        this.previousCountdown = null;
    }

     resetCountdown(){
        this.gameManager.topCollisionTime = 0;
        this.hideCountdown();
    }
}

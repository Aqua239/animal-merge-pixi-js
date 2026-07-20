import { sound } from "@pixi/sound";
import { GAME_CONFIG } from "../../constant";
import GameOverPopup from "../../UI/overlays/gameOverPopup";
import { gameStore } from "../store/gameStore";

export class GameController {
    constructor(gameManager){
        this.gameManager = gameManager;
        this.gameOverPopup = null;

        this.previousCountdown = null;
        this.isCountdownVisible = false;
    }

    start() {
        const game = this.gameManager
        if (game.isGameRunning) return;
        game.isGameRunning = true;
        game.isGamePause = false;
        game.isGameOver = false;

        game.app.ticker.remove(game.updateHandler);
        game.app.ticker.add(game.updateHandler);

        game.gameScreen.updateHighScore(gameStore.showHighestScore());
        game.gameScreen.updateCoin(gameStore.getCoin());
        game.animalManager.initSpawn(
            GAME_CONFIG.NEXT_ANIMAL_POSITION_X,
            GAME_CONFIG.NEXT_ANIMAL_POSITION_Y,
            GAME_CONFIG.GAME_AREA_WIDTH / 2,
            GAME_CONFIG.ANIMAL_SPAWN_Y
        );
    }

    pause() {
        const game = this.gameManager;

        if(!game.isGameRunning) return;
        if(game.isGamePause || game.isGameOver) return;

        game.isGamePause = true;
        game.isGameRunning = false;
    }

    resume() {
        const game = this.gameManager;

        if(!game.isGamePause || game.isGameOver) return;
        game.isGamePause = false;
        game.isGameRunning = true;
    }

    reset() {
        const game = this.gameManager;

        if (game.currentAnimal) {
            game.currentAnimal.destroy();
            game.currentAnimal = null;
        }

        if (game.nextAnimal) {
            game.nextAnimal.destroy();
            game.nextAnimal = null;
        }

        for (const animal of game.animalPool) {
            if (!animal.destroyed) {
                animal.destroy();
            }
        }
        game.animalPool = [];
        game.updateMergeTree();
        game.world.animals.length = 0;
        game.score = 0;
        if (game.gameScreen) {
            game.gameScreen.updateCurrentScore(0);
        }

        game.topCollisionTime = 0;
        game.isSpawner = false;
        game.isDrop = false;

        game.isGameOver = false;
        game.isGamePause = false;
        game.isGameRunning = false;

        game.mixItemController.reset();
        game.removeItemController.removeItem.cancel();

        if (game.itemFlyTimer) {
            clearInterval(game.itemFlyTimer);
            game.itemFlyTimer = null;
        }

        this.resetCountdown();
    }

    gameOver(){
        const game = this.gameManager;
        if(game.isGameOver) return;

        //SFX
        sound.play('sound_sfx_atlas', {sprite: "gameover", volume: 0.8});
        game.isGameOver = true;
        game.isGamePause = false;
        game.isGameRunning = false;

        game.removeItemController.removeItem.cancel();

        this.gameOverPopup = new GameOverPopup({
            score: game.score,
            onReplay: () => {this.replayGame();},
            onReturnMainMenu: () => {this.backHomeScreen();},
        });

        gameStore.updateScores(game.score);
        game.leaderBoardPopup.updateScores(gameStore.showListScore());
        game.gameContainer.addChild(this.gameOverPopup);
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

        this.reset();
        this.start();
    }

    backHomeScreen(){
        if(this.gameOverPopup){
            this.gameOverPopup.removeFromParent();
            this.gameOverPopup.destroy({
                children: true,
            });
            this.gameOverPopup = null;
        }

        this.reset();
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
        const isMixItemActive = this.gameManager.mixItemController.mixItem.isActive;

        if(isRemoveItemActive || isMixItemActive) return;

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

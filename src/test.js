import { Application, Texture, Container } from "pixi.js"; // Nhớ import Container
import { GAME_CONFIG } from "./constant";
import LoadingScreen from "./screens/loadingScreen";
import GameScreen from "./screens/gameScreen";
import { loadGameAssets } from "./assetLoader";
import { sound } from "@pixi/sound";
//import BasePopup from "./overlays/basePopup";
import GameOverPopup from "./overlays/gameOverPopup";
import { GameManager } from "./game/gameManager";
import MainMenuScreen from "./screens/mainMenuScreen";
import LeaderBoardPopup from "./overlays/leaderBoardPopup";
import SettingPopup from "./overlays/settingPopup";
import { playMergeEffect } from "./effects";

async function runTest() {
    const app = new Application();

    await app.init({
        resizeTo: window,
        backgroundColor: 0xffffff,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });

    document.body.appendChild(app.canvas);
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    // 1. TẠO MASTER CONTAINER
    const masterContainer = new Container();
    app.stage.addChild(masterContainer);

    // 2. THÊM CÁC MÀN HÌNH VÀO MASTER CONTAINER (Thay vì app.stage)
    const loadingScreen = new LoadingScreen();
    masterContainer.addChild(loadingScreen.container);
    loadingScreen.show();

    function resize() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const scaleX = screenWidth / GAME_CONFIG.SCREEN_WIDTH;
        const scaleY = screenHeight / GAME_CONFIG.SCREEN_HEIGHT;
        const scale = Math.min(scaleX, scaleY);

        // 3. CHỈ CẦN RESIZE VÀ POSITION MASTER CONTAINER LÀ ĐỦ
        masterContainer.scale.set(scale);
        masterContainer.x = (screenWidth - GAME_CONFIG.SCREEN_WIDTH * scale) / 2;
        masterContainer.y = (screenHeight - GAME_CONFIG.SCREEN_HEIGHT * scale) / 2;
    }

    resize();
    window.addEventListener("resize", resize);

    await loadGameAssets((progress) => {
        loadingScreen.updateProgress(progress);
    });

    loadingScreen.hide();

    sound.play("sound_background", {loop: true, volume: 0.1});
    const leaderBoardPopup = new LeaderBoardPopup();
    const settingPopup = new SettingPopup({
        onRestart: () => {
            settingPopup.hide();
            game.gameOverController.replayGame();
        },
        onResume: () => {
            settingPopup.hide();
        },
        onReturnMainMenu: () => {
            settingPopup.hide();
            gameScreen.hide();
            mainMenuScreen.show();
        }
    });

    let game = null;
    const gameScreen = new GameScreen({
        onSetting: () => {
            settingPopup.show()
        }
    });
    masterContainer.addChild(gameScreen.container);
    const mainMenuScreen = new MainMenuScreen({
        onPlay: () => {
            mainMenuScreen.hide();
            gameScreen.show();
            if(game === null){
                game = new GameManager({
                    app,
                    gameContainer: gameScreen.container,
                    gameScreen: gameScreen,
                    leaderBoardPopup: leaderBoardPopup,
                    onReturnMainMenu: () => {
                        gameScreen.hide();
                        mainMenuScreen.show();
                    }
                });
                console.log("Pixi App đã khởi tạo:", app);
                window.gameTest = game;
            }else{
                game.start();
            }
        },

        onLeaderboard: () => {
            leaderBoardPopup.show();
        }
    });
    mainMenuScreen.show();
    masterContainer.addChild(mainMenuScreen.container);

    window.addEventListener("keydown", (event) => {
        if (event.code === "Space") {
            event.preventDefault();
            game.gameOverController.gameOver();

            // Ví dụ: gameScreen.pause();
        }
        if(event.code === "Enter") {
            event.preventDefault();
            settingPopup.show();
        }
    });

    masterContainer.addChild(leaderBoardPopup, settingPopup);
}

runTest();

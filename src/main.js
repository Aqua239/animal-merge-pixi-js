import { Application, Container } from "pixi.js";
import { sound } from "@pixi/sound";
import { GAME_CONFIG } from "./constant";
import { loadGameAssets } from "./assetLoader";
import { GameManager } from "./game/gameManager";
import LoadingScreen from "./UI/screens/loadingScreen";
import MainMenuScreen from "./UI/screens/mainMenuScreen";
import GameScreen from "./UI/screens/gameScreen";
import LeaderBoardPopup from "./UI/overlays/leaderBoardPopup";
import SettingPopup from "./UI/overlays/settingPopup";

async function main() {
    const app = new Application();

    await app.init({
        resizeTo: window,
        backgroundColor: 0xffffff,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });

    document.body.appendChild(app.canvas);
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    const masterContainer = new Container();
    app.stage.addChild(masterContainer);

    const resize = () => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const scaleX = screenWidth / GAME_CONFIG.SCREEN_WIDTH;
        const scaleY = screenHeight / GAME_CONFIG.SCREEN_HEIGHT;
        const scale = Math.min(scaleX, scaleY);

        masterContainer.scale.set(scale);
        masterContainer.x = (screenWidth - GAME_CONFIG.SCREEN_WIDTH * scale) / 2;
        masterContainer.y = (screenHeight - GAME_CONFIG.SCREEN_HEIGHT * scale) / 2;
    };

    resize();
    window.addEventListener("resize", resize);

    const loadingScreen = new LoadingScreen();
    masterContainer.addChild(loadingScreen.container);
    loadingScreen.show();

    await loadGameAssets((progress) => { loadingScreen.updateProgress(progress) });
    loadingScreen.hide();

    sound.play("sound_background", { loop: true, volume: 0.3 });
    const leaderBoardPopup = new LeaderBoardPopup();

    let game = null;
    const gameScreen = new GameScreen({
        onSetting: () => {
            settingPopup.show();
        },
    });

    const mainMenuScreen = new MainMenuScreen({
        onPlay: () => {
            mainMenuScreen.hide();
            gameScreen.show();

            if (game === null) {
                game = new GameManager({
                    app,
                    gameContainer:
                        gameScreen.container,
                    gameScreen,
                    leaderBoardPopup,

                    onReturnMainMenu: () => {
                        gameScreen.hide();
                        mainMenuScreen.show();
                    },
                });

                window.gameTest = game;
                return;
            }

            game.start();
        },

        onLeaderboard: () => {
            leaderBoardPopup.show();
        },
    });

    const settingPopup = new SettingPopup({
        onRestart: () => {
            settingPopup.hide();
            if (game) game.gameController.replayGame();
        },
        onResume: () => {
            settingPopup.hide();
        },
        onReturnMainMenu: () => {
            settingPopup.hide();
            gameScreen.hide();
            mainMenuScreen.show();
        },
    });

    masterContainer.addChild(
        gameScreen.container,
        mainMenuScreen.container,
        leaderBoardPopup,
        settingPopup
    );

    gameScreen.hide();
    mainMenuScreen.show();

    window.addEventListener(
        "keydown",
        (event) => {
            if (event.code === "Space" && game) {
                event.preventDefault();
                game.gameController.gameOver();
            }

            if (event.code === "Enter") {
                event.preventDefault();
                settingPopup.show();
            }
        }
    );
}

main()

import { Graphics, Text } from "pixi.js";
import BaseScreen from "./baseScreen";
import { GAME_CONFIG } from "../constant";

export default class LoadingScreen extends BaseScreen {
    constructor() {
        super();

        this.progressBarFill = null;

        this.drawBackground();
        this.drawGameName();
        this.drawProgressBar();
    }

    drawBackground() {
        const background = new Graphics();

        background.beginFill(GAME_CONFIG.COLOR_BACKGROUND);
        background.drawRect(
            GAME_CONFIG.ORIGIN_X,
            GAME_CONFIG.ORIGIN_Y,
            GAME_CONFIG.SCREEN_WIDTH,
            GAME_CONFIG.SCREEN_HEIGHT
        );
        background.endFill();

        this.container.addChild(background);
    }

    drawGameName() {
        const style = {
            fontFamily: "Arial",
            fontSize: 100,
            fill: 0x2c365a,
            fontWeight: "bold",
            dropShadow: false,
            dropShadowColor: "#FFFFFF",
            dropShadowBlur: 5,
            dropShadowDistance: 5,
        };

        const title = new Text("Animal Merge", style);

        title.anchor.set(0.5);
        title.x = GAME_CONFIG.SCREEN_WIDTH / 2;
        title.y = 700;

        this.container.addChild(title);
    }

    drawProgressBar() {

    }

    updateProgress(percent) {

    }
}

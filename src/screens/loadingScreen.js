import { Graphics, Text } from "pixi.js";
import BaseScreen from "./baseScreen";
import { GAME_CONFIG } from "../constant";

export default class LoadingScreen extends BaseScreen {
    constructor() {
        super(GAME_CONFIG.BACKGROUND_COLOR);

        this.progressBarFill = null;

        this.drawGameName();
        this.drawProgressBar();
    }

    drawGameName() {
        const style = {
            fontFamily: "Arial",
            fontSize: 100,
            fill: GAME_CONFIG.TEXT_COLOR,
            fontWeight: "bold",
            dropShadow: false,
            dropShadowColor: "#FFFFFF",
            dropShadowBlur: 5,
            dropShadowDistance: 5,
        };

        const title = new Text({text: "Animal Merge", style});

        title.anchor.set(0.5);
        title.x = GAME_CONFIG.SCREEN_WIDTH / 2;
        title.y = 700;

        this.container.addChild(title);
    }

    drawProgressBar() {
        const barWidth = 600;
        const barHeight = 40;
        const xPos = (GAME_CONFIG.SCREEN_WIDTH - barWidth) / 2;
        const yPos = 1000;

        const barOutline = new Graphics();
        barOutline
            .roundRect(xPos, yPos, barWidth, barHeight, 20)
            .fill(0x555555)
            .stroke({ width: 4, color: 0x333333 });

        this.progressBarFill = new Graphics();
        this.progressBarFill
            .roundRect(xPos, yPos, 0, barHeight, 20)
            .fill(0xffd700);

        this.container.addChild(barOutline);
        this.container.addChild(this.progressBarFill);
    }

    updateProgress(percent) {
        const clampedPercent = Math.max(0, Math.min(1, percent));

        const barWidth = 600;
        const barHeight = 40;
        const xPos = (GAME_CONFIG.SCREEN_WIDTH - barWidth) / 2;
        const yPos = 1000;

        this.progressBarFill.clear();
        this.progressBarFill
            .roundRect(xPos, yPos, barWidth * clampedPercent, barHeight, 20)
            .fill(0xFFD700);
    }
}

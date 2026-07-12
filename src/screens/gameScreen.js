import { Graphics, Text, Texture } from "pixi.js";
import BaseScreen from "./baseScreen";
import { GAME_CONFIG } from "../constant";

export default class GameScreen extends BaseScreen {
    constructor() {
        super(GAME_CONFIG.COLOR_BACKGROUND);

        this.currentScoreText = null;
        this.highScoreText = null;

        this.drawBoundaries();
        this.drawNextAnimalBackground();
        this.drawScores();
        this.drawSettingsButton();
        this.drawMergeTree();
    }

    drawBoundaries(){
        const marginX = 0;
        const floorThickness = 15;
        const floorColor = 0x2C365A;
        const floor = new Graphics();
        floor.rect(
            marginX,
            GAME_CONFIG.FLOOR_Y,
            GAME_CONFIG.GAME_AREA_WIDTH,
            floorThickness
        ).fill(floorColor);

        const dashLine = new Graphics();
        const dangerDashLength = 30;
        const dangerDashGap = 15;

        for(let i = marginX; i < GAME_CONFIG.GAME_AREA_WIDTH - marginX; i +=dangerDashLength) {
            dashLine.moveTo(i, GAME_CONFIG.CEILING_Y)
                    .lineTo(i + dangerDashGap, GAME_CONFIG.CEILING_Y)
                    .stroke({ width: 6, color: 0x2C365A });
        }

        this.container.addChild(floor);
        this.container.addChild(dashLine);
    };

    drawNextAnimalBackground(){};

    drawScores(){};

    drawSettingsButton(){};

    drawMergeTree(){};
}


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


    drawBoundaries(){};

    drawNextAnimalBackground(){};

    drawScores(){};

    drawSettingsButton(){};

    drawMergeTree(){};
}


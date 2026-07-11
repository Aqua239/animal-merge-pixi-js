import { Graphics, Text, Texture } from "pixi.js";
import BaseScreen from "./baseScreen";

export default class GameScreen extends BaseScreen {
    constructor() {
        super();

        this.currentScoreText = null;
        this.highScoreText = null;

        this.drawBackground();
        this.drawBoundaries();
        this.drawNextAnimalBackground();
        this.drawScores();
        this.drawSettingsButton();
        this.drawMergeTree();
    }

    drawBackground(){};

    drawBoundaries(){};

    drawNextAnimalBackground(){};

    drawScores(){};

    drawSettingsButton(){};

    drawMergeTree(){};
}


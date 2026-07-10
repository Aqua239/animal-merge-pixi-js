import { Graphics, Text } from "pixi.js";
import BaseScreen from "./baseScreen";

export default class LoadingScreen extends BaseScreen {
    constructor() {
        super();

        this.progressBarFill = null;

        this.drawBackground();
        this.drawGameName();
        this.drawProgressBar();
    }

    drawBackground() {

    }

    drawGameName() {

    }

    drawProgressBar() {

    }

    updateProgress(percent) {

    }
}

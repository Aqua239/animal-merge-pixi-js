import { fontStringFromTextStyle, Graphics, Text, TextStyle } from "pixi.js";
import BaseScreen from "./baseScreen";
import { GAME_CONFIG } from "../constant";
import { TextButton } from "../UI/button";

export default class MainMenuScreen extends BaseScreen {
    constructor({onPlay, onLeaderboard}) {
        super(GAME_CONFIG.BACKGROUND_COLOR);

        this.progressBarFill = null;

        this.onPlay = onPlay;
        this.onLeaderboard = onLeaderboard;

        this.drawGameName();
        this.drawPlayButton();
        this.drawLeaderboardButton();
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

        const title = new Text("Animal Merge", style);

        title.anchor.set(0.5);
        title.x = GAME_CONFIG.SCREEN_WIDTH / 2;
        title.y = 700;

        this.container.addChild(title);
    }

    drawPlayButton() {
        const playButton = new TextButton({
            text: "Play",
            textStyle: {
                fontFamily: GAME_CONFIG.FONT_FAMILY,
                fontSize: 70,
                fill: 0xC4BCB0,
                fontWeight: 'bold'
            },
            textureName: "button_large",
            x: GAME_CONFIG.GAME_AREA_WIDTH / 2,
            y: 1000,
            width: 400,
            height: 120,
            onClick: this.onPlay
        });
        this.container.addChild(playButton);
    }

    drawLeaderboardButton() {
        const leaderboardButton = new TextButton({
            text: "Score",
            textStyle: {
                fontFamily: GAME_CONFIG.FONT_FAMILY,
                fontSize: 70,
                fill: 0xC4BCB0,
                fontWeight: 'bold'
            },
            textureName: "button_large",
            x: GAME_CONFIG.GAME_AREA_WIDTH / 2,
            y: 1200,
            width: 400,
            height: 120,
            onClick: this.onLeaderboard
        });
        this.container.addChild(leaderboardButton);
    }
}

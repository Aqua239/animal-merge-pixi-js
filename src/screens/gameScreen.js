import { Container, Graphics, Text, Texture } from "pixi.js";
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

    drawNextAnimalBackground(){
        const radius = 80;
        const backgroundCircle = new Graphics();

        backgroundCircle.circle(
            GAME_CONFIG.NEXT_ANIMAL_POSITION_X,
            GAME_CONFIG.NEXT_ANIMAL_POSITION_Y,
            radius
        ).fill(0x2C365A);
        backgroundCircle.stroke({ width: 10, color: 0xC4BCB0});

        this.container.addChild(backgroundCircle);
    };

    drawScores(){
        const screenCenterX = GAME_CONFIG.SCREEN_WIDTH / 2;
        const scoreStyle = {fontFamily: GAME_CONFIG.FONT_FAMILY, fontSize: 50, fill: 0x2C365A, fontWeight: 'bold'};
        const labelStyle = {fontFamily: GAME_CONFIG.FONT_FAMILY, fontSize: 50, fill: 0x2C365A, fontWeight: 'bold'};

        //High Score
        this.highScoreContainer = new Container();

        const highScoreLabel = new Text({text: 'BEST', style: labelStyle});
        highScoreLabel.x = 0;
        highScoreLabel.y = 0;

        this.highScoreText = new Text({text: '9999', style: scoreStyle});
        this.highScoreText.x = highScoreLabel.width + 20;
        this.highScoreText.y = 0;

        this.highScoreContainer.addChild(highScoreLabel, this.highScoreText);
        this.highScoreContainer.x = screenCenterX - (this.highScoreContainer.width / 2);
        this.highScoreContainer.y = 150 - scoreStyle.fontSize;

        //Current Score
        this.currentScoreContainer = new Container();

        const currentScoreLabel = new Text({text: 'SCORE', style: labelStyle});
        currentScoreLabel.x = 0;
        currentScoreLabel.y = 0;

        this.currentScoreText = new Text({text: '0', style: scoreStyle});
        this.currentScoreText.x = currentScoreLabel.width + 20;
        this.currentScoreText.y = 0;

        this.currentScoreContainer.addChild(currentScoreLabel, this.currentScoreText);
        this.currentScoreContainer.x = screenCenterX - (this.currentScoreContainer.width / 2);
        this.currentScoreContainer.y = 150;

        this.container.addChild(this.highScoreContainer, this.currentScoreContainer);
    };

    drawSettingsButton(){};

    drawMergeTree(){};
}


import { Text } from "pixi.js";
import { GAME_CONFIG } from "../constant";
import { IconCircleButton } from "../UI/button";
import BasePopup from "./basePopup";
import { BaseButton } from "../UI/baseButton";

export default class LeaderBoardPopup extends BasePopup{
    constructor() {
        super({textureName: "panel_rounded", boardWidth: 800, boardHeight: 800});

        this.top1Text = null;
        this.top2Text = null;
        this.top3Text = null;

        this.drawTitle();
        this.drawScoreList();
        this.drawCloseButton();
    }

    drawTitle() {
        const titleText = new Text({
            text: "LEADERBOARD",
            style: {
                fontFamily: GAME_CONFIG.FONT_FAMILY,
                fontSize: 70,
                fill: 0xC4BCB0,
                fontWeight: 'bold'
            }
        });

        titleText.anchor.set(0.5);
        titleText.y = -230;

        this.boardContainer.addChild(titleText);
    }

    drawScoreList() {
        const textStyle = {
            fontFamily: GAME_CONFIG.FONT_FAMILY,
            fontSize: 60,
            fill: 0xC4BCB0,
            fontWeight: 'bold'
        };

        this.top1Text = new Text({ text: '1. ---', style: textStyle });
        this.top1Text.anchor.set(0, 0.5);
        this.top1Text.position.set(-250, -100);

        this.top2Text = new Text({ text: '2. ---', style: textStyle });
        this.top2Text.anchor.set(0, 0.5);
        this.top2Text.position.set(-250, 25);

        this.top3Text = new Text({ text: '3. ---', style: textStyle });
        this.top3Text.anchor.set(0, 0.5);
        this.top3Text.position.set(-250, 150);

        this.boardContainer.addChild(this.top1Text, this.top2Text, this.top3Text);
    }

    drawCloseButton() {
        const closeButton = new BaseButton({
            textureName: "button_exit",
            width: 80,
            height: 80,
            radius: 40,
            x: 300,
            y: -300,
            onClick: () => {
                this.hide();
            }
        });

        this.boardContainer.addChild(closeButton);
    }

    updateScores(leaderBoard) {
        const textElements = [this.top1Text, this.top2Text, this.top3Text];

        for (let i = 0; i < textElements.length; i++) {
            if (leaderBoard[i] !== undefined) {
                textElements[i].text = `${i + 1}. ${leaderBoard[i]}`;
            }
            else {
                textElements[i].text = `${i + 1}. ---`;
            }
        }
    }

    hide() {
        this.visible = false;
    }
}

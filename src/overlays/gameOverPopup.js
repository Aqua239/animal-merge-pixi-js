import { Text } from "pixi.js"
import { BaseButton } from "../UI/baseButton";
import BasePopup from "./basePopup"

export default class GameOverPopup extends BasePopup {
    constructor({score = 0, onReplay, onReturnMainMenu}) {
        super({textureName: "box_rounded", boardWidth: 800, boardHeight: 800})

        const titleText = new Text({
            text: "GAME OVER",
            style: {fontSize: 160, fill: 0xC4BCB0, fontWeight: 'bold'}
        });
        titleText.anchor.set(0.5);
        titleText.y =-350;

        const scoreText = new Text({
            text: `Score: ${score}`,
            style: {fontSize: 120, fill: 0xC4BCB0}
        })
        scoreText.anchor.set(0.5);
        scoreText.y = -100;

        const replayButton = new BaseButton({
            textureName: "button_base",
            x: -250,
            y: 250,
            width: 300,
            height: 300,
            onClick: onReplay,
            iconName: 'icon_return'
        });

        const returnMainMenuButton = new BaseButton({
            textureName: "button_base",
            x: 250,
            y: 250,
            width: 300,
            height: 300,
            onClick: onReturnMainMenu,
            iconName: 'icon_home'
        });

        this.boardSprite.addChild(titleText, scoreText, replayButton, returnMainMenuButton);
    }
}

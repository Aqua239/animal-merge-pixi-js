import { Text } from "pixi.js"
import BasePopup from "./basePopup"
import { IconButton } from "../UI/button";

export default class GameOverPopup extends BasePopup {
    constructor({score = 0, onReplay, onReturnMainMenu}) {
        super({textureName: "panel_rounded", boardWidth: 800, boardHeight: 800})

        const titleText = new Text({
            text: "GAME OVER",
            style: {fontSize: 80, fill: 0xC4BCB0, fontWeight: 'bold'}
        });
        titleText.anchor.set(0.5);
        titleText.y =-200;

        const scoreText = new Text({
            text: `Score: ${score}`,
            style: {fontSize: 60, fill: 0xC4BCB0}
        })
        scoreText.anchor.set(0.5);
        scoreText.y = -75;

        const replayButton = new IconButton({
            textureName: "button_base_green",
            x: -125,
            y: 125,
            width: 150,
            height: 150,
            onClick: onReplay,
            iconName: "icon_return_white"
        });

        const returnMainMenuButton = new IconButton({
            textureName: "button_base_blue",
            x: 125,
            y: 125,
            width: 150,
            height: 150,
            onClick: onReturnMainMenu,
            iconName: "icon_home_white"
        });

        this.boardContainer.addChild(titleText, scoreText, replayButton, returnMainMenuButton);
    }
}

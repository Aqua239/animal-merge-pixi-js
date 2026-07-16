import { Graphics, Container, Sprite } from "pixi.js";
import { GAME_CONFIG } from "../constant";

export default class BasePopup extends Container {
    constructor({textureName, boardWidth = 800, boardHeight = 800}) {
        super();
        this.visible = false;

        const overlayBackground = new Graphics();
        overlayBackground.rect(
            0,
            0,
            GAME_CONFIG.SCREEN_WIDTH,
            GAME_CONFIG.SCREEN_HEIGHT
        ).fill({color: 0x000000, alpha: 0.7})
        overlayBackground.eventMode = 'static';
        this.addChild(overlayBackground);

        this.boardContainer = new Container();
        this.boardContainer.position.set(GAME_CONFIG.SCREEN_WIDTH / 2, GAME_CONFIG.SCREEN_HEIGHT / 2);


        this.boardSprite = Sprite.from(textureName);
        this.boardSprite.anchor.set(0.5);

        if(boardWidth && boardHeight) {
            this.boardSprite.width = boardWidth;
            this.boardSprite.height = boardHeight;
        }

        this.boardContainer.addChild(this.boardSprite);
        this.addChild(this.boardContainer);
    }

    show() {
        this.visible = true;
        // add animation
    }

    hide() {
        this.destroy();
        // add animation
    }
}

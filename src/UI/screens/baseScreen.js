import { Container, Graphics } from "pixi.js";
import { GAME_CONFIG } from "../../constant";

export default class BaseScreen {
    constructor(backgroundColor = GAME_CONFIG.BACKGROUND_COLOR) {
        this.container = new Container();
        this.container.visible = false;

        this.drawBackground(backgroundColor);
    }

    drawBackground(color) {
        this.background = new Graphics();
        this.background.rect(
            GAME_CONFIG.ORIGIN_X,
            GAME_CONFIG.ORIGIN_Y,
            GAME_CONFIG.SCREEN_WIDTH,
            GAME_CONFIG.SCREEN_HEIGHT
        ).fill(color);
        this.container.addChild(this.background);
    }

    show() {
        this.container.visible = true;
    }

    hide() {
        this.container.visible = false;
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}

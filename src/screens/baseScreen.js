import { Container } from "pixi.js";

export default class BaseScreen {
    constructor() {
        this.container = new Container();
        this.container.visible = false;
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

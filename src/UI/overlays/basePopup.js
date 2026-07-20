import { Graphics, Container, Sprite } from "pixi.js";
import { GAME_CONFIG } from "../../constant";

export default class BasePopup extends Container {
    constructor({textureName, boardWidth = 800, boardHeight = 800}) {
        super();
        this.visible = false;
        this.baseY = 0;

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
        if (this.visible === true) return;

        if (this.animFrame) {
            cancelAnimationFrame(this.animFrame);
        };

        this.visible = true;
        this.isHiding = false;
        this.alpha = 0;

        const targetBoardY = GAME_CONFIG.SCREEN_HEIGHT / 2;

        this.boardContainer.y = targetBoardY - 50;

        const animate = () => {
            if (this.isHiding) return;
            const easeSpeed = 0.1;

            this.alpha += (1 - this.alpha) * easeSpeed;
            this.boardContainer.y += (targetBoardY - this.boardContainer.y) * easeSpeed;

            if (Math.abs(targetBoardY - this.boardContainer.y) > 0.5) {
                this.animFrame = requestAnimationFrame(animate);
            }
            else {
                this.alpha = 1;
                this.boardContainer.y = targetBoardY;
            }
        };
        requestAnimationFrame(animate);
    }

    hide() {
        if (this.visible === false || this.isHiding) return;

        if (this.animFrame) {
            cancelAnimationFrame(this.animFrame);
        }
        this.isHiding = true;
        const targetBoardY = GAME_CONFIG.SCREEN_HEIGHT / 2;

        const animate = () => {
            const easeSpeed = 0.15;
            this.alpha += (0 - this.alpha) * easeSpeed;
            this.boardContainer.y += ((targetBoardY + 50) - this.boardContainer.y) * easeSpeed;

            if (this.alpha > 0.05) {
                this.animFrame = requestAnimationFrame(animate);
            }
            else {
                this.alpha = 0;
                this.visible = false;
                this.isHiding = false;
                this.boardContainer.y = targetBoardY;
            }
        };
        requestAnimationFrame(animate);
    }
}

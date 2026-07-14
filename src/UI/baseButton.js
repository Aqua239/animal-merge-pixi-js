import { Container, Sprite } from "pixi.js";

export class BaseButton extends Container {
    constructor({textureName, x = 0, y = 0, width, height, onClick}) {
        super();

        this.onClickCallback = onClick;
        this.buttonSprite = Sprite.from(textureName);
        this.buttonSprite.anchor.set(0.5);

        if(width && height) {
            this.buttonSprite.width = width;
            this.buttonSprite.height = height;
        }

        this.baseScaleX = this.buttonSprite.scale.x;
        this.baseScaleY = this.buttonSprite.scale.y;

        this.addChild(this.buttonSprite);
        this.position.set(x, y);

        this.buttonSprite.eventMode = 'static';
        this.buttonSprite.cursor = 'pointer';

        this.buttonSprite.on('pointerdown', this.onPointerDown.bind(this));
        this.buttonSprite.on('pointerup', this.onPointerUp.bind(this));
        this.buttonSprite.on('pointerupoutside', this.onPointerUpOutside.bind(this));
        this.buttonSprite.on('pointerover', this.onPointerOver.bind(this));
        this.buttonSprite.on('pointerout', this.onPointerOut.bind(this));
    }

    setVisualPressedState(isPressed){
        if(isPressed) {
            this.buttonSprite.scale.set(this.baseScaleX * 0.9, this.baseScaleY * 0.9);
            this.buttonSprite.tint = 0xAAAAAA;
        }
        else {
            this.buttonSprite.scale.set(this.baseScaleX, this.baseScaleY);
            this.buttonSprite.tint = 0xFFFFFF;
        }
    }

    onPointerDown() {
        this.setVisualPressedState(true);
    }

    onPointerUp() {
        this.setVisualPressedState(false);
        this.onPointerOver();
        if(this.onClickCallback) {
            this.onClickCallback();
        }
    }

    onPointerUpOutside() {
        this.setVisualPressedState(false);
    }

    onPointerOver() {
        this.buttonSprite.scale.set(this.baseScaleX * 1.2, this.baseScaleY * 1.2);
    }

    onPointerOut() {
        this.buttonSprite.scale.set(this.baseScaleX, this.baseScaleY);
    }
}

import { Container, Sprite } from "pixi.js";

export class BaseButton extends Container {
    constructor({textureName, x = 0, y = 0, width, height, onClick, iconName, iconScale = 1}) {
        super();

        this.onClickCallback = onClick;
        this.buttonSprite = Sprite.from(textureName);
        this.buttonSprite.anchor.set(0.5);

        if(width && height) {
            this.buttonSprite.width = width;
            this.buttonSprite.height = height;
        }

        this.addChild(this.buttonSprite);
        this.position.set(x, y);

        if (iconName) {
            this.iconSprite = Sprite.from(iconName);

            this.iconSprite.anchor.set(0.5);

            const maxIconSize = Math.min(this.buttonSprite.width, this.buttonSprite.height) * 0.7 * iconScale;

            const scaleRatio = maxIconSize / Math.max(this.iconSprite.width, this.iconSprite.height);
            this.iconSprite.scale.set(scaleRatio);

            this.addChild(this.iconSprite);
        }

        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerdown', this.onPointerDown.bind(this));
        this.on('pointerup', this.onPointerUp.bind(this));
        this.on('pointerupoutside', this.onPointerUpOutside.bind(this));
        this.on('pointerover', this.onPointerOver.bind(this));
        this.on('pointerout', this.onPointerOut.bind(this));

        this.baseScaleX = this.scale.x;
        this.baseScaleY = this.scale.y;
    }

    setVisualPressedState(isPressed){
        if(isPressed) {
            this.scale.set(this.baseScaleX * 0.9, this.baseScaleY * 0.9);
            this.buttonSprite.tint = 0xAAAAAA;
        }
        else {
            this.scale.set(this.baseScaleX, this.baseScaleY);
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
        this.scale.set(this.baseScaleX * 1.2, this.baseScaleY * 1.2);
    }

    onPointerOut() {
        this.scale.set(this.baseScaleX, this.baseScaleY);
    }
}

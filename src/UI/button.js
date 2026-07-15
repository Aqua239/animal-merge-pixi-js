import { Text, Sprite } from "pixi.js";
import { BaseButton } from "./baseButton";

export class IconButton extends BaseButton {
    constructor({ iconName, iconScale = 1, ...baseConfig}) {
        const iconSprite = Sprite.from(iconName);

        super({...baseConfig, content: iconSprite});

        if (this.buttonSprite.width && this.buttonSprite.height) {
            const maxIconSize = Math.min(this.buttonSprite.width, this.buttonSprite.height) * 0.7 * iconScale;
            const scaleRatio = maxIconSize / Math.max(iconSprite.width, iconSprite.height);

            iconSprite.scale.set(scaleRatio);
        }
        else {
            iconSprite.scale.set(iconScale);
        }
    }
}

export class TextButton extends BaseButton {
    constructor({ text, textStyle, ...baseConfig}) {
        const textContent = new Text({
            text: text,
            style: textStyle
        });
        super({
            ...baseConfig,
            content: textContent
        })
    }
}

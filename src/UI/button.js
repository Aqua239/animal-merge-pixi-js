import { Text, Sprite, Texture } from "pixi.js";
import { BaseButton } from "./baseButton";
import { sound } from "@pixi/sound";

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

export class AudioToggleButton extends IconButton {
    static allInstances = [];

    constructor({iconOn, iconOff, targetAlias, ...baseConfig}) {
        super({...baseConfig, iconName: iconOn});

        this.iconOn = iconOn;
        this.iconOff = iconOff;
        this.targetAlias = targetAlias;

        AudioToggleButton.allInstances.push(this);

        this.synchronizeIcon();

        this.onClickCallback = () => {
            this.isMuted = !this.isMuted;

            const targetAudio = sound.find(this.targetAlias);

            if(targetAudio) {
                targetAudio.muted = this.isMuted;
            }

            AudioToggleButton.synchronizeAllButtons();

            if (baseConfig.onClick) {
                baseConfig.onClick(this.isMuted);
            }
        };
    }

    synchronizeIcon() {
        const targetAudio = sound.find(this.targetAlias);
        this.isMuted = targetAudio ? targetAudio.muted : false;
        this.content.texture = Texture.from(this.isMuted ? this.iconOff : this.iconOn);
    }

    static synchronizeAllButtons() {
        AudioToggleButton.allInstances.forEach(button => button.synchronizeIcon());
    }
}

import { ANIMAL_LEVEL } from "../../constant";
import { Sprite, Assets, Rectangle, Texture } from 'pixi.js';
import { circleCollider } from "../system/circleCollider";

class Animal extends circleCollider{
    constructor(level, xSpawn, ySpawn){
        const config = ANIMAL_LEVEL[level];
        super(xSpawn, ySpawn, config.radius);
        this.level = level;
        this.vx = config.vx;
        this.vy = config.vy;
        this.score = config.score;

        const baseTexture = Assets.get(config.textureName);
        const frame = new Rectangle(
            config.xSprite,
            config.ySprite,
            config.widthSprite,
            config.heightSprite
        )

        const texture = new Texture(baseTexture, frame)
        this.sprite = new Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.sprite.x = xSpawn;
        this.sprite.y = ySpawn;
    }

    checkTwoCircleSameId(){}

    destroy(){}
}


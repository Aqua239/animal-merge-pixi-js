import { ANIMAL_LEVEL } from "../../constant";
import { Sprite, Assets, Rectangle, Texture, Container } from 'pixi.js';

export class Animal extends Container{
    constructor(level, xSpawn, ySpawn){
        const config = ANIMAL_LEVEL[level];
        super();
        this.x = xSpawn;
        this.y = ySpawn;
        this.level = level;
        this.radius = config.radius;
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

    checkTwoCircleSameId(otherAnimal){
        return this.level === otherAnimal.level;
    }

    destroy(){
        if(this.sprite){
            this.sprite.destroy();
        }
    }
}


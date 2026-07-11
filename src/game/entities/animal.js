import { ANIMAL_LEVEL } from "../../constant";
import { Sprite, Assets, Rectangle, Texture, Container } from 'pixi.js';

export class Animal extends Container{
    constructor(level, xSpawn, ySpawn, isNextAnimal){
        const config = ANIMAL_LEVEL[level];
        super();
        this.x = xSpawn;
        this.y = ySpawn;
        this.level = level;
        this.radius = isNextAnimal ? 25 : config.radius;
        this.vx = config.vx;
        this.vy = config.vy;
        this.score = config.score;

        const baseTexture = Assets.get(config.textureName);
        const frame = new Rectangle(
            config.xSprite,
            config.ySprite,
            config.widthSprite,
            config.heightSprite
        );

        const texture = new Texture({
            source: baseTexture.source,
            frame: frame,
        });
        this.sprite = new Sprite(texture);
        this.sprite.anchor.set(0.5);
        const diameter = this.radius * 2;
        this.sprite.width = diameter;
        this.sprite.height = diameter;
        this.sprite.x = 0;
        this.sprite.y = 0;
        this.addChild(this.sprite);
    }

    convertFromNextToCurrent(){
        const config = ANIMAL_LEVEL[this.level];
        this.radius = config.radius;

        const diameter = this.radius * 2;
        this.sprite.width = diameter;
        this.sprite.height = diameter;
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


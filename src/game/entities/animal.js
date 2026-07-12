import { ANIMAL_LEVEL } from "../../constant";
import { Sprite, Assets, Rectangle, Texture, Container } from 'pixi.js';
import { CircleCollider } from "../system/circleCollider";

export class Animal extends Container{
    constructor(level, xSpawn, ySpawn, isNextAnimal){
        const config = ANIMAL_LEVEL[level];
        super();
        this.x = xSpawn;
        this.y = ySpawn;
        this.level = level;
        this.radius = isNextAnimal ? 25 : config.radius;
        this.score = config.score;

        this.isNextAnimal = isNextAnimal;
        this.isPhysicsActive = false;
        this.isMerging = false;

        this.collider = new CircleCollider(xSpawn, ySpawn, this.radius);
        this.collider.vx = config.vx;
        this.collider.vy = config.vy;

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
        this.updateSpriteSize();

        this.addChild(this.sprite);
    }

    updateSpriteSize(){
        const diameter = this.radius * 2;
        this.sprite.width = diameter;
        this.sprite.height = diameter;

        this.sprite.x = 0;
        this.sprite.y = 0;
    }

    convertFromNextToCurrent(){
        const config = ANIMAL_LEVEL[this.level];
        this.isNextAnimal = false;
        this.radius = config.radius;

        this.collider.radius = this.radius;
        this.collider.x = this.x;
        this.collider.y = this.y;
        this.collider.vx = 0;
        this.collider.vy = 0;

        this.updateSpriteSize();
    }

    convertPhysicMode(){
        this.isPhysicsActive = true;
        this.collider.x = this.x;
        this.collider.y = this.y;
    }

    //function used when the Physics system creates a new collider after a merge
    attachCollider(collider) {
        this.collider = collider;
        this.radius = collider.radius;
        this.isPhysicsActive = true;

        this.updateSpriteSize();
        this.setSpriteFollowCollider();
    }

    //function used while moving an object before dropping it
    setColliderFollowSprite(x, y){
        if(this.isPhysicsActive) return;

        this.x = x;
        this.y = y;
        this.collider.x = x;
        this.collider.y = y;
    }

    //function used after the object has been released and is moving via physics
    setSpriteFollowCollider(){
        this.x = this.collider.x;
        this.y = this.collider.y;
    }

    checkTwoCircleSameId(otherAnimal){
        return this.level === otherAnimal.level;
    }

    destroy(){
        super.destroy({
            children: true,
        });
    }
}


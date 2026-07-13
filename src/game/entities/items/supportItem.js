import { Container, Sprite } from "pixi.js";

export class SupportItem extends Container{
    constructor({
        texture,
        quantity = 0,
        onUse = null,
    }){
        super();
        this.quantity = quantity;
        this.onUse = onUse;
        this.isActive = false;

        this.sprite = Sprite.from(texture);
        this.sprite.anchor.set(0.5);
        this.addChild(this.sprite);

        this.eventMode = "static";
        this.cursor = "pointer";

        this.on("pointerdown", (event) => {
            event.stopPropagation();
            if(!this.isActive){
                this.activate();
            }else{
                this.deactivate();
            }
        });
    }

    activate(){
        if(this.quantity <= 0) return;

        this.isActive = true;
        if (this.onUse) {
            this.onUse(this);
        }
    }

    deactivate(){
        this.isActive = false;
        if (this.onUse) {
            this.onUse(this);
        }
    }

    reduceQuantity(){}
}

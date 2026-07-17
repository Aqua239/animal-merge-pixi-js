import { SupportItem } from "./supportItem";

export class MixItem extends SupportItem{
    constructor({texture, quantity = 0, onUse = null, x = 0, y = 0, width = 10, height = 10, cost = 0}){
        super({texture, quantity, onUse, cost});
        this.x = x;
        this.y = y;
        this.sprite.width = width;
        this.sprite.height = height;
    }

    
}

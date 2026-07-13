import { SupportItem } from "./supportItem";

export class RemoveItem extends SupportItem{
    constructor({texture, quantity = 0, onUse = null, x = 0, y = 0, width = 10, height = 10}){
        super({texture, quantity, onUse});
        this.x = x;
        this.y = y;
        this.sprite.width = width;
        this.sprite.height = height;
    }

    use(){}
}

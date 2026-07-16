import { SupportItem } from "./supportItem";

export class RemoveItem extends SupportItem{
    constructor({texture, quantity = 0, onUse = null, x = 0, y = 0, width = 10, height = 10, cost = 0}){
        super({texture, quantity, onUse, cost});
        this.x = x;
        this.y = y;
        this.sprite.width = width;
        this.sprite.height = height;
    }

    use(){
        if (!this.isActive) return;
        const isUsed = this.reduceQuantity();
        if (!isUsed) return;
        this.hasPendingPurchase = false;
        
        this.deactivate();
    }
}

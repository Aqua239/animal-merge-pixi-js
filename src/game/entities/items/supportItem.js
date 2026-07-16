import { Container, Sprite } from "pixi.js";
import { gameStore } from "../../store/gameStore";

export class SupportItem extends Container{
    constructor({
        texture,
        quantity = 0,
        onUse = null,
        cost = 0,
    }){
        super();
        this.quantity = quantity;
        this.cost = cost;
        this.onUse = onUse;

        this.isActive = false;
        this.hasPendingPurchase = false;

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
                this.cancel();
            }
        });
    }

    activate(){
        const purchased = this.checkItemCost();
        if (!purchased) return false;
        // if(this.quantity <= 0) return false;

        this.isActive = true;
        this.hasPendingPurchase = true;
        if (this.onUse) {
            this.onUse(this);
        }
        return true;
    }

    cancel() {
        if (!this.isActive) return false;
        if (this.hasPendingPurchase) {
            gameStore.addCoin(this.cost);
            this.reduceQuantity();
            this.hasPendingPurchase = false;
        }

        this.deactivate();
        return true;
    }

    deactivate(){
        this.isActive = false;
        if (this.onUse) {
            this.onUse(this);
        }
    }

    reduceQuantity(){
        if (this.quantity <= 0) return false;

        this.quantity--;
        return true;
    }

    checkItemCost(){
        const totalCoin = gameStore.getCoin();
        if (totalCoin < this.cost) return false;

        const isSuccess = gameStore.spendCoin(this.cost);
        if (!isSuccess) return false;

        this.quantity++;
        return true;
    }
}

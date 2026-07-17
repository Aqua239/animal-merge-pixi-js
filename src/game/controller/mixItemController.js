import { Texture } from "pixi.js";
import { gameStore } from "../store/gameStore";
import { MixItem } from "../entities/items/mixItem";

export class MixItemController {
    constructor(
        gameManager,
        gameScreen,
        mixAnimalSystem
    ) {
        this.gameManager = gameManager;
        this.gameScreen = gameScreen;
        this.mixAnimalSystem = mixAnimalSystem;

        this.mixItem = new MixItem({
            texture: Texture.WHITE,
            quantity: 0,
            x: 120,
            y: 200,
            width: 50,
            height: 50,
            cost: 1,

            onUse: (item) => {
                this.updateButtonState(item.isActive);
            },
        });

        this.gameScreen.updateItemPrice("mix", this.mixItem.cost);
        this.gameScreen.setMixItemClickHandler(() => {
            this.handleUseMixItem();
        });
    }

    handleUseMixItem() {

        const activated = this.mixItem.activate();
        if (!activated) return;

        //handle the physics logic here

        this.mixItem.use();
        this.gameScreen.updateCoin(gameStore.getCoin());
    }
    }

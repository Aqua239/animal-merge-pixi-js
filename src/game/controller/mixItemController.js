import { Texture } from "pixi.js";
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
    }

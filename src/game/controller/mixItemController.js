import { Texture } from "pixi.js";
import { gameStore } from "../store/gameStore";
import { MixItem } from "../entities/items/mixItem";

export class MixItemController {
    constructor(
        gameManager,
        gameScreen
    ) {
        this.gameManager = gameManager;
        this.gameScreen = gameScreen;

        this.mixItem = new MixItem({
            texture: Texture.WHITE,
            quantity: 0,
            x: 120,
            y: 200,
            width: 50,
            height: 50,
            cost: 350,

            onUse: (item) => {
                this.setMixMode(item.isActive);
                this.updateButtonState(item.isActive);
            },
        });

        this.gameScreen.updateItemPrice("mix", this.mixItem.cost);
        this.gameScreen.setMixItemClickHandler(() => {
            this.handleUseMixItem();
        });
    }

    handleUseMixItem() {
        if (!this.canUseMixItem()) return;

        const activated = this.mixItem.activate();
        if (!activated) return;

        this.gameManager.world.activateItemFly();
        setTimeout(() => {
            this.mixTimer = null;
            if (this.mixItem.isActive) this.mixItem.use();
        }, 3000)

        this.gameScreen.updateCoin(gameStore.getCoin());
    }

    canUseMixItem() {
        if (!this.gameManager.isGameRunning) return false;
        if (this.gameManager.isGamePause) return false;
        if (this.gameManager.isGameOver) return false;
        if (this.mixItem.isActive) return false;
        if (this.gameManager.removeItemController.removeItem.isActive) return false;
        if (this.gameManager.world.animals.length === 0) return false;
        return true;
    }

    updateButtonState(isActive) {
        const button = this.gameScreen.mixItemButton;
        if (!button) return;
        button.alpha =isActive ? 0.7 : 1;
    }

    reset() {
        if (this.mixTimer) {
            clearTimeout(this.mixTimer);
            this.mixTimer = null;
        }

        if (this.mixItem.isActive) this.mixItem.cancel();
        this.updateButtonState(false);
    }

    setMixMode(isActive) {
        const currentAnimal = this.gameManager.currentAnimal;

        if (currentAnimal && !currentAnimal.destroyed) currentAnimal.visible = !isActive;
    }
}

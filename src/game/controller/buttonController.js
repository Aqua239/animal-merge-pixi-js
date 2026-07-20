import { Texture } from "pixi.js";

import { gameStore } from "../store/gameStore";
import { MixItem } from "../entities/items/mixItem";
import { RemoveItem } from "../entities/items/removeItem";

export class ButtonController {
    constructor(gameManager, gameScreen){
        this.gameManager = gameManager;
        this.gameScreen = gameScreen;

        this.mixTimer = null;

        this.createRemoveItem();
        this.createMixItem();
        this.setupItemButtons();
    }

    createRemoveItem(){
        this.removeItem = new RemoveItem({
            texture: Texture.WHITE,
            quantity: 0,
            x: 50,
            y: 200,
            width: 50,
            height: 50,
            cost: 100,

            onUse: (item) => {
                this.setRemoveAnimalMode(item.isActive);

                this.updateButtonState(
                    this.gameScreen.removeItemButton,
                    item.isActive
                );
            },
        });
    }

    createMixItem(){
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

                this.updateButtonState(
                    this.gameScreen.mixItemButton,
                    item.isActive
                );
            },
        });
    }

    setupItemButtons(){
        this.gameScreen.updateItemPrice(
            "remove",
            this.removeItem.cost
        );

        this.gameScreen.updateItemPrice(
            "mix",
            this.mixItem.cost
        );

        this.gameScreen.setRemoveItemClickHandler(() => {
            this.handleUseRemoveItem();
        });

        this.gameScreen.setMixItemClickHandler(() => {
            this.handleUseMixItem();
        });
    }

    handleUseRemoveItem(){
        if(!this.canUseRemoveItem()) return;

        this.removeItem.toggle();
        this.gameScreen.updateCoin(gameStore.getCoin());
    }

    canUseRemoveItem(){
        const game = this.gameManager;

        if(!game.isGameRunning) return false;
        if(game.isGamePause) return false;
        if(game.isGameOver) return false;
        if(this.mixItem.isActive) return false;

        return true;
    }

    handleUseMixItem(){
        if(!this.canUseMixItem()) return;

        const activated = this.mixItem.activate();
        if(!activated) return;

        this.gameManager.world.activateItemFly();
        this.mixTimer = setTimeout(() => {
            this.mixTimer = null;
            if(this.mixItem.isActive) this.mixItem.use();
        }, 3000);

        this.gameScreen.updateCoin(gameStore.getCoin());
    }

    canUseMixItem(){
        const game = this.gameManager;

        if(!game.isGameRunning) return false;
        if(game.isGamePause) return false;
        if(game.isGameOver) return false;
        if(this.mixItem.isActive) return false;
        if(this.removeItem.isActive) return false;
        if(game.world.animals.length === 0) return false;

        return true;
    }

    handleAnimalEvent(animal){
        animal.eventMode = "static";

        this.updateAnimalCursor(
            animal,
            this.removeItem.isActive
        );

        animal.on("pointerdown", (event) => {
            if(!this.removeItem.isActive) return;

            event.stopPropagation();
            this.gameManager.removeAnimalToPhysicState(animal);
            this.gameManager.removeAnimalFromPool(animal);
            animal.destroy();
            this.gameManager.updateMergeTree();
            this.removeItem.use();
        });
    }

    setRemoveAnimalMode(isActive){
        const currentAnimal = this.gameManager.currentAnimal;
        if(currentAnimal && !currentAnimal.destroyed) currentAnimal.visible = !isActive;

        for(const animal of this.gameManager.animalPool){
            this.updateAnimalCursor(animal, isActive);
        }
    }

    setMixMode(isActive){
        const currentAnimal = this.gameManager.currentAnimal;

        if(currentAnimal && !currentAnimal.destroyed){
            currentAnimal.visible = !isActive;
        }
    }

    updateAnimalCursor(animal, isActive){
        animal.cursor = isActive ? "pointer" : "default";
    }

    updateButtonState(button, isActive){
        if(!button) return;
        button.alpha = isActive ? 0.7 : 1;
    }

    isUsingItem(){
        return this.removeItem.isActive ||this.mixItem.isActive;
    }

    reset(){
        if(this.mixTimer){
            clearTimeout(this.mixTimer);
            this.mixTimer = null;
        }

        if(this.mixItem.isActive) this.mixItem.cancel();
        if(this.removeItem.isActive) this.removeItem.cancel();

        this.updateButtonState(
            this.gameScreen.mixItemButton,
            false
        );

        this.updateButtonState(
            this.gameScreen.removeItemButton,
            false
        );
    }
}

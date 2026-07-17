import { Texture } from "pixi.js";
import { RemoveItem } from "../entities/items/removeItem";
import { gameStore } from "../store/gameStore";

export class RemoveItemController {
    constructor(gameManager, gameScreen){
        this.gameManager = gameManager;
        this.gameScreen = gameScreen;

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
                this.updateButtonState(item.isActive);
            },
        });

        this.gameScreen.setRemoveItemClickHandler(() => {
            this.removeItem.toggle();
            this.gameScreen.updateCoin(gameStore.getCoin());
        });
    }

    handleAnimalEvent(animal){
        animal.eventMode = "static";
        this.updateAnimalCursor(animal, this.removeItem.isActive);

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
        if(this.gameManager.currentAnimal){
            this.gameManager.currentAnimal.visible = !isActive;
        }

        for(const animal of this.gameManager.animalPool){
            this.updateAnimalCursor(animal, isActive);
        }
    }

    updateAnimalCursor(animal, isActive){
        animal.cursor = isActive ? "pointer" : "default";
    }

    updateButtonState(isActive) {
        const button = this.gameScreen.removeItemButton;
        if (!button) return;
        button.alpha = isActive ? 0.7 : 1;
    }
}

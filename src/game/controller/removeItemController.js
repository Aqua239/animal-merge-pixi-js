import { Texture } from "pixi.js";
import { RemoveItem } from "../entities/items/removeItem";

export class RemoveItemController {
    constructor(gameManager){
        this.gameManager = gameManager;

        this.removeItem = new RemoveItem({
            texture: Texture.WHITE,
            quantity: 1,
            x: 50,
            y: 200,
            width: 50,
            height: 50,

            onUse: (item) => {
                this.setRemoveAnimalMode(
                    item.isActive
                );
            },
        });

        this.gameManager.gameContainer.addChild(this.removeItem);
    }

    handleAnimalEvent(animal){
        animal.eventMode = "static";
        this.updateAnimalCursor(animal);

        animal.on("pointerdown", (event) => {
            if(!this.removeItem.isActive) return;

            event.stopPropagation();
            this.gameManager.removeAnimalToPhysicState(animal);
            this.gameManager.removeAnimalFromPool(animal);
            animal.destroy();
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
}

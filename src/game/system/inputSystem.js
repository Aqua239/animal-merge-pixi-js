import { GAME_CONFIG } from "../../constant";

export class InputSystem {
    constructor(gameManager){
        this.gameManager = gameManager;
        this.pointerX = GAME_CONFIG.GAME_AREA_WIDTH / 2;
    }

    listenEvent(){
        this.gameManager.gameContainer.eventMode = "static";
        this.gameManager.gameContainer.hitArea = {
            contains: (x, y) => {
                return (
                    x >= 0 &&
                    x <= GAME_CONFIG.SCREEN_WIDTH &&
                    y >= 0 &&
                    y <= GAME_CONFIG.SCREEN_HEIGHT
                );
            },
        };

        const box = this.gameManager.world.box;

        this.gameManager.gameContainer.on("pointermove", (event) => {
            const pointerPosition = event.getLocalPosition(this.gameManager.gameContainer);
            this.pointerX = pointerPosition.x;

            if(!this.canInteractWithCurrentAnimal()) return;

            if(
                this.detectCursorInBox(pointerPosition, box) &&
                !this.gameManager.removeItemController.removeItem.isActive
            ){
                let animalPosition = this.getAnimalPositionX(
                    box, this.gameManager.currentAnimal.radius,
                );

                this.gameManager.currentAnimal.x = animalPosition;
            }
        });

        this.gameManager.gameContainer.on("pointerdown", (event) => {
            const pointerPosition = event.getLocalPosition(this.gameManager.gameContainer);
            this.pointerX = pointerPosition.x;
            
            if(!this.canInteractWithCurrentAnimal()) return;
            if(
                this.detectCursorInBox(pointerPosition, box) &&
                !this.gameManager.removeItemController.removeItem.isActive
            ){
                this.dropAnimal();
            }
        });
    }

    getAnimalPositionX(box, radius){
        return Math.max(
            box.x + radius,
            Math.min(
                this.pointerX,
                box.x + box.width - radius
            )
        );
    }

    detectCursorInBox(position, box){
        return box.x <= position.x &&
            position.x <= box.x + box.width &&
            box.y <= position.y &&
            position.y <= box.y + box.height;
    }

    canInteractWithCurrentAnimal(){
        return (
            this.gameManager.isGameRunning &&
            !this.gameManager.isGamePause &&
            !this.gameManager.isGameOver &&
            this.gameManager.isDrop &&
            this.gameManager.currentAnimal !== null
        );
    }

    dropAnimal(){
        if(!this.canInteractWithCurrentAnimal()) return;

        this.gameManager.isDrop = false;
        this.gameManager.currentAnimal.convertPhysicMode();

        this.gameManager.animalPool.push(this.gameManager.currentAnimal);
        this.gameManager.addAnimalToPhysicState(this.gameManager.currentAnimal);
        this.gameManager.removeItemController.handleAnimalEvent(this.gameManager.currentAnimal);
        this.gameManager.currentAnimal = null;

        setTimeout(() => {
            if(this.gameManager.isGameRunning && !this.gameManager.isGameOver){
                this.gameManager.animalSystem.stateAnimalForScene(
                    GAME_CONFIG.NEXT_ANIMAL_POSITION_X,
                    GAME_CONFIG.NEXT_ANIMAL_POSITION_Y
                );
            }
        }, 1000);
    }
}

import { sound } from "@pixi/sound";
import { GAME_CONFIG } from "../../constant";

export class InputSystem {
    constructor(gameManager){
        this.gameManager = gameManager;
        this.pointerX = GAME_CONFIG.GAME_AREA_WIDTH / 2;

        this.canDropOnPointerUp = false;
        this.pointerState = "idle";
    }

    blockDropAnimal(){
        this.pointerState = "useItem";
    }

    isUsingItem(){
        return (
            this.gameManager.removeItemController.removeItem.isActive ||
            this.gameManager.mixItemController.mixItem.isActive
        );
    }

    updateCurrentAnimalPosition(pointerPosition, box){
        if(!this.canInteractWithCurrentAnimal()) return;
        if(!this.detectCursorInBox(pointerPosition, box)) return;

        this.pointerX = pointerPosition.x;
        this.gameManager.currentAnimal.x = this.getAnimalPositionX(
            box,
            this.gameManager.currentAnimal.radius,
            pointerPosition.x
        );
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
            if(this.isUsingItem()) return;
            if(this.pointerState === "useItem" || this.pointerState === "blocked") return;
            const pointerPosition = event.getLocalPosition(this.gameManager.gameContainer);
            this.updateCurrentAnimalPosition(pointerPosition, box);
        });

        this.gameManager.gameContainer.on("pointerdown", (event) => {
            const pointerPosition = event.getLocalPosition(this.gameManager.gameContainer);
            this.pointerState = "blocked";

            if(this.isUsingItem()){
                this.pointerState = "useItem";
                return;
            }

            if(!this.canInteractWithCurrentAnimal()) return;
            if(!this.detectCursorInBox(pointerPosition, box)) return;
            this.pointerState = "drop";

            this.updateCurrentAnimalPosition(pointerPosition, box);
        });

        this.gameManager.gameContainer.on("pointerup", (event) => {
            const previousPointerState = this.pointerState;
            this.pointerState = "idle";
            if(previousPointerState !== "drop") return;

            if(this.isUsingItem()) return;
            if(!this.canInteractWithCurrentAnimal()) return;

            const pointerPosition = event.getLocalPosition(this.gameManager.gameContainer);
            if(!this.detectCursorInBox(pointerPosition, box)) return;

            this.dropAnimal();
        });

        this.gameManager.gameContainer.on("pointerupoutside", () => {
            this.pointerState = "idle";
        });
    }

    getAnimalPositionX(box, radius, positionX = this.pointerX){
        return Math.max(
            box.x + radius,
            Math.min(
                positionX,
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

        //SFX
        sound.play('sound_sfx_atlas', {sprite: "drop", volume: 0.3});

        this.gameManager.isDrop = false;
        this.gameManager.currentAnimal.convertPhysicMode();

        this.gameManager.animalPool.push(this.gameManager.currentAnimal);
        this.gameManager.addAnimalToPhysicState(this.gameManager.currentAnimal);
        this.gameManager.buttonController.handleAnimalEvent(this.gameManager.currentAnimal);
        this.gameManager.updateMergeTree();
        this.gameManager.currentAnimal = null;

        setTimeout(() => {
            if(this.gameManager.isGameRunning && !this.gameManager.isGameOver){
                this.gameManager.animalManager.stateAnimalForScene(
                    GAME_CONFIG.NEXT_ANIMAL_POSITION_X,
                    GAME_CONFIG.NEXT_ANIMAL_POSITION_Y
                );
            }
        }, 1000);
    }
}

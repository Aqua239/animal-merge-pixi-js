import { DEFAULT_GAME_DATA, STORAGE_KEY } from "./data";

class GameStore{
    constructor(){
        this.data = this.load();
    }

    load(){
        const rawData = localStorage.getItem(STORAGE_KEY);
        if(!rawData){
            return structuredClone(DEFAULT_GAME_DATA);
        }

        const savedData = JSON.parse(rawData);
        return this.mergeWithDefault(savedData);
    }

    save(){}

    mergeWithDefault(savedData){
        return{
            ...structuredClone(DEFAULT_GAME_DATA),
            ...savedData,

            player: {
                ...DEFAULT_GAME_DATA.player,
                ...savedData.player
            },

            scores: {
                ...DEFAULT_GAME_DATA.scores,
                ...savedData.scores,
            },

            items: {
                ...DEFAULT_GAME_DATA.items,
                ...savedData.items,
            }
        }
    }

    getData(){}

    show(){}
}

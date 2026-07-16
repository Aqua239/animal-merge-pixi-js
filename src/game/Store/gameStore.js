import { DEFAULT_GAME_DATA, STORAGE_KEY } from "./data";

class GameStore{
    constructor(){
        this.data = this.load();
        this.save();
    }

    load(){
        const rawData = localStorage.getItem(STORAGE_KEY);
        if(!rawData){
            return structuredClone(DEFAULT_GAME_DATA);
        }

        const savedData = JSON.parse(rawData);
        return this.mergeWithDefault(savedData);
    }

    save(){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }

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

    getData(){
        return structuredClone(this.data);
    }

    show(){
        console.log(this.getData());
    }

    updateScores(newScore) {
        if (!this.checkScoreInTop(newScore)) return false;

        const newListScore = [...this.data.scores.highScores, newScore];
        newListScore.sort((firstScore, secondScore) => secondScore - firstScore);

        this.data.scores.highScores =newListScore.slice(0, 3);
        this.save();
        return true;
    }

    checkScoreInTop(newScore) {
        const listScore = this.data.scores.highScores;
        if (listScore.length < 3) {
            return true;
        }

        const lowestScore = listScore[listScore.length - 1];

        return newScore > lowestScore;
    }

    showListScore() {
        const listScore = [...this.data.scores.highScores];
        console.log(listScore);

        while(listScore.length < 3){
            listScore.push(0);
        }
        console.log("List score:", listScore);

        return listScore;
    }

    showHighestScore() {
        const highestScore = this.data.scores.highScores[0] ?? 0;
        console.log("Highest score:", highestScore);

        return highestScore;
    }

}

export const gameStore = new GameStore();

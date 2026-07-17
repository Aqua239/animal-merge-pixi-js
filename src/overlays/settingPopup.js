import { Text } from "pixi.js";
import { AudioToggleButton, IconButton } from "../UI/button";
import BasePopup from "./basePopup";


export default class SettingPopup extends BasePopup {
    constructor({onRestart, onResume, onReturnMainMenu}) {
        super({textureName: "panel_rounded", boardWidth: 800, boardHeight: 800});

        const titleText = new Text({
            text: "Setting",
            style: {fontSize: 100, fill: 0xC4BCB0, fontWeight: 'bold'}
        });
        titleText.anchor.set(0.5);
        titleText.y =-300;

        const backgroundMusicButton = new AudioToggleButton({
            textureName: "button_base",
            targetAlias: "sound_background",
            iconOn: "icon_music",
            iconOff: "icon_music_off",
            x: -135,
            y: -140,
            width: 220,
            height: 150
        });

        const sfxMusicButton = new AudioToggleButton({
            textureName: "button_base",
            targetAlias: "sound_sfx_atlas",
            iconOn: "icon_audio",
            iconOff: "icon_audio_off",
            x: 135,
            y: -140,
            width: 220,
            height: 150
        });

        const returnMainMenuButton = new IconButton({
            textureName: "button_base_blue",
            x: -135,
            y: 50,
            width: 220,
            height: 150,
            onClick: onReturnMainMenu,
            iconName: "icon_home_white"
        });

        const restartButton = new IconButton({
            textureName: "button_base_red",
            x: 135,
            y: 50,
            width: 220,
            height: 150,
            onClick: onRestart,
            iconName: "icon_return_white"
        });

        const resumeButton = new IconButton({
            textureName: "button_large_green",
            x: 0,
            y: 225,
            width: 500,
            height: 150,
            onClick: onResume,
            iconName: "icon_resume_white"
        });

        this.boardContainer.addChild(
            titleText,
            backgroundMusicButton, sfxMusicButton,
            returnMainMenuButton,
            restartButton,
            resumeButton
        );
    }

    hide() {
        this.visible = false;
    }
}

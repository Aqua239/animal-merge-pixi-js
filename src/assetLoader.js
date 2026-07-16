import { Assets } from "pixi.js";
import { sound } from "@pixi/sound";
import { SFX_CONFIG } from "./constant";

export async function loadGameAssets(onProgressCallback) {
    const assetImageList = [
        // Sprites
        { alias: "sprite_animals", src: "/assets/images/animals_spritesheet.png" },

        // Panels
        { alias: "panel_rounded", src: "/assets/images/panels/rounded.svg" },

        // Buttons
        { alias: "button_setting", src: "/assets/images/buttons/setting.svg" },
        { alias: "button_base", src: "/assets/images/buttons/base.svg" },
        { alias: "button_large", src: "/assets/images/buttons/large.svg" },
        { alias: "button_circle", src: "/assets/images/buttons/circle.svg" },
        { alias: "button_exit", src: "/assets/images/buttons/exit.svg" },

        // Icons
        { alias: "icon_return", src: "/assets/images/icons/return.svg" },
        { alias: "icon_x", src: "/assets/images/icons/x.svg" },
        { alias: "icon_coin", src: "/assets/images/icons/coin.svg" },
        { alias: "icon_audio", src: "/assets/images/icons/audio.svg" },
        { alias: "icon_audio_off", src: "/assets/images/icons/audio_off.svg" },
        { alias: "icon_music", src: "/assets/images/icons/music.svg" },
        { alias: "icon_music_off", src: "/assets/images/icons/music_off.svg" },
        { alias: "icon_home", src: "/assets/images/icons/home.svg" },
        { alias: "icon_star", src: "/assets/images/icons/star.svg" },

        // Sounds
        { alias: "sound_background", src: "/assets/sounds/sound_background.ogg" },
        { alias: "sound_sfx_atlas", src: "/assets/sounds/sfx_atlas.ogg" },
    ];

    for (const asset of assetImageList) {
        Assets.add(asset);
    }

    const aliases = assetImageList.map(asset => asset.alias);
    await Assets.load(aliases, onProgressCallback);

    const myAtlasSound = sound.find('sound_sfx_atlas');
    if(myAtlasSound) {
        myAtlasSound.addSprites(SFX_CONFIG.SPRITES);
    }
}

import { Assets } from "pixi.js";

export async function loadGameAssets(onProgressCallback) {
    const assetImageList = [
        // image & GUI
        { alias: "animals_spritesheet", src: "/assets/images/animals_spritesheet.png" },
        { alias: "animals_json", src: "/assets/images/animals.json" },
        { alias: "box_rounded", src: "/assets/images/box_rounded.png" },
        { alias: "setting_button", src: "/assets/images/setting_button.png"},
        //sound
        { alias: "background_sound", src: "/assets/sounds/sound_background.ogg"},
        { alias: "sfx_atlas_json", src: "/assets/sounds/sfx_atlas.json"},
        { alias: "sfx_atlas", src: "/assets/sounds/sfx_atlas.ogg"}
    ];

    for (const asset of assetImageList) {
        Assets.add(asset);
    }

    const aliases = assetImageList.map(asset => asset.alias);
    await Assets.load(aliases, onProgressCallback);
}

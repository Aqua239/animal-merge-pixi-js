export const ANIMAL_LEVEL = {
    1: {
        radius: 30,
        textureName: "sprite_animals",
        xSprite: 547,
        ySprite: 408,
        widthSprite: 136,
        heightSprite: 137,
        score: 1,
        coin: 0
    },
    2: {
        radius: 45,
        textureName: "sprite_animals",
        xSprite: 140,
        ySprite: 0,
        widthSprite: 137,
        heightSprite: 136,
        score: 2,
        coin: 0
    },
    3: {
        radius: 60,
        textureName: "sprite_animals",
        xSprite: 683,
        ySprite: 409,
        widthSprite: 136,
        heightSprite: 136,
        score: 3,
        coin: 0
    },
    4: {
        radius: 75,
        textureName: "sprite_animals",
        xSprite: 274,
        ySprite: 272,
        widthSprite: 137,
        heightSprite: 136,
        score: 4,
        coin: 0
    },
    5: {
        radius: 90,
        textureName: "sprite_animals",
        xSprite: 550,
        ySprite: 0,
        widthSprite: 136,
        heightSprite: 136,
        score: 5,
        coin: 0
    },
    6: {
        radius: 105,
        textureName: "sprite_animals",
        xSprite: 137,
        ySprite: 551,
        widthSprite: 137,
        heightSprite: 136,
        score: 6,
        coin: 5
    },
    7: {
        radius: 120,
        textureName: "sprite_animals",
        xSprite: 411,
        ySprite: 408,
        widthSprite: 136,
        heightSprite: 136,
        score: 7,
        coin: 10
    },
    8: {
        radius: 145,
        textureName: "sprite_animals",
        xSprite: 137,
        ySprite: 415,
        widthSprite: 137,
        heightSprite: 136,
        score: 8,
        coin: 20
    },
    9: {
        radius: 175,
        textureName: "sprite_animals",
        xSprite: 411,
        ySprite: 680,
        widthSprite: 136,
        heightSprite: 137,
        score: 9,
        coin: 30
    },
    10: {
        radius: 210,
        textureName: "sprite_animals",
        xSprite: 274,
        ySprite: 680,
        widthSprite: 137,
        heightSprite: 136,
        score: 10,
        coin: 50
    },
    11: {
        radius: 245,
        textureName: "sprite_animals",
        xSprite: 0,
        ySprite: 140,
        widthSprite: 140,
        heightSprite: 139,
        score: 11,
        coin: 80
    }
}

const levelKeys = Object.keys(ANIMAL_LEVEL);
const maxLevelKey = Math.max(...levelKeys);
const PixelPerMeter = 100; // 1 meter = 100 pixels

export const PhysicsConfig = {
    initialVelocityX: 0,
    initialVelocityY: 0,

    // --- Linear motion ---
    gravity: 40 * PixelPerMeter,
    linearDamping: 0.6,     // velocity decay per second: vx *= exp(-damping * dt)
    stopVthreshold: 5,      // zero out velocity below this threshold
    restitution: 0.5,       // bounciness (0 = no bounce, 1 = full bounce)

    // --- Rotation ---
    angularDamping: 4.0,         // angular velocity decay per second
    angularStopThreshold: 0.05,  // zero out angular velocity below this threshold
    maxAngularVelocity: 5,       // max spin speed (rad/s)

    // --- Friction & Spin ---
    FRICTION: 0.15,          // tangential friction coefficient for circle-circle contact

    timeStep: 1 / 1000,
    maxRadius: ANIMAL_LEVEL[maxLevelKey].radius,
};

export const GAME_CONFIG = {
    BACKGROUND_COLOR: 0xEEE8DF, //cream-colored
    FOREGROUND_COLOR: 0x2C365A,
    TEXT_COLOR: 0x2C365A,
    FONT_FAMILY: 'Arial',
    SCREEN_WIDTH: 1080,
    SCREEN_HEIGHT: 1920,
    ORIGIN_X: 0,
    ORIGIN_Y: 0,
    GAME_AREA_WIDTH: 1080,
    CEILING_Y: 670,
    FLOOR_Y: 1750,
    NEXT_ANIMAL_POSITION_X: 950,
    NEXT_ANIMAL_POSITION_Y: 150,
    ANIMAL_SPAWN_Y: 375
}

export const SFX_CONFIG = {
    RESOURCE: "sfx_atlas.ogg",
    SPRITES: {
        drop: {
            start: 0,
            end: 0.49299319727891155,
            loop: false
        },
        merge: {
            start: 2,
            end: 2.641065759637188,
            loop: false
        },
        click: {
            start: 4,
            end: 4.492993197278912,
            loop: false
        },
        gameover: {
            start: 6,
            end: 8.80922902494331,
            loop: false
        }
    }
}

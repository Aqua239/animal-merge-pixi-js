export const ANIMAL_LEVEL = {
    1: {
        radius: 30,
        textureName: "/assets/images/animals_spritesheet.png",
        xSprite: 547,
        ySprite: 408,
        widthSprite: 136,
        heightSprite: 137,
        score: 1
    },
    2: {
        radius: 45,
        textureName: "/assets/images/animals_spritesheet.png",
        xSprite: 140,
        ySprite: 0,
        widthSprite: 137,
        heightSprite: 136,
        score: 2
    },
    3: {
        radius: 60,
        textureName: "/assets/images/animals_spritesheet.png",
        xSprite: 683,
        ySprite: 409,
        widthSprite: 136,
        heightSprite: 136,
        score: 3
    },
    4: {
        radius: 75,
        textureName: "/assets/images/animals_spritesheet.png",
        xSprite: 274,
        ySprite: 272,
        widthSprite: 137,
        heightSprite: 136,
        score: 4
    },
    5: {
        radius: 90,
        textureName: "/assets/images/animals_spritesheet.png",
        xSprite: 550,
        ySprite: 0,
        widthSprite: 136,
        heightSprite: 136,
        score: 5
    },
    6: {
        radius: 105,
        textureName: "/assets/images/animals_spritesheet.png",
        xSprite: 137,
        ySprite: 551,
        widthSprite: 137,
        heightSprite: 136,
        score: 6
    },
    7: {
        radius: 120,
        textureName: "/assets/images/animals_spritesheet.png",
        xSprite: 411,
        ySprite: 408,
        widthSprite: 136,
        heightSprite: 136,
        score: 7
    },
    8: {
        radius: 145,
        textureName: "/assets/images/animals_spritesheet.png",
        xSprite: 137,
        ySprite: 415,
        widthSprite: 137,
        heightSprite: 136,
        score: 8
    },
    9: {
        radius: 175,
        textureName: "/assets/images/animals_spritesheet.png",
        xSprite: 411,
        ySprite: 680,
        widthSprite: 136,
        heightSprite: 137,
        score: 9
    },
    10: {
        radius: 210,
        textureName: "/assets/images/animals_spritesheet.png",
        xSprite: 274,
        ySprite: 680,
        widthSprite: 137,
        heightSprite: 136,
        score: 10
    },
    11: {
        radius: 245,
        textureName: "/assets/images/animals_spritesheet.png",
        xSprite: 0,
        ySprite: 140,
        widthSprite: 140,
        heightSprite: 139,
        score: 11
    }
}

const levelKeys = Object.keys(ANIMAL_LEVEL);
const maxLevelKey = Math.max(...levelKeys);
const PixelPerMeter = 100; // 1 meter = 100 pixels

export const PhysicsConfig = {
    initialVelocityX: 0,
    initialVelocityY: 100,

    // --- Linear motion ---
    gravity: 9.81 * PixelPerMeter,
    linearDamping: 0.8,     // velocity decay per second: vx *= exp(-damping * dt)
    stopVthreshold: 2,      // zero out velocity below this threshold
    restitution: 0.3,       // bounciness (0 = no bounce, 1 = full bounce)

    // --- Rotation ---
    angularDamping: 5.0,         // angular velocity decay per second
    angularStopThreshold: 1.0,   // zero out angular velocity below this threshold
    maxAngularVelocity: 5,       // max spin speed (rad/s)

    // --- Friction & Spin ---
    spinThreshold: 5,       // min tangential speed to apply spin on first contact
    spinFactor: 0.05,       // fraction of tangential speed transferred to angular velocity
    FRICTION: 0.3,          // rolling friction coefficient (slip reduction per step)

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

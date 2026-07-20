import { AnimatedSprite, Texture } from 'pixi.js';

export function playMergeEffect(x, y, container, scaleModifier = 1.5) {
    const frames = [];
    for (let i = 1; i <= 9; i++) {
        frames.push(Texture.from(`merge_0${i}`));
    }

    const explosion = new AnimatedSprite(frames);
    explosion.anchor.set(0.5);
    explosion.x = x;
    explosion.y = y;

    explosion.scale.set(scaleModifier);

    explosion.animationSpeed = 0.2;
    explosion.loop = false;
    explosion.onComplete = () => {
        explosion.destroy();
    };

    container.addChild(explosion);
    explosion.play();
}

import { CircleCollider } from "../system/circleCollider.js";
import { World } from "../system/world.js";
import { PhysicsConfig, ANIMAL_LEVEL } from "../../constant.js";

import { Application, Container, Graphics } from "pixi.js";

(async () => {
    const app = new Application();

    await app.init({ resizeTo: window });
    document.body.appendChild(app.canvas);

    // Box boundary
    const B = {
        x: 15,
        y: 15,
        width: 800,
        height: 400,
    };

    // Draw boundary box
    const boxGraphics = new Graphics()
        .rect(B.x, B.y, B.width, B.height)
        .fill({ color: 0xffffff, alpha: 0.5 });
    app.stage.addChild(boxGraphics);

    // Container for all circle visuals
    const circleContainer = new Container();
    app.stage.addChild(circleContainer);

    // Map: animal-like object -> pixi Container (circle + angle line)
    const animalViewMap = new Map();

    // ---------------------
    // Helpers
    // ---------------------

    /** Get color for a level (cycles through palette) */
    function colorForLevel(level) {
        const palette = [
            0x4fc3f7, 0x81c784, 0xffb74d, 0xe57373,
            0xba68c8, 0x4dd0e1, 0xaed581, 0xffd54f,
            0xff8a65, 0x90a4ae, 0xf06292,
        ];
        return palette[(level - 1) % palette.length];
    }

    /** Create a pixi Container with a filled circle + angle indicator line */
    function createCircleView(x, y, radius, color) {
        const circleView = new Graphics()
            .circle(0, 0, radius)
            .fill({ color, alpha: 0.6 });

        const angleLine = new Graphics()
            .moveTo(0, 0)
            .lineTo(radius, 0)
            .stroke({ width: 3, color: 0xffffff, alpha: 1 });

        const container = new Container();
        container.addChild(circleView);
        container.addChild(angleLine);
        container.position.set(x, y);

        circleContainer.addChild(container);
        return container;
    }

    /** Create an animal-like object (no sprites – just collider + level) */
    function createAnimalLike(x, y, radius, level, vx = 0, vy = 0) {
        const collider = new CircleCollider(x, y, radius);
        collider.vx = vx;
        collider.vy = vy;

        return {
            collider,
            level,
            isPhysicsActive: true,
            x,
            y,
        };
    }

    /** Spawn a circle into both the world and the visual layer */
    function spawnCircle(x, y, radius, level, vx = 0, vy = 0) {
        const animal = createAnimalLike(x, y, radius, level, vx, vy);
        const color = colorForLevel(level);
        const view = createCircleView(x, y, radius, color);

        animalViewMap.set(animal, view);
        world.addAnimal(animal);

        return animal;
    }

    /** Remove a circle from visuals */
    function removeCircleView(animal) {
        const view = animalViewMap.get(animal);
        if (view) {
            circleContainer.removeChild(view);
            view.destroy({ children: true });
            animalViewMap.delete(animal);
        }
    }

    // ---------------------
    // World
    // ---------------------

    /**
     * onMerge callback: when two same-level animals merge,
     * we clean up their views and create a new visual + animal.
     */
    function onMerge(animalA, animalB, newCollider) {
        const newLevel = (animalA.level < 11) ? animalA.level + 1 : animalA.level;
        const newRadius = newCollider.radius;

        removeCircleView(animalA);
        removeCircleView(animalB);

        const newAnimal = createAnimalLike(
            newCollider.x, newCollider.y,
            newRadius, newLevel,
            newCollider.vx, newCollider.vy
        );
        newAnimal.collider = newCollider; // use the collider already created by World

        const color = colorForLevel(newLevel);
        const view = createCircleView(newCollider.x, newCollider.y, newRadius, color);
        animalViewMap.set(newAnimal, view);

        // Return the new animal so World adds it
        return newAnimal;
    }

    const world = new World(B, onMerge);

    // ---------------------
    // Initial spawns
    // ---------------------
    spawnCircle(80, 30, ANIMAL_LEVEL[1].radius, 1, 0, 0);
    spawnCircle(160, 30, ANIMAL_LEVEL[1].radius, 1, 0, 0);
    spawnCircle(250, 30, ANIMAL_LEVEL[2].radius, 2, -40, 0);

    // Spawn a new circle every 5 seconds
    setInterval(() => {
        const level = 1 + Math.floor(Math.random() * 3);
        const radius = ANIMAL_LEVEL[level].radius;
        const x = B.x + radius + Math.random() * (B.width - radius * 2);
        spawnCircle(x, B.y + radius, radius, level);
    }, 2000);

    // ---------------------
    // Game loop
    // ---------------------
    app.ticker.add((time) => {
        const dt = PhysicsConfig.timeStep * time.deltaMS;

        // World handles: physics update, box collision, circle-circle collision & merge
        world.update(dt);

        // Sync visuals with collider positions + angles
        for (const animal of world.animals) {
            const view = animalViewMap.get(animal);
            if (view) {
                view.position.set(animal.collider.x, animal.collider.y);
                view.rotation = animal.collider.angle;
            }
        }
    });
})();

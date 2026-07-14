import { Application, Container, Graphics } from "pixi.js";

import { PhysicsConfig } from "../../constant.js";
import { Physics } from "../system/physics.js";
import { CircleCollider } from "../system/circleCollider.js";

(async () => {
    const app = new Application();

    await app.init({ resizeTo: window });
    document.body.appendChild(app.canvas);

    const physics = new Physics();

    // Box
    const B = {
        x: 15,
        y: 15,
        width: 600,
        height: 400,
    };

    physics.box = B;

    const boxGraphics = new Graphics()
        .rect(B.x, B.y, B.width, B.height)
        .fill({ color: 0xffffff, alpha: 0.5 });
    app.stage.addChild(boxGraphics);

    const circleContainer = new Container();
    app.stage.addChild(circleContainer);

    const circleViews = new Map();

    function spawnCircle(x, y, radius, color, vx = 0, vy = 0) {
        const collider = new CircleCollider(x, y, radius);
        collider.vx = vx;
        collider.vy = vy;

        const graphics = new Graphics()
            .circle(0, 0, radius)
            .fill({ color, alpha: 0.5 });

        graphics.position.set(x, y);
        circleContainer.addChild(graphics);

        physics.circleColliders.push(collider);
        circleViews.set(collider, graphics);
    }

    // Only two fixed circle types for easy visual comparison.
    spawnCircle(140, 140, 20, 0x0000ff, 35, 0);
    spawnCircle(250, 140, 20, 0xff0000, -35, 0);

    function update(timestep) {
        for (const collider of physics.circleColliders) {
            collider.update(timestep);
            physics.handleCollisionsCircleToBox(collider, B);
            physics.handleCollisionsCircleToTop(collider, B.y);
        }

        if (physics.circleColliders.length >= 2) {
            const circleColliderA = physics.circleColliders[0];
            const circleColliderB = physics.circleColliders[1];

            const mergedCircle = physics.handleCollisionsCircleToCircle(circleColliderA, circleColliderB);
            if (mergedCircle) {
                const graphicsA = circleViews.get(circleColliderA);
                const graphicsB = circleViews.get(circleColliderB);

                if (graphicsA) circleContainer.removeChild(graphicsA);
                if (graphicsB) circleContainer.removeChild(graphicsB);

                circleViews.delete(circleColliderA);
                circleViews.delete(circleColliderB);
                physics.circleColliders.length = 0;

                const mergedGraphics = new Graphics()
                    .circle(0, 0, mergedCircle.radius)
                    .fill({ color: 0xffffff, alpha: 0.5 });

                mergedGraphics.position.set(mergedCircle.x, mergedCircle.y);
                circleContainer.addChild(mergedGraphics);

                physics.circleColliders.push(mergedCircle);
                circleViews.set(mergedCircle, mergedGraphics);
            }
        }

        for (const collider of physics.circleColliders) {
            const graphics = circleViews.get(collider);
            if (!graphics) continue;

            graphics.position.set(collider.x, collider.y);
        }
    }

    app.ticker.add((time) => {
        const dt = PhysicsConfig.timeStep * time.deltaTime;

        update(dt);
    });
})();

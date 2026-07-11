import { Application, Container, Graphics } from "pixi.js";

import { Physics } from "../system/physics.js";
import { CircleCollider } from "../system/circleCollider.js";

(async () => {
    const app = new Application();

    await app.init({ resizeTo: window });
    document.body.appendChild(app.canvas);

    const physics = new Physics();

    const box = {
        x: 20,
        y: 20,
        width: 640,
        height: 420,
    };

    physics.box = box;

    const boxGraphics = new Graphics()
        .rect(box.x, box.y, box.width, box.height)
        .fill({ color: 0xffffff, alpha: 0.18 });
    app.stage.addChild(boxGraphics);

    const circleLayer = new Container();
    app.stage.addChild(circleLayer);

    const circleViews = new Map();
    const circleColors = new Map();

    function addCircle(x, y, radius, color, vx = 0, vy = 0) {
        const collider = new CircleCollider(x, y, radius);
        collider.vx = vx;
        collider.vy = vy;

        const graphics = new Graphics()
            .circle(0, 0, radius)
            .fill({ color, alpha: 0.55 });

        graphics.position.set(x, y);
        circleLayer.addChild(graphics);

        physics.circleColliders.push(collider);
        circleViews.set(collider, graphics);
        circleColors.set(collider, color);
    }

    function removeCircle(collider) {
        const graphics = circleViews.get(collider);
        if (graphics) {
            circleLayer.removeChild(graphics);
        }

        circleViews.delete(collider);
        circleColors.delete(collider);
    }

    function syncCircleViews() {
        for (const collider of [...circleViews.keys()]) {
            if (physics.circleColliders.includes(collider)) continue;
            removeCircle(collider);
        }

        for (const collider of physics.circleColliders) {
            if (circleViews.has(collider)) continue;

            const color = circleColors.get(collider) ?? 0x66ccff;
            const graphics = new Graphics()
                .circle(0, 0, collider.radius)
                .fill({ color, alpha: 0.55 });

            graphics.position.set(collider.x, collider.y);
            circleLayer.addChild(graphics);
            circleViews.set(collider, graphics);
            circleColors.set(collider, color);
        }
    }

    addCircle(120, 120, 30, 0x4f8cff, 110, 0);
    addCircle(220, 120, 30, 0xff8a5b, -90, 0);

    setInterval(() => {
        const x = 70 + Math.random() * 120;
        const color = Math.floor(Math.random() * 0xffffff);
        addCircle(x, 70, 30, color, 40 + Math.random() * 60, 0);
    }, 4000);

    app.ticker.add((time) => {
        const dt = 0.1 * time.deltaTime;

        physics.update(dt);
        syncCircleViews();

        for (const collider of physics.circleColliders) {
            const graphics = circleViews.get(collider);
            if (!graphics) continue;

            graphics.position.set(collider.x, collider.y);
        }
    });
})();

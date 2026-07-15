import { CircleCollider } from "../system/circleCollider.js";
import { Collision } from "../system/collision.js";
import { PhysicsConfig } from "../../constant.js";

import { Application, Container, Graphics } from "pixi.js";

(async () => {
    const app = new Application();

    await app.init({ resizeTo: window });
    document.body.appendChild(app.canvas);

    const collisionSystem = new Collision();

    // Box
    const B = {
        x: 15,
        y: 15,
        width: 400,
        height: 400,
    };

    const boxGraphics = new Graphics()
        .rect(B.x, B.y, B.width, B.height)
        .fill({ color: 0xffffff, alpha: 0.5 });

    app.stage.addChild(boxGraphics);

    const circleContainer = new Container();
    app.stage.addChild(circleContainer);

    // Data all cirles
    const circles = [];

    function spawnCircle(x, y, radius, color) {
        const collider = new CircleCollider(x, y, radius);

        const circleView = new Graphics()
            .circle(0, 0, radius)
            .fill({ color, alpha: 0.5 });

        const angleLine = new Graphics()
            .moveTo(0, 0)
            .lineTo(radius, 0)
            .stroke({ width: 3, color: 0xffffff, alpha: 1 });

        const graphics = new Container();
        graphics.addChild(circleView);
        graphics.addChild(angleLine);

        graphics.position.set(x, y);

        circleContainer.addChild(graphics);

        circles.push({
            collider,
            graphics,
        });
    }

    // spawn 2 circles
    spawnCircle(30, 20, 30, 0x0000ff);
    spawnCircle(60, 60, 30, 0xff0000);

    // spawn new circle every 5s
    setInterval(() => {
        const x = 60 + Math.random() * 120;

        spawnCircle(
            x,
            30,
            20 + Math.random() * 20,
            Math.random() * 0xffffff,
            50 + Math.random() * 100,
            50 + Math.random() * 100
        );
    }, 5000);

    app.ticker.add((time) => {
        let dt = PhysicsConfig.timeStep * time.deltaMS;

        collisionSystem.beginFrame();

        // Update all colliders
        for (const obj of circles) {
            obj.collider.update(dt);
        }

        const maxloop = 10;
        for (let i = 0; i < maxloop; i++) {
            // Detect and handle collisions
            // Box
            for (const obj of circles) {
                obj.collider.checkCollisionCircleToBox(B);
            }

            // Ciccle to Circle
            for (let i = 0; i < circles.length; i++) {
                for (let j = i + 1; j < circles.length; j++) {
                    const A = circles[i].collider;
                    const C = circles[j].collider;

                    if (A.checkCollisionWithCircle(C)) {
                        collisionSystem.resolveCollisionCircleToCircleByPush(A, C, true);
                    }
                }
            }

        }

        collisionSystem.endFrame();
        // Update graphics position
        for (const obj of circles) {
            obj.graphics.position.set(
                obj.collider.x,
                obj.collider.y
            );
            obj.graphics.rotation = obj.collider.angle;
            console.log("vx = ", obj.collider.vx, "vy = ", obj.collider.vy, "angularVelocity = ", obj.collider.angularVelocity);
        }
    });
})();

import { circleCollider } from "../system/circleCollider.js";
import { collision } from "../system/collision.js";

import { Application, Container, Graphics } from "pixi.js";

(async () => {
    const app = new Application();

    await app.init({ resizeTo: window });
    document.body.appendChild(app.canvas);

    const collisionSystem = new collision();

    // Box
    const B = {
        x: 15,
        y: 15,
        width: 150,
        height: 400,
    };

    const boxGraphics = new Graphics()
        .rect(B.x, B.y, B.width, B.height)
        .fill({ color: 0xffffff, alpha: 0.5 });

    app.stage.addChild(boxGraphics);

    const circleContainer = new Container();
    app.stage.addChild(circleContainer);

    // Lưu tất cả hình tròn
    const circles = [];

    function spawnCircle(x, y, radius, color) {
        const collider = new circleCollider(x, y, radius);

        const graphics = new Graphics()
            .circle(0, 0, radius)
            .fill({ color, alpha: 0.5 });

        graphics.position.set(x, y);

        circleContainer.addChild(graphics);

        circles.push({
            collider,
            graphics,
        });
    }

    // Hai hình tròn ban đầu
    spawnCircle(30, 20, 40, 0x0000ff);
    spawnCircle(60, 60, 40, 0xff0000);

    // Cứ 5 giây sinh thêm một hình tròn
    setInterval(() => {
        const x = 40 + Math.random() * 80;

        spawnCircle(
            x,
            30,
            20 + Math.random() * 20,
            Math.random() * 0xffffff
        );
    }, 5000);

    app.ticker.add((time) => {
        const dt = 0.1 * time.deltaTime;

        // 1. Tích phân (Cập nhật vị trí sơ bộ dựa trên vận tốc)
        for (const obj of circles) {
            obj.collider.update(dt);
        }

        // 2. Iteration: Giải quyết va chạm nhiều lần để lực truyền đi hết các vật thể
        const solverIterations = 5; // Tăng số này lên (5-10) nếu vật thể vẫn bị lún

        for (let iter = 0; iter < solverIterations; iter++) {
            // Xét va chạm với Box
            for (const obj of circles) {
                collisionSystem.detectAndHandleCollisionCircleToBox(
                    obj.collider,
                    B
                );
            }

            // Xét va chạm Circle vs Circle
            for (let i = 0; i < circles.length; i++) {
                for (let j = i + 1; j < circles.length; j++) {
                    const A = circles[i].collider;
                    const C = circles[j].collider;

                    if (collisionSystem.detectCollisionCircletoCircle(A, C)) {
                        collisionSystem.resolveCollisionCircletoCircle(A, C);
                    }
                }
            }
        }

        // 3. Cập nhật vị trí đồ họa sau khi đã giải quyết xong mọi va chạm
        for (const obj of circles) {
            obj.graphics.position.set(
                obj.collider.x,
                obj.collider.y
            );
        }
    });
})();

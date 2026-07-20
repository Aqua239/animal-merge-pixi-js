export function animateToPosition(target, startX, startY, startScale, endX, endY, endScale, duration, onComplete) {
    const startTime = Date.now();

    const arcHeight = -100;

    const animateFly = () => {
        const now = Date.now();
        let progress = (now - startTime) / duration;

        const currentTargetX = typeof endX === 'function' ? endX() : endX;

        if (progress >= 1) {
            target.x = currentTargetX;
            target.y = endY;
            target.scale.set(endScale);

            if (onComplete) onComplete();
            return;
        }

        const ease = 1 - Math.pow(1 - progress, 3);


        target.x = startX + (currentTargetX - startX) * ease;
        const parabolaOffset = Math.sin(progress * Math.PI) * arcHeight;
        target.y = startY + (endY - startY) * ease + parabolaOffset;

        target.scale.x = startScale + (endScale - startScale) * ease;
        target.scale.y = startScale + (endScale - startScale) * ease;

        requestAnimationFrame(animateFly);
    };

    animateFly();
}

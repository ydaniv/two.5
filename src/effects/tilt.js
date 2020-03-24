function formatTransition ({property, duration, easing}) {
    return `${property} ${duration}ms ${easing}`;
}

export function getEffect (config) {
    const container = config.container;
    const layers = config.layers;
    const perspectiveZ = config.perspectiveZ;

    /*
     * Init effect
     * also set transition if required.
     */
    if (container) {
        const containerStyle = {
            perspective: `${perspectiveZ}px`
        };

        if (config.transitionActive && config.perspectiveActive) {
            containerStyle.transition = formatTransition({
                property: 'perspective-origin',
                duration: config.transitionDuration,
                easing: config.transitionEasing
            });
        }

        Object.assign(container.style, containerStyle);
    }

    /*
     * Setup layers styling
     */
    layers.forEach(layer => {
        const layerStyle = {};

        if (!layer.allowPointer) {
            layerStyle['pointer-events'] = 'none';
        }

        if (layer.transitionActive) {
            layerStyle.transition = formatTransition({
                property: 'transform',
                duration: layer.transitionDuration,
                easing: layer.transitionEasing
            });
        }
        else {
            delete layerStyle.transition;
        }

        return Object.assign(layer.el.style, layerStyle);
    });

    return function tilt ({x, y}) {
        const len = layers.length;

        layers.forEach((layer, index) => {
            const depth = layer.depth || (index + 1) / len;

            const translateZVal =  layer.elevation !== null ? layer.elevation : config.elevation * (index + 1);

            let translatePart = '';
            if (layer.translationActive) {
                const translateXVal = layer.translationActive === 'y'
                    ? 0
                    : (layer.translationInvertX ? -1 : 1) * layer.translationMax * (2 * x - 1) * depth;
                const translateYVal = layer.translationActive === 'x'
                    ? 0
                    : (layer.translationInvertY ? -1 : 1) * layer.translationMax * (2 * y - 1) * depth;

                translatePart = `translate3d(${translateXVal}px, ${translateYVal}px, ${translateZVal}px)`;
            }
            else {
                translatePart = `translateZ(${translateZVal}px)`;
            }

            let rotatePart = '';
            if (layer.rotationActive) {
                const rotateXVal = layer.rotationActive === 'y'
                    ? 0
                    : (layer.rotationInvertX ? -1 : 1) * layer.rotationMax * (y * 2 - 1) * depth;
                const rotateYVal = layer.rotationActive === 'x'
                    ? 0
                    : (layer.rotationInvertY ? -1 : 1) * layer.rotationMax * (1 - x * 2) * depth;

                rotatePart = `rotateX(${rotateXVal}deg) rotateY(${rotateYVal}deg)`;
            }
            else {
                rotatePart = 'rotateX(0deg) rotateY(0deg)';
            }

            let skewPart = '';
            if (layer.skewActive) {
                const skewXVal = layer.skewActive === 'y'
                    ? 0
                    : (layer.skewInvertX ? -1 : 1) * layer.skewMax * (1 - x * 2) * depth;
                const skewYVal = layer.skewActive === 'x'
                    ? 0
                    : (layer.skewInvertY ? -1 : 1) * layer.skewMax * (1 - y * 2) * depth;

                skewPart = `skew(${skewXVal}deg, ${skewYVal}deg)`;
            }
            else {
                skewPart = 'skew(0deg, 0deg)';
            }

            let scalePart = '';
            if (layer.scaleActive) {
                const scaleXVal = layer.scaleActive === 'y'
                    ? 1
                    : 1 + (layer.scaleInvertX ? -1 : 1) * layer.scaleMax * (Math.abs(0.5 - x) * 2) * depth;
                const scaleYVal = layer.scaleActive === 'x'
                    ? 1
                    : 1 + (layer.scaleInvertY ? -1 : 1) * layer.scaleMax * (Math.abs(0.5 - y) * 2) * depth;

                scalePart = `scale(${scaleXVal}, ${scaleYVal})`;
            }
            else {
                scalePart = 'scale(1, 1)';
            }

            let layerPerspectiveZ = '';

            if (layer.perspectiveZ) {
                layerPerspectiveZ = `perspective(${layer.perspectiveZ}px) `;
            }
            else if (!container) {
                layerPerspectiveZ = `perspective(${config.perspectiveZ}px) `;
            }

            layer.el.style.transform = `${layerPerspectiveZ}${translatePart} ${scalePart} ${skewPart} ${rotatePart}`;
        });

        if (config.perspectiveActive) {
            const perspX = config.perspectiveActive === 'y'
                ? 0
                : config.perspectiveInvertX ? x : (1 - x);
            const perspY = config.perspectiveActive === 'x'
                ? 0
                : config.perspectiveInvertY ? y : (1 - y);

            let a = 1, b = 0;

            if (config.perspectiveMax) {
                a = 1 + 2 * config.perspectiveMax;
                b = config.perspectiveMax;
            }

            container.style.perspectiveOrigin = `${(perspX * a - b) * 100}% ${(perspY * a - b) * 100}%`;
        }
        else if (container) {
            container.style.perspectiveOrigin = '50% 50%';
        }
    }
}

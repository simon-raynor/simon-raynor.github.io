import * as THREE from 'three';

const TEXTURE_SIZE = 256;

/* const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

canvas.style.position = 'absolute';
canvas.style.top = 0;
canvas.style.left = 0;
document.body.appendChild(canvas); */

const tmpVec2 = new THREE.Vector2();

export default function generateFlowField(avoidElements) {
    const height = document.body.scrollHeight,
        width = window.innerWidth;
    
    const max = Math.max(height, width);
    
    const bboxes = [];

    avoidElements.forEach(
        el => {
            const bbox = el.getBoundingClientRect();

            bboxes.push([
                bbox.top + window.scrollY,
                bbox.right,
                bbox.bottom + window.scrollY,
                bbox.left
            ]);
        }
    );

    const texture = new THREE.DataTexture(
        new Float32Array(TEXTURE_SIZE * TEXTURE_SIZE * 4),
        TEXTURE_SIZE,
        TEXTURE_SIZE,
        THREE.RGBAFormat,
        THREE.FloatType
    );
    
    const vectors = texture.image.data;

    let idx = 0;
    for (let j = 0; j < TEXTURE_SIZE; j++) {
        for (let i = 0; i < TEXTURE_SIZE; i++) {
            const x = (height * ((0.5 + i) / TEXTURE_SIZE))/*  - (height / 2) */,
                y = height * (j / TEXTURE_SIZE);
            let inside;
            for (let i = 0; i < bboxes.length; i++) {
                const [top, right, bottom, left] = bboxes[i];
                
                if (
                    x > left
                    && x < right
                    && y < bottom
                    && y > top
                ) {
                    inside = bboxes[i];
                    break;
                }
            }
            if (inside) {
                const [top, right, bottom, left] = inside;
                const width = right - left,
                    height = bottom - top;
                const cx = left + (width / 4),
                    cy = top + (height / 4);
                const dx = x - cx,
                    dy = y - cy;

                tmpVec2.set(height / dx, width / dy).normalize();
                
                vectors[idx + 0] = tmpVec2.x / 10;
                vectors[idx + 1] = -tmpVec2.y / 10;
                vectors[idx + 2] = x;
                vectors[idx + 3] = y;
            } else {
                vectors[idx + 0] = 0;
                vectors[idx + 1] = 0.005;
                vectors[idx + 2] = x;
                vectors[idx + 3] = y;
            }

            idx += 4;
        }
    }

    
    /* canvas.height = height;
    canvas.width = width;

    ctx.beginPath();
    
    for (let i = 0; i <= vectors.length; i += 4) {
        ctx.moveTo(vectors[i + 2], vectors[i + 3]);
        ctx.lineTo(
            vectors[i + 2] + (vectors[i + 0] * 10),
            vectors[i + 3] + (vectors[i + 1] * 10)
        );
    }
    
    ctx.stroke(); */

    texture.needsUpdate = true;

    return texture;
}
import * as THREE from 'three';

const TEXTURE_SIZE = 256;

const CONTENT_PADDING = 6;


// debugging canvas
/* const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

canvas.style.position = 'absolute';
canvas.style.top = 0;
canvas.style.left = 0;
document.body.appendChild(canvas); */



const tmpVec2 = new THREE.Vector2();

export default function generateFlowField(avoidElements) {
    const scrollheight = document.body.scrollHeight,
        height = window.innerHeight,
        width = window.innerWidth;
    
    const bboxes = [];

    avoidElements.forEach(
        el => {
            const bbox = el.getBoundingClientRect();

            bboxes.push([
                bbox.top + window.scrollY - CONTENT_PADDING,
                bbox.right + CONTENT_PADDING,
                bbox.bottom + window.scrollY + CONTENT_PADDING,
                bbox.left - CONTENT_PADDING
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

    const xOffset = (scrollheight - width) / 2;

    for (let j = 0; j < TEXTURE_SIZE; j++) {
        for (let i = 0; i < TEXTURE_SIZE; i++) {
            const x = (scrollheight * ((0.5 + i) / TEXTURE_SIZE)) - xOffset,
                y = scrollheight * (j / TEXTURE_SIZE);
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
                const cx = left + (width / 2),
                    cy = top + (height / 4);
                const dx = x - cx,
                    dy = y - cy;

                tmpVec2.set(dx / width, dy / height).normalize();
                
                vectors[idx + 0] = tmpVec2.x / 10;
                vectors[idx + 1] = -tmpVec2.y / 10;
                vectors[idx + 2] = x;
                vectors[idx + 3] = y;
            } else {
                const plusminusone = (x - (width/2)) / Math.min(width/2, 450);
                const xperiodperiod = 1.05 + (Math.sin(y / 101) / 20)
                                    - (y < height ? Math.PI * (height - y) / height : 0);
                const xperiod = xperiodperiod * plusminusone * Math.PI;
                const yperiod = plusminusone * Math.PI;
                
                const vx = Math.sin(xperiod);
                const vy = Math.cos(yperiod / 2.1)
                            + 2 * Math.sin(y < height ? Math.PI * (y - (height/2)) / (height/2) : 0);

                tmpVec2.set(vx, vy).normalize();

                const xcx = (width / 2) - x;
                const ycy = (height / 2) - y;

                const dsq = (xcx * xcx) + (ycy * ycy);
                const radius = (height/2)*(height/2);

                if (dsq < radius) {
                    tmpVec2.multiplyScalar(
                        1
                        + (dsq / radius)
                        //+ (0.5 - Math.random())
                    );
                    if (dsq < radius / 4 && dsq > 0) {
                        const r = ((radius / 4) - dsq) / (radius / 4);
                        const x = tmpVec2.y * r;
                        const y = -tmpVec2.x * r;

                        tmpVec2.add({x, y});
                    }
                }

                vectors[idx + 0] = tmpVec2.x / 20;
                vectors[idx + 1] = tmpVec2.y / 20;
                vectors[idx + 2] = x;
                vectors[idx + 3] = y;
            }

            idx += 4;
        }
    }

    
    /* canvas.height = scrollheight;
    canvas.width = width;

    ctx.beginPath();
    
    for (let i = 0; i <= vectors.length; i += 4) {
        ctx.moveTo(vectors[i + 2], vectors[i + 3]);
        ctx.lineTo(
            vectors[i + 2] + (vectors[i + 0] * 100),
            vectors[i + 3] - (vectors[i + 1] * 100)
        );
        ctx.arc(vectors[i + 2], vectors[i + 3], 1, 0, 2 * Math.PI);
    }
    
    ctx.stroke(); */

    texture.needsUpdate = true;

    return texture;
}
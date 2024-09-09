import * as THREE from 'three';

const GLYPH_SIZE = 64;
const GLYPH_FONT = 'serif';

const chars = '01?%'.split('');

export const GLYPH_COUNT = chars.length;


const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

canvas.height = GLYPH_SIZE;
canvas.width = GLYPH_SIZE * GLYPH_COUNT;

ctx.fillStyle = '#fff';
ctx.font = `${GLYPH_SIZE}px ${GLYPH_FONT}`

for (let i = 0; i < GLYPH_COUNT; i++) {
    const glyph = chars[i];
    const size = ctx.measureText(glyph);
    ctx.fillText(
        glyph,
        (i * GLYPH_SIZE) + ((GLYPH_SIZE - size.width) / 2),
        GLYPH_SIZE - ((GLYPH_SIZE - size.actualBoundingBoxAscent) / 2)
    );
}

const glyphs = new THREE.CanvasTexture(canvas);
/* glyphs.minFilter = THREE.LinearFilter;
glyphs.wrapS = THREE.ClampToEdgeWrapping;
glyphs.wrapT = THREE.ClampToEdgeWrapping; */
export default glyphs;
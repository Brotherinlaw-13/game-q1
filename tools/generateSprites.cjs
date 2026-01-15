/**
 * HireSpace Fighters - Pixel Art Sprite Generator v4
 * Uses the provided AI images with larger heads and minimal pixelation
 */

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 96;
const SHEET_COLS = 8;

const CHARACTERS = {
  will: {
    skinTone: '#e8c4a0',
    skinDark: '#d4a574',
    hairColor: '#4a3728',
    shirtMain: '#e63946',
    shirtDark: '#c1121f',
    shirtLight: '#ff6b6b',
    pantsMain: '#2b2d42',
    pantsDark: '#1a1a2e',
    shoeColor: '#1a1a1a',
    photoPath: './public/assets/sprites/will/photo.jpg',
    outputPath: './public/assets/sprites/will/spritesheet.png',
  },
  ed: {
    skinTone: '#f0d5b8',
    skinDark: '#dbb896',
    hairColor: '#2b1810',
    shirtMain: '#457b9d',
    shirtDark: '#1d3557',
    shirtLight: '#6ba3c7',
    pantsMain: '#2b2d42',
    pantsDark: '#1a1a2e',
    shoeColor: '#1a1a1a',
    photoPath: './public/assets/sprites/ed/photo.jpg',
    outputPath: './public/assets/sprites/ed/spritesheet.png',
  },
};

const ANIMATIONS = [
  { name: 'idle', frames: 4 },
  { name: 'walk', frames: 6 },
  { name: 'jump', frames: 4 },
  { name: 'crouch', frames: 2 },
  { name: 'high_punch', frames: 5 },
  { name: 'low_punch', frames: 4 },
  { name: 'high_kick', frames: 6 },
  { name: 'low_kick', frames: 5 },
  { name: 'hit', frames: 3 },
  { name: 'block', frames: 2 },
  { name: 'victory', frames: 4 },
  { name: 'defeat', frames: 5 },
];

/**
 * Draw a filled rectangle
 */
function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/**
 * Draw the face from photo - LARGER with gentle pixelation
 */
function drawFace(ctx, x, y, size, photo, char) {
  if (photo) {
    // Create temp canvas for gentle pixelation
    const tempSize = Math.floor(size / 2); // Only 2x pixelation to preserve detail
    const tempCanvas = createCanvas(tempSize, tempSize);
    const tempCtx = tempCanvas.getContext('2d');

    // Draw scaled down
    tempCtx.drawImage(photo, 0, 0, tempSize, tempSize);

    // Draw scaled up with nearest-neighbor (pixelated)
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, x, y, size, size);
    ctx.imageSmoothingEnabled = true;

    // Subtle outline
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, size, size);
  } else {
    // Fallback - draw simple face
    rect(ctx, x, y, size, size, char.skinTone);
    rect(ctx, x + size * 0.2, y + size * 0.35, size * 0.2, size * 0.2, '#1a1a1a');
    rect(ctx, x + size * 0.6, y + size * 0.35, size * 0.2, size * 0.2, '#1a1a1a');
    rect(ctx, x + size * 0.25, y + size * 0.7, size * 0.5, size * 0.12, '#c47a7a');
  }
}

/**
 * Draw a full fighter sprite with BIG head
 */
function drawFighter(ctx, frameX, frameY, char, photo, pose, frame) {
  const cx = frameX + FRAME_WIDTH / 2;
  const groundY = frameY + FRAME_HEIGHT - 4;

  // Animation variables
  let bodyOffsetY = 0;
  let bodyOffsetX = 0;
  let headTilt = 0;
  let leftArmExtend = 0;
  let rightArmExtend = 0;
  let leftLegSplit = 0;
  let rightLegSplit = 0;
  let crouchAmount = 0;
  let kickExtend = 0;

  // Pose animations
  switch (pose) {
    case 'idle':
      bodyOffsetY = Math.sin(frame * 0.8) * 2;
      break;
    case 'walk':
      bodyOffsetY = Math.abs(Math.sin(frame * 1.5)) * 2;
      leftLegSplit = Math.sin(frame * 1.5) * 6;
      rightLegSplit = -Math.sin(frame * 1.5) * 6;
      break;
    case 'jump':
      bodyOffsetY = -12 - frame * 4;
      leftLegSplit = -4;
      rightLegSplit = 4;
      break;
    case 'crouch':
    case 'block':
      crouchAmount = 16;
      if (pose === 'block') {
        leftArmExtend = -4;
        rightArmExtend = -4;
      }
      break;
    case 'high_punch':
      rightArmExtend = frame < 3 ? frame * 10 : 20;
      bodyOffsetX = frame < 3 ? frame * 1.5 : 3;
      break;
    case 'low_punch':
      rightArmExtend = frame < 2 ? frame * 8 : 14;
      crouchAmount = 8;
      bodyOffsetX = frame < 2 ? frame * 1.5 : 2;
      break;
    case 'high_kick':
      kickExtend = frame < 4 ? frame * 6 : 18;
      bodyOffsetX = frame < 4 ? frame * 1.5 : 4;
      break;
    case 'low_kick':
      kickExtend = frame < 3 ? frame * 8 : 20;
      crouchAmount = 12;
      break;
    case 'hit':
      bodyOffsetX = -frame * 4;
      headTilt = frame * 2;
      break;
    case 'victory':
      leftArmExtend = -12;
      rightArmExtend = -12;
      bodyOffsetY = Math.sin(frame * 1.2) * 3;
      break;
    case 'defeat':
      bodyOffsetY = frame * 10;
      headTilt = frame * 6;
      crouchAmount = frame * 6;
      break;
  }

  // Larger proportions - BIG HEAD style
  const headSize = 36; // Much bigger head!
  const bodyWidth = 18;
  const bodyHeight = 22 - crouchAmount * 0.25;
  const legWidth = 7;
  const legHeight = 20 - crouchAmount * 0.4;
  const armWidth = 5;
  const armLength = 14;

  const headY = groundY - legHeight - bodyHeight - headSize + bodyOffsetY + crouchAmount;
  const bodyY = groundY - legHeight - bodyHeight + bodyOffsetY + crouchAmount;
  const legY = groundY - legHeight + crouchAmount * 0.4;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx + bodyOffsetX, groundY + 2, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  const legBaseX = cx + bodyOffsetX;

  if (kickExtend > 0) {
    rect(ctx, legBaseX - legWidth - 2, legY, legWidth, legHeight, char.pantsMain);
    rect(ctx, legBaseX - legWidth - 2, groundY - 5, legWidth + 2, 5, char.shoeColor);
    rect(ctx, legBaseX + 2, legY + 4, kickExtend + legWidth, 7, char.pantsMain);
    rect(ctx, legBaseX + kickExtend + legWidth - 3, legY + 3, 7, 9, char.shoeColor);
  } else {
    rect(ctx, legBaseX - legWidth - 2 + leftLegSplit, legY, legWidth, legHeight, char.pantsMain);
    rect(ctx, legBaseX + 2 + rightLegSplit, legY, legWidth, legHeight, char.pantsMain);
    rect(ctx, legBaseX - legWidth - 3 + leftLegSplit, groundY - 5, legWidth + 3, 5, char.shoeColor);
    rect(ctx, legBaseX + rightLegSplit, groundY - 5, legWidth + 3, 5, char.shoeColor);
  }

  // Body
  const bodyX = cx - bodyWidth / 2 + bodyOffsetX;
  rect(ctx, bodyX - 2, bodyY, bodyWidth + 4, 6, char.shirtMain);
  rect(ctx, bodyX, bodyY + 5, bodyWidth, bodyHeight - 5, char.shirtMain);
  rect(ctx, bodyX + 2, bodyY + 8, bodyWidth - 4, bodyHeight - 11, char.shirtDark);
  rect(ctx, bodyX, bodyY + bodyHeight - 3, bodyWidth, 3, '#3a3a3a');
  rect(ctx, cx - 2 + bodyOffsetX, bodyY + bodyHeight - 2, 4, 2, '#ffd700');

  // Arms
  const armY = bodyY + 3;

  if (leftArmExtend < 0) {
    rect(ctx, bodyX - armWidth - 2, armY + leftArmExtend, armWidth, armLength + leftArmExtend, char.shirtMain);
    rect(ctx, bodyX - armWidth, armY + leftArmExtend - 3, armWidth - 1, 5, char.skinTone);
  } else {
    rect(ctx, bodyX - armWidth - 2, armY, armWidth, armLength, char.shirtMain);
    rect(ctx, bodyX - armWidth, armY + armLength - 2, armWidth - 1, 5, char.skinTone);
  }

  if (rightArmExtend > 0) {
    rect(ctx, bodyX + bodyWidth, armY + 2, rightArmExtend + 6, armWidth, char.shirtMain);
    rect(ctx, bodyX + bodyWidth + rightArmExtend + 3, armY, 6, armWidth + 3, char.skinTone);
  } else if (rightArmExtend < 0) {
    rect(ctx, bodyX + bodyWidth, armY + rightArmExtend, armWidth, armLength + rightArmExtend, char.shirtMain);
    rect(ctx, bodyX + bodyWidth + 1, armY + rightArmExtend - 3, armWidth - 1, 5, char.skinTone);
  } else {
    rect(ctx, bodyX + bodyWidth, armY, armWidth, armLength, char.shirtMain);
    rect(ctx, bodyX + bodyWidth + 1, armY + armLength - 2, armWidth - 1, 5, char.skinTone);
  }

  // Neck
  rect(ctx, cx - 3 + bodyOffsetX, bodyY - 3, 6, 5, char.skinTone);

  // HEAD - Big and prominent with the actual image!
  const headX = cx - headSize / 2 + bodyOffsetX + headTilt;
  drawFace(ctx, headX, headY, headSize, photo, char);
}

/**
 * Generate sprite sheet
 */
async function generateSpriteSheet(charId) {
  const char = CHARACTERS[charId];
  console.log(`Generating ${charId} sprites...`);

  let photo = null;
  try {
    photo = await loadImage(char.photoPath);
    console.log(`  Loaded photo: ${char.photoPath} (${photo.width}x${photo.height})`);
  } catch (e) {
    console.log(`  No photo found, using fallback face`);
  }

  const totalFrames = ANIMATIONS.reduce((sum, a) => sum + a.frames, 0);
  const rows = Math.ceil(totalFrames / SHEET_COLS);

  const canvas = createCanvas(SHEET_COLS * FRAME_WIDTH, rows * FRAME_HEIGHT);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  let frameIdx = 0;
  for (const anim of ANIMATIONS) {
    for (let f = 0; f < anim.frames; f++) {
      const col = frameIdx % SHEET_COLS;
      const row = Math.floor(frameIdx / SHEET_COLS);
      const x = col * FRAME_WIDTH;
      const y = row * FRAME_HEIGHT;

      drawFighter(ctx, x, y, char, photo, anim.name, f);
      frameIdx++;
    }
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(char.outputPath, buffer);
  console.log(`  Saved: ${char.outputPath}`);

  const meta = { frameWidth: FRAME_WIDTH, frameHeight: FRAME_HEIGHT, animations: {} };
  let start = 0;
  for (const anim of ANIMATIONS) {
    meta.animations[anim.name] = { start, end: start + anim.frames - 1, frames: anim.frames };
    start += anim.frames;
  }
  fs.writeFileSync(char.outputPath.replace('.png', '.json'), JSON.stringify(meta, null, 2));
}

async function main() {
  console.log('\n=== HireSpace Fighters Sprite Generator v4 ===\n');
  for (const id of Object.keys(CHARACTERS)) {
    await generateSpriteSheet(id);
  }
  console.log('\nDone!\n');
}

main().catch(console.error);

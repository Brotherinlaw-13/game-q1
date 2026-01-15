/**
 * HireSpace Fighters - Pixel Art Sprite Generator v3
 * Creates awesome 8-bit sprites with recognizable faces from photos
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
 * Pixelate an image to create 8-bit style
 */
function pixelate(ctx, img, x, y, w, h, pixelSize) {
  const tempCanvas = createCanvas(Math.floor(w / pixelSize), Math.floor(h / pixelSize));
  const tempCtx = tempCanvas.getContext('2d');

  // Draw scaled down
  tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

  // Draw scaled up (pixelated)
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tempCanvas, x, y, w, h);
  ctx.imageSmoothingEnabled = true;
}

/**
 * Draw a filled rectangle
 */
function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/**
 * Draw the pixelated face from photo - LARGE and prominent
 */
function drawFace(ctx, x, y, size, photo, char) {
  if (photo) {
    // Draw pixelated photo as main face
    const pixelSize = 8; // Larger pixels for more 8-bit look
    pixelate(ctx, photo, x, y, size, size, pixelSize);

    // Add outline
    ctx.strokeStyle = char.hairColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);
  } else {
    // Fallback - draw simple face
    rect(ctx, x, y, size, size, char.skinTone);
    // Eyes
    rect(ctx, x + size * 0.25, y + size * 0.4, size * 0.15, size * 0.15, '#1a1a1a');
    rect(ctx, x + size * 0.6, y + size * 0.4, size * 0.15, size * 0.15, '#1a1a1a');
    // Mouth
    rect(ctx, x + size * 0.3, y + size * 0.7, size * 0.4, size * 0.1, '#c47a7a');
  }
}

/**
 * Draw a full fighter sprite
 */
function drawFighter(ctx, frameX, frameY, char, photo, pose, frame) {
  const cx = frameX + FRAME_WIDTH / 2; // Center X
  const groundY = frameY + FRAME_HEIGHT - 4; // Ground level

  // Animation offsets
  let bodyOffsetY = 0;
  let bodyOffsetX = 0;
  let headTilt = 0;
  let leftArmExtend = 0;
  let rightArmExtend = 0;
  let leftLegSplit = 0;
  let rightLegSplit = 0;
  let crouchAmount = 0;
  let kickExtend = 0;

  // Pose-specific adjustments
  switch (pose) {
    case 'idle':
      bodyOffsetY = Math.sin(frame * 0.8) * 2;
      break;
    case 'walk':
      bodyOffsetY = Math.abs(Math.sin(frame * 1.5)) * 3;
      leftLegSplit = Math.sin(frame * 1.5) * 8;
      rightLegSplit = -Math.sin(frame * 1.5) * 8;
      break;
    case 'jump':
      bodyOffsetY = -15 - frame * 5;
      leftLegSplit = -5;
      rightLegSplit = 5;
      break;
    case 'crouch':
    case 'block':
      crouchAmount = 20;
      if (pose === 'block') {
        leftArmExtend = -5;
        rightArmExtend = -5;
      }
      break;
    case 'high_punch':
      rightArmExtend = frame < 3 ? frame * 12 : 24;
      bodyOffsetX = frame < 3 ? frame * 2 : 4;
      break;
    case 'low_punch':
      rightArmExtend = frame < 2 ? frame * 10 : 18;
      crouchAmount = 10;
      bodyOffsetX = frame < 2 ? frame * 2 : 3;
      break;
    case 'high_kick':
      kickExtend = frame < 4 ? frame * 8 : 24;
      bodyOffsetX = frame < 4 ? frame * 2 : 6;
      break;
    case 'low_kick':
      kickExtend = frame < 3 ? frame * 10 : 25;
      crouchAmount = 15;
      break;
    case 'hit':
      bodyOffsetX = -frame * 5;
      headTilt = frame * 3;
      break;
    case 'victory':
      leftArmExtend = -15;
      rightArmExtend = -15;
      bodyOffsetY = Math.sin(frame * 1.2) * 4;
      break;
    case 'defeat':
      bodyOffsetY = frame * 12;
      headTilt = frame * 8;
      crouchAmount = frame * 8;
      break;
  }

  // Calculate positions
  const headSize = 24;
  const bodyWidth = 20;
  const bodyHeight = 28 - crouchAmount * 0.3;
  const legWidth = 8;
  const legHeight = 24 - crouchAmount * 0.5;
  const armWidth = 6;
  const armLength = 18;

  const headY = groundY - legHeight - bodyHeight - headSize + bodyOffsetY + crouchAmount;
  const bodyY = groundY - legHeight - bodyHeight + bodyOffsetY + crouchAmount;
  const legY = groundY - legHeight + crouchAmount * 0.5;

  // Draw shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(cx + bodyOffsetX, groundY + 2, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw legs
  const legBaseX = cx + bodyOffsetX;

  if (kickExtend > 0) {
    // Kicking leg
    rect(ctx, legBaseX - legWidth - 2, legY, legWidth, legHeight, char.pantsMain);
    rect(ctx, legBaseX - legWidth - 2, groundY - 6, legWidth + 2, 6, char.shoeColor);
    // Extended kick leg
    rect(ctx, legBaseX + 2, legY + 5, kickExtend + legWidth, 8, char.pantsMain);
    rect(ctx, legBaseX + kickExtend + legWidth - 4, legY + 4, 8, 10, char.shoeColor);
  } else {
    // Normal legs
    rect(ctx, legBaseX - legWidth - 2 + leftLegSplit, legY, legWidth, legHeight, char.pantsMain);
    rect(ctx, legBaseX + 2 + rightLegSplit, legY, legWidth, legHeight, char.pantsMain);
    // Shoes
    rect(ctx, legBaseX - legWidth - 4 + leftLegSplit, groundY - 6, legWidth + 4, 6, char.shoeColor);
    rect(ctx, legBaseX + rightLegSplit, groundY - 6, legWidth + 4, 6, char.shoeColor);
  }

  // Draw body
  const bodyX = cx - bodyWidth / 2 + bodyOffsetX;
  rect(ctx, bodyX - 2, bodyY, bodyWidth + 4, 8, char.shirtMain); // Shoulders
  rect(ctx, bodyX, bodyY + 6, bodyWidth, bodyHeight - 6, char.shirtMain);
  // Shirt details
  rect(ctx, bodyX + 3, bodyY + 10, bodyWidth - 6, bodyHeight - 14, char.shirtDark);
  rect(ctx, bodyX + 5, bodyY + 12, bodyWidth - 10, bodyHeight - 18, char.shirtMain);
  // Belt
  rect(ctx, bodyX, bodyY + bodyHeight - 4, bodyWidth, 4, '#3a3a3a');
  rect(ctx, cx - 2 + bodyOffsetX, bodyY + bodyHeight - 3, 4, 2, '#ffd700');

  // Draw arms
  const armY = bodyY + 4;

  // Left arm
  if (leftArmExtend < 0) {
    // Arm raised
    rect(ctx, bodyX - armWidth - 2, armY + leftArmExtend, armWidth, armLength + leftArmExtend, char.shirtMain);
    rect(ctx, bodyX - armWidth, armY + leftArmExtend - 4, armWidth - 2, 6, char.skinTone);
  } else {
    rect(ctx, bodyX - armWidth - 2, armY, armWidth, armLength, char.shirtMain);
    rect(ctx, bodyX - armWidth, armY + armLength - 2, armWidth - 2, 6, char.skinTone);
  }

  // Right arm
  if (rightArmExtend > 0) {
    // Punching
    rect(ctx, bodyX + bodyWidth, armY + 2, rightArmExtend + 8, armWidth, char.shirtMain);
    rect(ctx, bodyX + bodyWidth + rightArmExtend + 4, armY, 8, armWidth + 4, char.skinTone);
  } else if (rightArmExtend < 0) {
    // Arm raised
    rect(ctx, bodyX + bodyWidth, armY + rightArmExtend, armWidth, armLength + rightArmExtend, char.shirtMain);
    rect(ctx, bodyX + bodyWidth + 2, armY + rightArmExtend - 4, armWidth - 2, 6, char.skinTone);
  } else {
    rect(ctx, bodyX + bodyWidth, armY, armWidth, armLength, char.shirtMain);
    rect(ctx, bodyX + bodyWidth + 2, armY + armLength - 2, armWidth - 2, 6, char.skinTone);
  }

  // Draw neck
  rect(ctx, cx - 4 + bodyOffsetX, bodyY - 4, 8, 6, char.skinTone);

  // Draw head with pixelated photo - LARGE AND PROMINENT
  const headX = cx - headSize / 2 + bodyOffsetX + headTilt;
  drawFace(ctx, headX, headY, headSize, photo, char);

  // Add hair on top
  rect(ctx, headX, headY - 2, headSize, 4, char.hairColor);
  rect(ctx, headX + 2, headY - 4, headSize - 4, 4, char.hairColor);
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
    console.log(`  Loaded photo: ${char.photoPath}`);
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

  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(char.outputPath, buffer);
  console.log(`  Saved: ${char.outputPath}`);

  // Metadata
  const meta = { frameWidth: FRAME_WIDTH, frameHeight: FRAME_HEIGHT, animations: {} };
  let start = 0;
  for (const anim of ANIMATIONS) {
    meta.animations[anim.name] = { start, end: start + anim.frames - 1, frames: anim.frames };
    start += anim.frames;
  }
  fs.writeFileSync(char.outputPath.replace('.png', '.json'), JSON.stringify(meta, null, 2));
}

async function main() {
  console.log('\n=== HireSpace Fighters Sprite Generator v3 ===\n');
  for (const id of Object.keys(CHARACTERS)) {
    await generateSpriteSheet(id);
  }
  console.log('\nDone!\n');
}

main().catch(console.error);

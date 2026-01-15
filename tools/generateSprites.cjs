/**
 * Sprite Generator for HireSpace Fighters
 * Creates proper 8-bit style sprite sheets with detailed pixel art
 */

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Sprite configuration
const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 96;
const SHEET_COLS = 8;

// Character configurations
const CHARACTERS = {
  will: {
    skinColor: '#e8c4a0',
    hairColor: '#4a3728',
    shirtColor: '#e63946',
    shirtDark: '#c1121f',
    pantsColor: '#2b2d42',
    pantsDark: '#1a1a2e',
    photoPath: './public/assets/sprites/will/photo.jpg',
    outputPath: './public/assets/sprites/will/spritesheet.png',
  },
  ed: {
    skinColor: '#f0d5b8',
    hairColor: '#2b1810',
    shirtColor: '#457b9d',
    shirtDark: '#1d3557',
    pantsColor: '#2b2d42',
    pantsDark: '#1a1a2e',
    photoPath: './public/assets/sprites/ed/photo.jpg',
    outputPath: './public/assets/sprites/ed/spritesheet.png',
  },
};

// Animation frames
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
 * Draw a pixel at the given position (scaled)
 */
function drawPixel(ctx, x, y, color, scale = 2) {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, scale, scale);
}

/**
 * Draw a rectangle of pixels
 */
function drawRect(ctx, x, y, w, h, color, scale = 2) {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
}

/**
 * Draw the fighter's head with pixelated face from photo
 */
async function drawHead(ctx, x, y, char, photo, scale = 2) {
  const headWidth = 14;
  const headHeight = 14;

  // Draw hair (top of head)
  drawRect(ctx, x + 2, y, 10, 3, char.hairColor, scale);
  drawRect(ctx, x + 1, y + 1, 12, 2, char.hairColor, scale);

  // Draw face base
  drawRect(ctx, x + 1, y + 3, 12, 10, char.skinColor, scale);
  drawRect(ctx, x + 2, y + 2, 10, 2, char.skinColor, scale);

  // If we have a photo, pixelate and overlay on face
  if (photo) {
    const faceCanvas = createCanvas(10 * scale, 8 * scale);
    const faceCtx = faceCanvas.getContext('2d');

    // Draw photo scaled down then up for pixelation
    const tempCanvas = createCanvas(10, 8);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(photo, 0, 0, 10, 8);

    faceCtx.imageSmoothingEnabled = false;
    faceCtx.drawImage(tempCanvas, 0, 0, 10 * scale, 8 * scale);

    // Blend with skin color
    ctx.globalAlpha = 0.7;
    ctx.drawImage(faceCanvas, (x + 2) * scale, (y + 4) * scale);
    ctx.globalAlpha = 1;
  }

  // Draw eyes
  drawRect(ctx, x + 4, y + 6, 2, 2, '#1a1a1a', scale);
  drawRect(ctx, x + 9, y + 6, 2, 2, '#1a1a1a', scale);

  // Eye highlights
  drawPixel(ctx, x + 4, y + 6, '#ffffff', scale);
  drawPixel(ctx, x + 9, y + 6, '#ffffff', scale);

  // Eyebrows
  drawRect(ctx, x + 3, y + 5, 3, 1, char.hairColor, scale);
  drawRect(ctx, x + 9, y + 5, 3, 1, char.hairColor, scale);

  // Nose
  drawPixel(ctx, x + 7, y + 8, '#d4a574', scale);
  drawPixel(ctx, x + 7, y + 9, '#d4a574', scale);

  // Mouth
  drawRect(ctx, x + 5, y + 11, 4, 1, '#c47a7a', scale);

  // Ear
  drawRect(ctx, x, y + 5, 1, 4, char.skinColor, scale);
  drawRect(ctx, x + 13, y + 5, 1, 4, char.skinColor, scale);
}

/**
 * Draw fighter body
 */
function drawBody(ctx, x, y, char, scale = 2) {
  // Neck
  drawRect(ctx, x + 5, y, 4, 3, char.skinColor, scale);

  // Shoulders/shirt top
  drawRect(ctx, x, y + 3, 14, 4, char.shirtColor, scale);

  // Torso
  drawRect(ctx, x + 1, y + 7, 12, 10, char.shirtColor, scale);
  drawRect(ctx, x + 2, y + 7, 10, 10, char.shirtDark, scale);
  drawRect(ctx, x + 3, y + 8, 8, 8, char.shirtColor, scale);

  // Belt
  drawRect(ctx, x + 2, y + 16, 10, 2, '#3a3a3a', scale);
  drawPixel(ctx, x + 6, y + 16, '#ffd700', scale);
  drawPixel(ctx, x + 7, y + 16, '#ffd700', scale);
}

/**
 * Draw arms
 */
function drawArms(ctx, x, y, char, leftAngle, rightAngle, scale = 2) {
  // Simplified arm drawing based on angle
  // leftAngle/rightAngle: 0 = down, 1 = forward, 2 = up

  // Left arm
  if (leftAngle === 0) {
    // Arm down
    drawRect(ctx, x - 3, y + 3, 3, 12, char.shirtColor, scale);
    drawRect(ctx, x - 2, y + 14, 2, 4, char.skinColor, scale); // hand
  } else if (leftAngle === 1) {
    // Arm forward (punch)
    drawRect(ctx, x - 8, y + 4, 8, 3, char.shirtColor, scale);
    drawRect(ctx, x - 10, y + 4, 3, 3, char.skinColor, scale); // fist
  } else {
    // Arm up
    drawRect(ctx, x - 2, y - 4, 3, 8, char.shirtColor, scale);
    drawRect(ctx, x - 1, y - 6, 2, 3, char.skinColor, scale);
  }

  // Right arm
  if (rightAngle === 0) {
    drawRect(ctx, x + 14, y + 3, 3, 12, char.shirtColor, scale);
    drawRect(ctx, x + 14, y + 14, 2, 4, char.skinColor, scale);
  } else if (rightAngle === 1) {
    drawRect(ctx, x + 14, y + 4, 12, 3, char.shirtColor, scale);
    drawRect(ctx, x + 24, y + 4, 3, 3, char.skinColor, scale);
  } else {
    drawRect(ctx, x + 13, y - 4, 3, 8, char.shirtColor, scale);
    drawRect(ctx, x + 13, y - 6, 2, 3, char.skinColor, scale);
  }
}

/**
 * Draw legs
 */
function drawLegs(ctx, x, y, char, pose, frame, scale = 2) {
  const legY = y + 18;

  if (pose === 'crouch' || pose === 'low_kick' || pose === 'low_punch') {
    // Crouching legs
    drawRect(ctx, x + 1, legY, 5, 8, char.pantsColor, scale);
    drawRect(ctx, x + 8, legY, 5, 8, char.pantsColor, scale);
    drawRect(ctx, x + 1, legY + 7, 5, 3, char.pantsDark, scale); // shoes
    drawRect(ctx, x + 8, legY + 7, 5, 3, char.pantsDark, scale);
  } else if (pose === 'walk') {
    // Walking animation
    const offset = Math.sin(frame * 1.2) * 3;
    drawRect(ctx, x + 1 + offset, legY, 5, 16, char.pantsColor, scale);
    drawRect(ctx, x + 8 - offset, legY, 5, 16, char.pantsColor, scale);
    drawRect(ctx, x + 1 + offset, legY + 14, 5, 3, char.pantsDark, scale);
    drawRect(ctx, x + 8 - offset, legY + 14, 5, 3, char.pantsDark, scale);
  } else if (pose === 'jump') {
    // Jumping legs (tucked)
    drawRect(ctx, x + 2, legY, 5, 10, char.pantsColor, scale);
    drawRect(ctx, x + 8, legY, 5, 10, char.pantsColor, scale);
    drawRect(ctx, x + 2, legY + 8, 5, 3, char.pantsDark, scale);
    drawRect(ctx, x + 8, legY + 8, 5, 3, char.pantsDark, scale);
  } else if (pose === 'high_kick') {
    // Kicking pose - one leg up
    drawRect(ctx, x + 2, legY, 5, 16, char.pantsColor, scale);
    drawRect(ctx, x + 2, legY + 14, 5, 3, char.pantsDark, scale);
    // Kicking leg extended
    drawRect(ctx, x + 10, legY - 6, 14, 4, char.pantsColor, scale);
    drawRect(ctx, x + 22, legY - 6, 4, 4, char.pantsDark, scale);
  } else if (pose === 'low_kick') {
    // Low kick
    drawRect(ctx, x + 2, legY, 5, 10, char.pantsColor, scale);
    drawRect(ctx, x + 2, legY + 8, 5, 3, char.pantsDark, scale);
    drawRect(ctx, x + 8, legY + 6, 14, 4, char.pantsColor, scale);
    drawRect(ctx, x + 20, legY + 6, 4, 3, char.pantsDark, scale);
  } else {
    // Standing legs
    drawRect(ctx, x + 2, legY, 5, 18, char.pantsColor, scale);
    drawRect(ctx, x + 8, legY, 5, 18, char.pantsColor, scale);
    // Shoes
    drawRect(ctx, x + 1, legY + 16, 6, 3, char.pantsDark, scale);
    drawRect(ctx, x + 8, legY + 16, 6, 3, char.pantsDark, scale);
  }
}

/**
 * Draw a complete fighter frame
 */
async function drawFighter(ctx, frameX, frameY, char, photo, pose, frame) {
  const scale = 2;
  const baseX = frameX / scale + 8;  // Center in frame
  const baseY = frameY / scale + 4;

  let headY = baseY;
  let bodyY = baseY + 14;
  let leftArm = 0;
  let rightArm = 0;

  // Adjust based on pose
  switch (pose) {
    case 'idle':
      headY += Math.sin(frame * 0.5) * 0.5;
      break;
    case 'walk':
      headY += Math.abs(Math.sin(frame * 1.2)) * 1;
      break;
    case 'jump':
      headY -= frame * 2;
      bodyY -= frame * 2;
      break;
    case 'crouch':
    case 'block':
      headY += 8;
      bodyY += 8;
      leftArm = pose === 'block' ? 2 : 0;
      rightArm = pose === 'block' ? 2 : 0;
      break;
    case 'high_punch':
      rightArm = frame >= 2 ? 1 : 0;
      break;
    case 'low_punch':
      headY += 4;
      bodyY += 4;
      rightArm = frame >= 1 ? 1 : 0;
      break;
    case 'high_kick':
    case 'low_kick':
      // Legs handled in drawLegs
      break;
    case 'hit':
      headY += frame;
      bodyY += frame;
      break;
    case 'victory':
      leftArm = 2;
      rightArm = 2;
      headY -= Math.sin(frame * 0.8) * 2;
      break;
    case 'defeat':
      headY += frame * 4;
      bodyY += frame * 4;
      break;
  }

  // Draw shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(
    frameX + FRAME_WIDTH,
    frameY + FRAME_HEIGHT * 2 - 8,
    20,
    6,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Draw parts (back to front)
  drawLegs(ctx, baseX, bodyY, char, pose, frame, scale);
  drawArms(ctx, baseX, bodyY, char, leftArm, rightArm, scale);
  drawBody(ctx, baseX, bodyY, char, scale);
  await drawHead(ctx, baseX + 1, headY, char, photo, scale);
}

/**
 * Generate sprite sheet for a character
 */
async function generateSpriteSheet(characterId) {
  const char = CHARACTERS[characterId];
  console.log(`Generating sprites for ${characterId}...`);

  // Load photo
  let photo = null;
  try {
    photo = await loadImage(char.photoPath);
  } catch (e) {
    console.log(`Could not load photo for ${characterId}, using plain face`);
  }

  // Calculate sheet size
  const totalFrames = ANIMATIONS.reduce((sum, anim) => sum + anim.frames, 0);
  const rows = Math.ceil(totalFrames / SHEET_COLS);
  const sheetWidth = SHEET_COLS * FRAME_WIDTH;
  const sheetHeight = rows * FRAME_HEIGHT;

  // Create canvas
  const canvas = createCanvas(sheetWidth, sheetHeight);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  let frameIndex = 0;

  for (const anim of ANIMATIONS) {
    for (let f = 0; f < anim.frames; f++) {
      const col = frameIndex % SHEET_COLS;
      const row = Math.floor(frameIndex / SHEET_COLS);
      const x = col * FRAME_WIDTH;
      const y = row * FRAME_HEIGHT;

      await drawFighter(ctx, x, y, char, photo, anim.name, f);
      frameIndex++;
    }
  }

  // Save
  const outputDir = path.dirname(char.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(char.outputPath, buffer);
  console.log(`Saved ${char.outputPath}`);

  // Save metadata
  const metadata = {
    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
    animations: {},
  };

  let startFrame = 0;
  for (const anim of ANIMATIONS) {
    metadata.animations[anim.name] = {
      start: startFrame,
      end: startFrame + anim.frames - 1,
      frames: anim.frames,
    };
    startFrame += anim.frames;
  }

  const metadataPath = char.outputPath.replace('.png', '.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`Saved ${metadataPath}`);
}

async function main() {
  console.log('=== HireSpace Fighters Sprite Generator v2 ===\n');

  for (const id of Object.keys(CHARACTERS)) {
    await generateSpriteSheet(id);
  }

  console.log('\nDone!');
}

main().catch(console.error);

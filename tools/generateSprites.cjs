/**
 * Sprite Generator for HireSpace Fighters
 * Creates 8-bit style sprite sheets from LinkedIn profile photos
 */

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Sprite sheet configuration
const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 96;
const SHEET_COLS = 8;
const PIXEL_SIZE = 4; // How much to pixelate (higher = more pixelated)

// Character colors
const CHARACTERS = {
  will: {
    primary: '#e63946',    // Red
    secondary: '#c1121f',  // Dark red
    skin: '#ddb892',
    hair: '#3d2914',
    photoPath: './public/assets/sprites/will/photo.jpg',
    outputPath: './public/assets/sprites/will/spritesheet.png',
  },
  ed: {
    primary: '#457b9d',    // Blue
    secondary: '#1d3557',  // Dark blue
    skin: '#e5c9a8',
    hair: '#2b1d0e',
    photoPath: './public/assets/sprites/ed/photo.jpg',
    outputPath: './public/assets/sprites/ed/spritesheet.png',
  },
};

// Animation frames configuration
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
function pixelateImage(ctx, img, x, y, width, height, pixelSize) {
  // Draw scaled down then scaled up for pixelation effect
  const tempCanvas = createCanvas(width / pixelSize, height / pixelSize);
  const tempCtx = tempCanvas.getContext('2d');

  tempCtx.drawImage(img, 0, 0, width / pixelSize, height / pixelSize);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tempCanvas, x, y, width, height);
  ctx.imageSmoothingEnabled = true;
}

/**
 * Draw a pixel-art style character body
 */
function drawBody(ctx, x, y, colors, pose = 'idle', frame = 0) {
  ctx.imageSmoothingEnabled = false;

  const bodyWidth = 32;
  const bodyHeight = 40;
  const headSize = 24;
  const legWidth = 12;
  const armWidth = 8;

  // Body position offsets based on pose
  let bodyOffsetX = 0;
  let bodyOffsetY = 0;
  let leftArmAngle = 0;
  let rightArmAngle = 0;
  let leftLegOffset = 0;
  let rightLegOffset = 0;
  let crouching = false;

  // Animate based on pose and frame
  switch (pose) {
    case 'idle':
      bodyOffsetY = Math.sin(frame * 0.5) * 2;
      break;
    case 'walk':
      leftLegOffset = Math.sin(frame * 1.2) * 8;
      rightLegOffset = -Math.sin(frame * 1.2) * 8;
      leftArmAngle = -Math.sin(frame * 1.2) * 0.3;
      rightArmAngle = Math.sin(frame * 1.2) * 0.3;
      break;
    case 'jump':
      bodyOffsetY = -frame * 4;
      leftArmAngle = -0.5;
      rightArmAngle = -0.5;
      break;
    case 'crouch':
      crouching = true;
      bodyOffsetY = 16;
      break;
    case 'high_punch':
      rightArmAngle = -1.2 + (frame < 3 ? frame * 0.4 : 0);
      bodyOffsetX = frame < 3 ? frame * 2 : 4;
      break;
    case 'low_punch':
      rightArmAngle = 0.3;
      bodyOffsetX = frame < 2 ? frame * 2 : 3;
      crouching = frame > 0;
      bodyOffsetY = crouching ? 8 : 0;
      break;
    case 'high_kick':
      rightLegOffset = frame < 3 ? -frame * 10 : -20;
      bodyOffsetX = frame < 3 ? frame * 2 : 4;
      break;
    case 'low_kick':
      rightLegOffset = frame < 2 ? frame * 12 : 20;
      crouching = true;
      bodyOffsetY = 12;
      break;
    case 'hit':
      bodyOffsetX = -frame * 3;
      bodyOffsetY = frame * 2;
      break;
    case 'block':
      leftArmAngle = -1;
      rightArmAngle = -0.8;
      crouching = frame > 0;
      bodyOffsetY = crouching ? 8 : 0;
      break;
    case 'victory':
      leftArmAngle = -1.5;
      rightArmAngle = -1.5;
      bodyOffsetY = Math.sin(frame * 0.8) * 4;
      break;
    case 'defeat':
      bodyOffsetY = frame * 8;
      bodyOffsetX = -frame * 2;
      break;
  }

  const centerX = x + FRAME_WIDTH / 2 + bodyOffsetX;
  const baseY = y + FRAME_HEIGHT - 8 + bodyOffsetY;

  // Draw shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(centerX - 16, y + FRAME_HEIGHT - 8, 32, 8);

  // Draw legs
  ctx.fillStyle = colors.secondary;
  if (!crouching) {
    // Left leg
    ctx.fillRect(centerX - 14 + leftLegOffset/2, baseY - 36, legWidth, 28);
    // Right leg
    ctx.fillRect(centerX + 2 + rightLegOffset/2, baseY - 36, legWidth, 28);
  } else {
    // Crouching legs
    ctx.fillRect(centerX - 16, baseY - 20, 14, 16);
    ctx.fillRect(centerX + 2, baseY - 20, 14, 16);
  }

  // Draw body/torso
  ctx.fillStyle = colors.primary;
  const torsoHeight = crouching ? 24 : 32;
  const torsoY = crouching ? baseY - 44 : baseY - 60;
  ctx.fillRect(centerX - bodyWidth/2, torsoY, bodyWidth, torsoHeight);

  // Draw arms
  ctx.fillStyle = colors.skin;
  // Left arm
  ctx.save();
  ctx.translate(centerX - bodyWidth/2, torsoY + 4);
  ctx.rotate(leftArmAngle);
  ctx.fillRect(-armWidth, 0, armWidth, 24);
  ctx.restore();

  // Right arm
  ctx.save();
  ctx.translate(centerX + bodyWidth/2, torsoY + 4);
  ctx.rotate(rightArmAngle);
  ctx.fillRect(0, 0, armWidth, 24);
  ctx.restore();

  // Return head position for photo overlay
  return {
    headX: centerX - headSize/2,
    headY: torsoY - headSize - 2,
    headSize: headSize,
  };
}

/**
 * Generate sprite sheet for a character
 */
async function generateSpriteSheet(characterId) {
  const char = CHARACTERS[characterId];

  console.log(`Generating sprites for ${characterId}...`);

  // Load the profile photo
  let photo;
  try {
    photo = await loadImage(char.photoPath);
  } catch (e) {
    console.log(`Could not load photo for ${characterId}, using placeholder`);
    photo = null;
  }

  // Calculate total frames needed
  const totalFrames = ANIMATIONS.reduce((sum, anim) => sum + anim.frames, 0);
  const rows = Math.ceil(totalFrames / SHEET_COLS);

  // Create sprite sheet canvas
  const sheetWidth = SHEET_COLS * FRAME_WIDTH;
  const sheetHeight = rows * FRAME_HEIGHT;
  const canvas = createCanvas(sheetWidth, sheetHeight);
  const ctx = canvas.getContext('2d');

  // Fill with transparency
  ctx.clearRect(0, 0, sheetWidth, sheetHeight);

  let frameIndex = 0;

  for (const anim of ANIMATIONS) {
    for (let f = 0; f < anim.frames; f++) {
      const col = frameIndex % SHEET_COLS;
      const row = Math.floor(frameIndex / SHEET_COLS);
      const x = col * FRAME_WIDTH;
      const y = row * FRAME_HEIGHT;

      // Draw body and get head position
      const headPos = drawBody(ctx, x, y, char, anim.name, f);

      // Draw pixelated head from photo
      if (photo) {
        // Create a circular clip for the head
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          headPos.headX + headPos.headSize/2,
          headPos.headY + headPos.headSize/2,
          headPos.headSize/2,
          0,
          Math.PI * 2
        );
        ctx.clip();

        // Draw pixelated photo as head
        pixelateImage(
          ctx,
          photo,
          headPos.headX,
          headPos.headY,
          headPos.headSize,
          headPos.headSize,
          PIXEL_SIZE
        );
        ctx.restore();

        // Add hair/outline
        ctx.strokeStyle = char.hair;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          headPos.headX + headPos.headSize/2,
          headPos.headY + headPos.headSize/2,
          headPos.headSize/2,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      } else {
        // Placeholder head
        ctx.fillStyle = char.skin;
        ctx.beginPath();
        ctx.arc(
          headPos.headX + headPos.headSize/2,
          headPos.headY + headPos.headSize/2,
          headPos.headSize/2,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(headPos.headX + 6, headPos.headY + 10, 4, 4);
        ctx.fillRect(headPos.headX + 14, headPos.headY + 10, 4, 4);
      }

      frameIndex++;
    }
  }

  // Save sprite sheet
  const outputDir = path.dirname(char.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(char.outputPath, buffer);

  console.log(`Saved ${char.outputPath}`);

  // Also save animation metadata
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

/**
 * Main function
 */
async function main() {
  console.log('=== HireSpace Fighters Sprite Generator ===\n');

  for (const characterId of Object.keys(CHARACTERS)) {
    await generateSpriteSheet(characterId);
  }

  console.log('\nDone! Sprite sheets generated.');
}

main().catch(console.error);

/**
 * HireSpace Fighters - Sprite Generator v5
 * Uses full character sprites and creates animations through transforms
 */

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const FRAME_WIDTH = 128;
const FRAME_HEIGHT = 128;
const SHEET_COLS = 8;

const CHARACTERS = {
  will: {
    photoPath: './public/assets/sprites/will/photo.jpg',
    outputPath: './public/assets/sprites/will/spritesheet.png',
  },
  ed: {
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
 * Draw sprite with transform for animation
 */
function drawSprite(ctx, sprite, frameX, frameY, pose, frame, totalFrames) {
  const cx = frameX + FRAME_WIDTH / 2;
  const cy = frameY + FRAME_HEIGHT / 2;

  // Save context state
  ctx.save();

  // Move to frame center
  ctx.translate(cx, cy);

  // Animation transforms based on pose
  let offsetX = 0;
  let offsetY = 0;
  let scaleX = 1;
  let scaleY = 1;
  let rotation = 0;
  let alpha = 1;

  const t = frame / Math.max(1, totalFrames - 1); // Normalized time 0-1

  switch (pose) {
    case 'idle':
      // Gentle breathing bob
      offsetY = Math.sin(frame * Math.PI / 2) * 3;
      scaleX = 1 + Math.sin(frame * Math.PI / 2) * 0.02;
      break;

    case 'walk':
      // Walking bob and lean
      offsetY = Math.abs(Math.sin(frame * Math.PI / 3)) * 4;
      offsetX = Math.sin(frame * Math.PI / 3) * 2;
      rotation = Math.sin(frame * Math.PI / 3) * 0.03;
      break;

    case 'jump':
      // Rising up
      offsetY = -frame * 8;
      scaleY = 1 + frame * 0.02;
      break;

    case 'crouch':
      // Ducking down
      offsetY = 15;
      scaleY = 0.85;
      break;

    case 'high_punch':
      // Punch forward - already in attack pose so emphasize it
      offsetX = t < 0.6 ? t * 15 : 9;
      scaleX = 1 + (t < 0.6 ? t * 0.1 : 0.06);
      break;

    case 'low_punch':
      // Low punch with crouch
      offsetX = t < 0.5 ? t * 12 : 6;
      offsetY = 8;
      scaleY = 0.95;
      break;

    case 'high_kick':
      // High kick - lean back then extend
      offsetX = t < 0.5 ? t * 12 : 6;
      rotation = t < 0.5 ? -t * 0.1 : -0.05;
      break;

    case 'low_kick':
      // Low sweep
      offsetX = t < 0.5 ? t * 15 : 7.5;
      offsetY = 12;
      scaleY = 0.9;
      rotation = t < 0.5 ? t * 0.08 : 0.04;
      break;

    case 'hit':
      // Recoil back
      offsetX = -frame * 8;
      rotation = frame * 0.05;
      alpha = frame % 2 === 0 ? 0.7 : 1;
      break;

    case 'block':
      // Defensive crouch
      offsetY = 8;
      scaleX = 0.95;
      scaleY = 0.92;
      break;

    case 'victory':
      // Bounce celebration
      offsetY = -Math.abs(Math.sin(frame * Math.PI / 2)) * 10;
      scaleX = 1 + Math.sin(frame * Math.PI / 2) * 0.05;
      scaleY = 1 + Math.sin(frame * Math.PI / 2) * 0.05;
      break;

    case 'defeat':
      // Fall down
      offsetY = frame * 12;
      rotation = frame * 0.15;
      alpha = 1 - frame * 0.15;
      break;
  }

  // Apply transforms
  ctx.translate(offsetX, offsetY);
  ctx.rotate(rotation);
  ctx.scale(scaleX, scaleY);
  ctx.globalAlpha = alpha;

  // Draw the sprite centered
  const spriteSize = Math.min(FRAME_WIDTH, FRAME_HEIGHT) - 8;
  ctx.drawImage(
    sprite,
    -spriteSize / 2,
    -spriteSize / 2,
    spriteSize,
    spriteSize
  );

  // Restore context state
  ctx.restore();
}

/**
 * Generate sprite sheet from full character image
 */
async function generateSpriteSheet(charId) {
  const char = CHARACTERS[charId];
  console.log(`Generating ${charId} sprites...`);

  let sprite = null;
  try {
    sprite = await loadImage(char.photoPath);
    console.log(`  Loaded sprite: ${char.photoPath} (${sprite.width}x${sprite.height})`);
  } catch (e) {
    console.log(`  ERROR: Could not load sprite: ${e.message}`);
    return;
  }

  const totalFrames = ANIMATIONS.reduce((sum, a) => sum + a.frames, 0);
  const rows = Math.ceil(totalFrames / SHEET_COLS);

  const canvas = createCanvas(SHEET_COLS * FRAME_WIDTH, rows * FRAME_HEIGHT);
  const ctx = canvas.getContext('2d');

  // Transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let frameIdx = 0;
  for (const anim of ANIMATIONS) {
    for (let f = 0; f < anim.frames; f++) {
      const col = frameIdx % SHEET_COLS;
      const row = Math.floor(frameIdx / SHEET_COLS);
      const x = col * FRAME_WIDTH;
      const y = row * FRAME_HEIGHT;

      drawSprite(ctx, sprite, x, y, anim.name, f, anim.frames);
      frameIdx++;
    }
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(char.outputPath, buffer);
  console.log(`  Saved: ${char.outputPath}`);

  // Update metadata with new frame size
  const meta = {
    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
    animations: {}
  };
  let start = 0;
  for (const anim of ANIMATIONS) {
    meta.animations[anim.name] = {
      start,
      end: start + anim.frames - 1,
      frames: anim.frames
    };
    start += anim.frames;
  }
  fs.writeFileSync(char.outputPath.replace('.png', '.json'), JSON.stringify(meta, null, 2));
  console.log(`  Saved metadata: ${char.outputPath.replace('.png', '.json')}`);
}

async function main() {
  console.log('\n=== HireSpace Fighters Sprite Generator v5 ===\n');
  console.log('Using full character sprites with transform-based animations\n');

  for (const id of Object.keys(CHARACTERS)) {
    await generateSpriteSheet(id);
  }
  console.log('\nDone!\n');
}

main().catch(console.error);

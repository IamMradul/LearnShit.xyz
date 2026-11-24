import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const crcData = Buffer.concat([typeBuf, data]);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([len, typeBuf, data, crcVal]);
}

function encodeRGBAtoPNG(width, height, getPixelRGBA) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // color type 6: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data with 0 filter byte before each row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// 1. Generate og-image.png (1200x630)
// Dark background (#0a0b0c) with warm accent gradient, industrial tech pattern
const ogImagePNG = encodeRGBAtoPNG(1200, 630, (x, y, w, h) => {
  // Base dark background (#0a0b0d)
  let r = 10;
  let g = 11;
  let b = 13;

  // Diagonal gradient towards top-right accent glow
  const distFromCorner = Math.hypot(x - 900, y - 200);
  if (distFromCorner < 400) {
    const factor = (1 - distFromCorner / 400) * 0.45;
    r = Math.min(255, Math.floor(r + 214 * factor));
    g = Math.min(255, Math.floor(g + 82 * factor));
    b = Math.min(255, Math.floor(b + 58 * factor));
  }

  // Border frame (1px accent border inset by 24px)
  if (
    (x >= 24 && x <= 25 && y >= 24 && y <= h - 24) ||
    (x >= w - 25 && x <= w - 24 && y >= 24 && y <= h - 24) ||
    (y >= 24 && y <= 25 && x >= 24 && x <= w - 24) ||
    (y >= h - 25 && y <= h - 24 && x >= 24 && x <= w - 24)
  ) {
    r = 214;
    g = 82;
    b = 58;
  }

  // Accent horizontal divider line
  if (y >= 420 && y <= 422 && x >= 80 && x <= 1120) {
    r = 214;
    g = 82;
    b = 58;
  }

  return [r, g, b, 255];
});

// 2. Generate apple-touch-icon.png (180x180)
// Dark rounded-style app icon with LearnShit accent mark
const appleIconPNG = encodeRGBAtoPNG(180, 180, (x, y, w, h) => {
  // Dark icon base (#101216)
  let r = 16;
  let g = 18;
  let b = 22;

  // Center circle highlight
  const centerDist = Math.hypot(x - 90, y - 90);
  if (centerDist >= 55 && centerDist <= 65) {
    // Accent ring
    r = 214;
    g = 82;
    b = 58;
  } else if (centerDist < 20) {
    // Inner dot
    r = 214;
    g = 82;
    b = 58;
  }

  return [r, g, b, 255];
});

const publicDir = path.resolve('public');
fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogImagePNG);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIconPNG);

console.log('Successfully generated public/og-image.png (1200x630) and public/apple-touch-icon.png (180x180)');

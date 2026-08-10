/**
 * Reads pixel dimensions out of an image buffer by parsing its header.
 *
 * Written by hand rather than pulling in a dependency: the portal only accepts a handful of
 * formats for event banners, and each one stores width/height at a fixed offset. Returns
 * `{ width: null, height: null }` for anything unrecognized or truncated, which the caller
 * stores as-is — an unknown size is not an upload failure.
 */

const readPng = (buf) => {
  // 8-byte signature, then the IHDR chunk whose width/height are big-endian u32 at 16 and 20.
  if (buf.length < 24) return null;
  if (buf.toString('ascii', 12, 16) !== 'IHDR') return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
};

const readGif = (buf) => {
  // Logical screen width/height are little-endian u16 immediately after the 6-byte header.
  if (buf.length < 10) return null;
  return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
};

const readJpeg = (buf) => {
  // Walk the marker segments until a Start-Of-Frame carries the dimensions.
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) return null;
    const marker = buf[offset + 1];

    // SOF0..SOF15, excluding DHT (c4), JPGA (c8) and DAC (cc), which are not frame headers.
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf
      && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame) {
      return { width: buf.readUInt16BE(offset + 7), height: buf.readUInt16BE(offset + 5) };
    }

    const segmentLength = buf.readUInt16BE(offset + 2);
    if (segmentLength <= 0) return null;
    offset += 2 + segmentLength;
  }
  return null;
};

const readWebp = (buf) => {
  if (buf.length < 30) return null;
  const format = buf.toString('ascii', 12, 16);

  // Lossy: 'VP8 ' — dimensions are 14 bytes into the VP8 bitstream, 14 bits each.
  if (format === 'VP8 ') {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }

  // Lossless: 'VP8L' — 14-bit width then 14-bit height, packed across 4 bytes after the marker.
  if (format === 'VP8L') {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }

  // Extended: 'VP8X' — 24-bit little-endian width-1 and height-1 at offsets 24 and 27.
  if (format === 'VP8X') {
    const width = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
    const height = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
    return { width, height };
  }

  return null;
};

const getImageDimensions = (buffer) => {
  const empty = { width: null, height: null };
  if (!Buffer.isBuffer(buffer) || buffer.length < 10) return empty;

  try {
    let result = null;
    if (buffer.toString('hex', 0, 8) === '89504e470d0a1a0a') result = readPng(buffer);
    else if (buffer.toString('ascii', 0, 3) === 'GIF') result = readGif(buffer);
    else if (buffer[0] === 0xff && buffer[1] === 0xd8) result = readJpeg(buffer);
    else if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      result = readWebp(buffer);
    }

    if (!result || !result.width || !result.height) return empty;
    return result;
  } catch (err) {
    // A malformed header must not fail the upload.
    return empty;
  }
};

module.exports = { getImageDimensions };

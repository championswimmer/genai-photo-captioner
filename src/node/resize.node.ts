import { promises as fs } from 'fs';
import sharp from 'sharp';

export async function getResizedBase64(file: string, size: number): Promise<string> {
  const origBuffer = await fs.readFile(file);
  const buffer = await sharp(origBuffer)
    .resize(size, size, { fit: 'inside' })
    .toBuffer();
  return buffer.toString('base64');
}

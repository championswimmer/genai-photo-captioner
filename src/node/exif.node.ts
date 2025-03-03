import { promises as fs } from 'fs';
import exifReader, { Exif } from 'exif-reader';

export async function getPhotoExif(filePath: string): Promise<Exif | null> {
  try {
    const buffer = await fs.readFile(filePath);
    const exifStart = buffer.indexOf(Buffer.from([0xFF, 0xE1]));
    if (exifStart === -1) return null;
    const exifBuffer = buffer.subarray(exifStart + 4);
    const exifData = exifReader(exifBuffer);
    return exifData;
  } catch (error) {
    console.error('Error reading EXIF data:', error);
    return null;
  }
}

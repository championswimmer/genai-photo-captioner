/**
 * Browser-compatible EXIF data reader
 */
import exifReader, { Exif } from 'exif-reader';

export async function getPhotoExif(file: File): Promise<Exif | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Look for the EXIF marker (0xFF, 0xE1)
    const exifMarker = [0xFF, 0xE1];
    let exifStart = -1;

    for (let i = 0; i < buffer.length - 1; i++) {
      if (buffer[i] === exifMarker[0] && buffer[i + 1] === exifMarker[1]) {
        exifStart = i;
        break;
      }
    }

    if (exifStart === -1) return null;

    // Skip the marker (2 bytes) and length (2 bytes)
    const exifBuffer = buffer.subarray(exifStart + 4);
    const exifData = exifReader(Buffer.from(exifBuffer)); 
    return exifData;
  } catch (error) {
    console.error('Error reading EXIF data:', error);
    return null;
  }
}
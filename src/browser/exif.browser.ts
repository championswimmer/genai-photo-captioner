/**
 * Browser-compatible EXIF data reader
 */
import ExifReader, { Tags as Exif } from 'exifreader';

export async function getPhotoExif(file: File): Promise<Exif | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const exifTags = await ExifReader.load(arrayBuffer);
    
    return exifTags;
  } catch (error) {
    console.error('Error reading EXIF data:', error);
    return null;
  }
}
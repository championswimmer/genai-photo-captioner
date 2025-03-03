import * as fs from 'fs/promises';
import { getResizedBase64 } from './resize.node';
import { getPhotoExif } from './exif.node';
import { Photo } from 'types';

export async function getPhotosFromFolder(folderPath: string, size: number = 300): Promise<Photo[]> {

  const photos: Photo[] = []

  const stats = await fs.stat(folderPath)
  if (stats && stats.isDirectory()) {
    const files = await fs.readdir(folderPath)
    for (const file of files) {
      if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
        const filePath = `${folderPath}/${file}`;

        const [base64, exif] = await Promise.all([
          getResizedBase64(filePath, size),
          getPhotoExif(filePath)
        ])

        photos.push({
          base64,
          exif: {
            camera: {
              make: exif?.Image?.Make,
              model: exif?.Image?.Model
            },
            gps: {
              latitude: exif?.GPSInfo?.GPSDestLatitudeRef,
              longitude: exif?.GPSInfo?.GPSDestLongitudeRef
            },
            image: {
              iso: exif?.Photo?.ISOSpeed?.toString(),
              aperture: exif?.Photo?.FNumber,
              exposure: exif?.Photo?.ExposureTime,
              focalLength: exif?.Photo?.FocalLength
            }
          }
        });
      }
    }
  }

  return photos
}
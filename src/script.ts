import { getResizedBase64 } from './browser/resize.browser';
import { getPhotoExif } from './browser/exif.browser';
import { generatePhotoAttachments, Models, Providers, SystemMessage } from './llm';
import { Photo } from './types';

document.getElementById('imageInput')?.addEventListener('change', function (event) {
  const container = document.getElementById('imagePreviewContainer')!
  container.innerHTML = '' // Clear previous images

  const files = (event!.target as HTMLInputElement).files!
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.type.match('image.*')) {
      const col = document.createElement('div')
      col.className = 'col-xl-2 col-lg-3 col-md-4 col-sm-5 col-6 mb-3'

      const img = document.createElement('img')
      img.style.width = '200px'
      img.style.height = '200px'
      img.style.objectFit = 'cover'
      img.style.borderRadius = '10px'
      img.className = 'img-fluid'

      const reader = new FileReader()
      reader.onload = function (e) {
        const result = e.target?.result
        if (typeof result === 'string') {
          img.src = result
        }
      }
      reader.readAsDataURL(file)

      col.appendChild(img)
      container.appendChild(col)
    }
  }
});

document.getElementById('generateCaptionButton')?.addEventListener('click', async function () {
  const files = (document.getElementById('imageInput') as HTMLInputElement).files!;
  const photos: Photo[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const [base64, exif] = await Promise.all([
      getResizedBase64(file, 300),
      getPhotoExif(file)
    ]);

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
          iso: exif?.Photo?.ISOSpeed,
          aperture: exif?.Photo?.FNumber,
          exposure: exif?.Photo?.ExposureTime,
          focalLength: exif?.Photo?.FocalLength
        }
      }
    });
  }

  const photoAttachments = generatePhotoAttachments(photos);

  const llm = Providers.OpenAI;
  const response = await llm.chat.completions.create({
    model: Models.OpenAI.GPT4o,
    max_tokens: 500,
    temperature: 0.8,
    messages: [
      SystemMessage,
      photoAttachments
    ]
  });

  const caption = response.choices[0]?.message?.content || '';
  const captionDisplay = document.getElementById('captionDisplay');
  if (captionDisplay) {
    captionDisplay.innerHTML = `<div>${caption}</div>`;
  }
});

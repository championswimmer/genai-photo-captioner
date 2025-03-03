import { getResizedBase64 } from './browser/resize.browser';
import { getPhotoExif } from './browser/exif.browser';
import { generatePhotoAttachments, Models, Providers, SystemMessage } from './llm';
import { Photo } from './types';
import { RationalTag } from 'exifreader';

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
  console.log('Generating caption...');
  const files = (document.getElementById('imageInput') as HTMLInputElement).files!;
  const photos: Photo[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const [base64, exif] = await Promise.all([
      getResizedBase64(file, 300),
      getPhotoExif(file)
    ]);

    function exifRationalValueToFloat(tag: RationalTag): number | undefined {
      if (!tag || !tag.value || !Array.isArray(tag.value) || tag.value.length !== 2) return
      return tag.value[0] / tag.value[1];
    }

    photos.push({
      base64,
      exif: {
        camera: {
          make: exif?.Make?.description,
          model: exif?.Model?.description
        },
        gps: {
          latitude: exif?.GPSDestLatitudeRef?.description,
          longitude: exif?.GPSDestLongitudeRef?.description
        },
        image: {
          iso: exif?.ISOSpeedRatings?.description,
          aperture: exifRationalValueToFloat(exif?.ApertureValue as RationalTag),
          exposure: exifRationalValueToFloat(exif?.ExposureTime as RationalTag),
          focalLength: exifRationalValueToFloat(exif?.FocalLength as RationalTag)
        }
      }
    });
  }


  const photoAttachments = generatePhotoAttachments(photos);

  console.log('Generating caption...');
  console.log(photoAttachments)

  const llm = Providers.xAI;
  const stream = await llm.chat.completions.create({
    model: Models.xAI.Grok2Vision,
    max_tokens: 500,
    temperature: 0.8,
    messages: [
      SystemMessage,
      photoAttachments
    ],
    stream: true
  });

  const captionDisplay = document.getElementById('captionDisplay');
  if (captionDisplay) {
    captionDisplay.innerText = ''; // Clear previous content

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        captionDisplay.innerText += content;
      }
    }
  }
});

// ================ API KEY HANDLING ================

// Define API key types
type ApiKeyType = 'OPENAI_API_KEY' | 'ANTHROPIC_API_KEY' | 'XAI_API_KEY';

// Setup the input elements and their corresponding localStorage keys
const apiKeyMappings: { elementId: string; storageKey: ApiKeyType }[] = [
  { elementId: 'openai-api-key', storageKey: 'OPENAI_API_KEY' },
  { elementId: 'anthropic-api-key', storageKey: 'ANTHROPIC_API_KEY' },
  { elementId: 'xai-api-key', storageKey: 'XAI_API_KEY' }
];

// Function to save API key to localStorage
function saveApiKey(key: ApiKeyType, value: string): void {
  globalThis.process.env[key] = value;
  localStorage.setItem(key, value);
  console.log(`${key} saved to localStorage`);
}

// Function to retrieve API key from localStorage
function getApiKey(key: ApiKeyType): string | null {
  return localStorage.getItem(key);
}

// Initialize the input fields with values from localStorage
function initializeApiKeyInputs(): void {
  apiKeyMappings.forEach(mapping => {
    const inputElement = document.getElementById(mapping.elementId) as HTMLInputElement;
    if (inputElement) {
      // Set the value from localStorage if available
      const savedValue = getApiKey(mapping.storageKey);
      if (savedValue) {
        globalThis.process.env[mapping.storageKey] = savedValue;
        inputElement.value = savedValue;
      }

      // Add input/paste event listener
      inputElement.addEventListener('input', () => {
        saveApiKey(mapping.storageKey, inputElement.value);
      });
    } else {
      console.error(`Element with ID ${mapping.elementId} not found`);
    }
  });
}

// Initialize when the DOM content is loaded
document.addEventListener('DOMContentLoaded', initializeApiKeyInputs);
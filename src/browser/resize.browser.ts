// import pica from 'pica';

export async function getResizedBase64(file: File, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const img = new Image();
        if (e.target) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('FileReader event target is null'));
          return;
        }

        await new Promise((imgResolve) => {
          img.onload = () => imgResolve(null);
        });

        const canvas = document.createElement('canvas');

        // Calculate dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > size) {
            height = Math.floor(height * (size / width));
            width = size;
          }
        } else {
          if (height > size) {
            width = Math.floor(width * (size / height));
            height = size;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const picaInstance = window.pica();
        const resizeResult = await picaInstance.resize(img, canvas, {
          unsharpAmount: 80,
          unsharpRadius: 0.6,
          unsharpThreshold: 2
        });

        const dataURL = resizeResult.toDataURL('image/jpeg');
        const base64 = dataURL.split(',')[1];
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
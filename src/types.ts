export interface ExifData {
  camera: {
    make?: string
    model?: string
  }
  gps: {
    latitude?: string
    longitude?: string
  }
  image: {
    iso?: number
    aperture?: number
    exposure?: number
    focalLength?: number
  }
}

export interface Photo {
  base64: string
  exif: ExifData
}


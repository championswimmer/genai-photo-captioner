

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
})
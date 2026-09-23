import { useEffect, useState } from 'react'
import PhotoPicker from './components/PhotoPicker.jsx'
import PhotoGallery from './components/PhotoGallery.jsx'
import ConfigPanel from './components/ConfigPanel.jsx'
import AlbumPreview from './components/AlbumPreview.jsx'
import { TEMPLATES } from './templates.js'
import { loadPhotos, savePhotos } from './photoStore.js'

const CONFIG_STORAGE_KEY = 'photoalbum:config'

function loadImageDimensions(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => resolve({ width: 0, height: 0 })
    img.src = url
  })
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const initialConfig = loadConfig()

export default function App() {
  const [photos, setPhotos] = useState([])
  const [isPhotosLoaded, setIsPhotosLoaded] = useState(false)
  const [template, setTemplate] = useState(initialConfig.template ?? TEMPLATES[0].id)
  const [photosPerPage, setPhotosPerPage] = useState(initialConfig.photosPerPage ?? 4)
  const [showBorders, setShowBorders] = useState(initialConfig.showBorders ?? true)
  const [error, setError] = useState('')

  // Carga inicial desde IndexedDB. isPhotosLoaded evita que el efecto de
  // guardado (más abajo) sobrescriba lo persistido con un array vacío
  // mientras esta carga asíncrona todavía está en curso.
  useEffect(() => {
    loadPhotos().then(async (records) => {
      const loaded = await Promise.all(
        records.map(async (record) => {
          const url = URL.createObjectURL(record.file)
          const dims =
            record.width && record.height
              ? { width: record.width, height: record.height }
              : await loadImageDimensions(url)
          return { id: record.id, name: record.name, file: record.file, url, ...dims }
        }),
      )
      setPhotos(loaded)
      setIsPhotosLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!isPhotosLoaded) return
    savePhotos(photos)
  }, [photos, isPhotosLoaded])

  useEffect(() => {
    localStorage.setItem(
      CONFIG_STORAGE_KEY,
      JSON.stringify({ template, photosPerPage, showBorders }),
    )
  }, [template, photosPerPage, showBorders])

  function addFiles(files) {
    const validImages = files.filter((file) => file.type.startsWith('image/'))
    if (validImages.length === 0) {
      setError('Selecciona al menos un archivo de imagen válido (jpg, png...).')
      return
    }
    setError('')
    const newPhotos = validImages.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      url: URL.createObjectURL(file),
      file,
      name: file.name,
      width: 0,
      height: 0,
    }))
    setPhotos((prev) => [...prev, ...newPhotos])

    newPhotos.forEach((photo) => {
      loadImageDimensions(photo.url).then(({ width, height }) => {
        setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, width, height } : p)))
      })
    })
  }

  function removePhoto(id) {
    setPhotos((prev) => {
      const target = prev.find((photo) => photo.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((photo) => photo.id !== id)
    })
  }

  function reorderPhotos(fromIndex, toIndex) {
    setPhotos((prev) => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  function handlePrint() {
    if (photos.length === 0) {
      setError('Añade al menos una foto antes de imprimir o exportar.')
      return
    }
    setError('')
    window.print()
  }

  return (
    <div className="app">
      <header className="app-header no-print">
        <span className="app-kicker">Photoalbum</span>
        <h1>Convierte tus fotos en un álbum listo para imprimir</h1>
        <p>Selecciona fotos de tu ordenador, elige una plantilla y expórtalas o imprímelas.</p>
      </header>

      <div className="app-layout">
        <main className="app-controls no-print">
          {error && <div className="app-error" role="alert">{error}</div>}

          <PhotoPicker onFilesSelected={addFiles} />
          <PhotoGallery photos={photos} onRemove={removePhoto} onReorder={reorderPhotos} />
          <ConfigPanel
            template={template}
            onTemplateChange={setTemplate}
            photosPerPage={photosPerPage}
            onPhotosPerPageChange={setPhotosPerPage}
            showBorders={showBorders}
            onShowBordersChange={setShowBorders}
          />

          <button className="print-button" onClick={handlePrint}>
            Imprimir / Exportar a PDF
          </button>
        </main>

        <div className="app-preview-panel">
          {photos.length > 0 ? (
            <AlbumPreview
              photos={photos}
              template={template}
              photosPerPage={photosPerPage}
              showBorders={showBorders}
            />
          ) : (
            <div className="preview-empty no-print">
              <p>Aquí verás la vista previa de tu álbum en cuanto añadas fotos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

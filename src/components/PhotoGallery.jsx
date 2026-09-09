export default function PhotoGallery({ photos, onRemove, onReorder }) {
  if (photos.length === 0) return null

  function handleDragStart(event, index) {
    event.dataTransfer.setData('text/plain', String(index))
  }

  function handleDrop(event, toIndex) {
    event.preventDefault()
    const fromIndex = Number(event.dataTransfer.getData('text/plain'))
    if (!Number.isNaN(fromIndex) && fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex)
    }
  }

  return (
    <section className="photo-gallery">
      <h2>Fotos seleccionadas ({photos.length})</h2>
      <p className="hint">Arrastra una miniatura para reordenarla.</p>
      <ul className="photo-gallery-grid">
        {photos.map((photo, index) => (
          <li
            key={photo.id}
            className="photo-gallery-item"
            draggable
            onDragStart={(event) => handleDragStart(event, index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, index)}
          >
            <img src={photo.url} alt={photo.name} />
            <button type="button" onClick={() => onRemove(photo.id)} aria-label={`Quitar ${photo.name}`}>
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

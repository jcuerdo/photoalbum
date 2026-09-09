function paginate(photos, pageSize) {
  const pages = []
  for (let i = 0; i < photos.length; i += pageSize) {
    pages.push(photos.slice(i, i + pageSize))
  }
  return pages
}

export default function AlbumPreview({ photos, template, photosPerPage, showBorders }) {
  if (photos.length === 0) return null

  const pages = paginate(photos, photosPerPage)

  return (
    <section className="album-preview">
      {pages.map((pagePhotos, pageIndex) => (
        <div
          key={pageIndex}
          className={`album-page template-${template} ${showBorders ? 'with-borders' : 'without-borders'}`}
        >
          <div className="album-page-grid" data-count={pagePhotos.length}>
            {pagePhotos.map((photo) => (
              <div className="album-photo" key={photo.id}>
                <div className="album-photo-inner">
                  <img src={photo.url} alt={photo.name} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

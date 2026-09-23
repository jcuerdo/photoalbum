const MM_TO_PX = 96 / 25.4
const PAGE_WIDTH_MM = 210
const PAGE_HEIGHT_MM = 297
const PAGE_PADDING_PX = 24
const GAP_PX = 10
const MIN_SCALE = 0.15

// Debe reflejar el "chrome" (bordes/relleno) que cada plantilla añade
// alrededor de la foto en templates.css, para que el cálculo de encaje
// en una hoja A4 sea preciso y no solo aproximado por la imagen.
const TEMPLATE_CHROME = {
  white: { vertical: 8, horizontal: 8 },
  polaroid: { vertical: 44, horizontal: 20 },
  vintage: { vertical: 12, horizontal: 12 },
}

function paginate(photos, pageSize) {
  const pages = []
  for (let i = 0; i < photos.length; i += pageSize) {
    pages.push(photos.slice(i, i + pageSize))
  }
  return pages
}

function getTemplateChrome(template, showBorders) {
  if (template === 'white') {
    return showBorders ? TEMPLATE_CHROME.white : { vertical: 0, horizontal: 0 }
  }
  return TEMPLATE_CHROME[template] ?? TEMPLATE_CHROME.white
}

function getPhotoAspect(photo) {
  return photo.width && photo.height ? photo.width / photo.height : 1
}

// Agrupa las fotos de una página en filas al estilo "justified gallery"
// (Google Fotos/Flickr): cada fila reúne fotos hasta que, a una altura de
// fila estimada, se llenaría el ancho de la página. El encaje exacto (para
// que la fila resultante ocupe el ancho completo) se recalcula después en
// computePageLayout, así que esta estimación solo decide cuántas fotos
// entran en cada fila, no su tamaño final.
function groupIntoRows(pagePhotos, containerWidthPx, containerHeightPx) {
  const estimatedRowHeight = Math.sqrt((containerWidthPx * containerHeightPx) / pagePhotos.length)

  const rows = []
  let currentRow = []
  let aspectSum = 0

  pagePhotos.forEach((photo) => {
    const aspect = getPhotoAspect(photo)
    const projectedWidth = (aspectSum + aspect) * estimatedRowHeight

    if (currentRow.length > 0 && projectedWidth > containerWidthPx) {
      rows.push(currentRow)
      currentRow = []
      aspectSum = 0
    }

    currentRow.push({ photo, aspect })
    aspectSum += aspect
  })

  if (currentRow.length > 0) rows.push(currentRow)
  return rows
}

function computePageLayout(pagePhotos, template, showBorders) {
  const chrome = getTemplateChrome(template, showBorders)
  const gap = showBorders ? GAP_PX : 0

  const containerWidthPx = PAGE_WIDTH_MM * MM_TO_PX - 2 * PAGE_PADDING_PX
  const containerHeightPx = PAGE_HEIGHT_MM * MM_TO_PX - 2 * PAGE_PADDING_PX

  const rows = groupIntoRows(pagePhotos, containerWidthPx, containerHeightPx)

  const rowData = rows.map((row) => {
    const aspectSum = row.reduce((sum, item) => sum + item.aspect, 0)
    const availableWidth = containerWidthPx - row.length * chrome.horizontal - gap * (row.length - 1)
    const rowHeightNatural = availableWidth / aspectSum
    return { row, rowHeightNatural }
  })

  const totalNaturalHeight = rowData.reduce((sum, r) => sum + r.rowHeightNatural, 0)
  const gapsTotal = gap * (rows.length - 1)
  const chromeTotal = rows.length * chrome.vertical

  const numerator = containerHeightPx - chromeTotal - gapsTotal
  const scale =
    totalNaturalHeight > 0 ? Math.min(1, Math.max(MIN_SCALE, numerator / totalNaturalHeight)) : 1

  return rowData.map(({ row, rowHeightNatural }) =>
    row.map(({ photo, aspect }) => {
      const widthPx = scale * rowHeightNatural * aspect + chrome.horizontal
      return { photo, widthPercent: (widthPx / containerWidthPx) * 100 }
    }),
  )
}

export default function AlbumPreview({ photos, template, photosPerPage, showBorders }) {
  if (photos.length === 0) return null

  const pages = paginate(photos, photosPerPage)

  return (
    <section className="album-preview">
      {pages.map((pagePhotos, pageIndex) => {
        const rows = computePageLayout(pagePhotos, template, showBorders)

        return (
          <div
            key={pageIndex}
            className={`album-page template-${template} ${showBorders ? 'with-borders' : 'without-borders'}`}
          >
            <div className="album-page-grid" data-count={pagePhotos.length}>
              {rows.map((row, rowIndex) => (
                <div className="album-page-row" key={rowIndex}>
                  {row.map(({ photo, widthPercent }) => (
                    <div className="album-photo" key={photo.id} style={{ width: `${widthPercent}%` }}>
                      <div className="album-photo-inner">
                        <img src={photo.url} alt={photo.name} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <span className="album-page-number no-print">
              Página {pageIndex + 1} de {pages.length}
            </span>
          </div>
        )
      })}
    </section>
  )
}

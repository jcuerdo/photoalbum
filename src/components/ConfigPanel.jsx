import { TEMPLATES } from '../templates.js'

export default function ConfigPanel({
  template,
  onTemplateChange,
  photosPerPage,
  onPhotosPerPageChange,
  showBorders,
  onShowBordersChange,
  showMargins,
  onShowMarginsChange,
}) {
  return (
    <section className="config-panel">
      <h2>Configuración</h2>

      <fieldset>
        <legend>Plantilla</legend>
        <div className="template-options">
          {TEMPLATES.map((option) => (
            <label key={option.id} className={`template-option ${template === option.id ? 'is-selected' : ''}`}>
              <input
                type="radio"
                name="template"
                value={option.id}
                checked={template === option.id}
                onChange={() => onTemplateChange(option.id)}
              />
              <span className={`template-swatch template-${option.id}`} />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="config-field">
        Fotos por página: {photosPerPage}
        <input
          type="range"
          min="1"
          max="10"
          value={photosPerPage}
          onChange={(event) => onPhotosPerPageChange(Number(event.target.value))}
        />
      </label>

      <label className="config-field config-checkbox">
        <input
          type="checkbox"
          checked={showBorders}
          onChange={(event) => onShowBordersChange(event.target.checked)}
        />
        Mostrar bordes en las fotos
      </label>

      <label className="config-field config-checkbox">
        <input
          type="checkbox"
          checked={showMargins}
          onChange={(event) => onShowMarginsChange(event.target.checked)}
        />
        Mostrar márgenes entre fotos
      </label>
    </section>
  )
}

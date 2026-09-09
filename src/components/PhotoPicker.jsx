import { useRef, useState } from 'react'

export default function PhotoPicker({ onFilesSelected }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleInputChange(event) {
    onFilesSelected(Array.from(event.target.files))
    event.target.value = ''
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsDragging(false)
    onFilesSelected(Array.from(event.dataTransfer.files))
  }

  return (
    <section
      className={`photo-picker ${isDragging ? 'is-dragging' : ''}`}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <svg
        className="photo-picker-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <circle cx="8.5" cy="10" r="1.75" />
        <path d="M3 16.5l5-4.5 3.5 3 4-3.5L21 15" />
      </svg>
      <p>Arrastra fotos aquí o</p>
      <button type="button" onClick={() => inputRef.current?.click()}>
        Seleccionar fotos
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        hidden
      />
    </section>
  )
}

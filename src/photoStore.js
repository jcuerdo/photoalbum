const DB_NAME = 'photoalbum'
const DB_VERSION = 1
const STORE_NAME = 'photos'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function loadPhotos() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME)
    const request = store.getAll()
    request.onsuccess = () => {
      resolve(request.result.sort((a, b) => a.order - b.order))
    }
    request.onerror = () => reject(request.error)
  })
}

export async function savePhotos(photos) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.clear()
    photos.forEach((photo, index) => {
      store.put({ id: photo.id, name: photo.name, file: photo.file, order: index })
    })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

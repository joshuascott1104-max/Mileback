const DB_NAME = 'mileback_auto'
const STORE = 'snapshots'
const MAX_DAYS = 7

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore(STORE, { keyPath: 'day' })
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(req.error)
  })
}

// One snapshot per calendar day — overwrites same-day entry
export async function saveAutoBackup(data) {
  try {
    const db = await openDB()
    const day = new Date().toISOString().split('T')[0]
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    store.put({ day, savedAt: new Date().toISOString(), ...data })

    // Prune: keep only last MAX_DAYS days
    const keys = await new Promise(res => { const r = store.getAllKeys(); r.onsuccess = () => res(r.result) })
    keys.sort()
    keys.slice(0, Math.max(0, keys.length - MAX_DAYS)).forEach(k => store.delete(k))
  } catch {
    // Silent — auto backup is best-effort
  }
}

export async function getLatestAutoBackup() {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const all = await new Promise(res => { const r = store.getAll(); r.onsuccess = () => res(r.result) })
    if (!all.length) return null
    all.sort((a, b) => b.day.localeCompare(a.day))
    return all[0]
  } catch {
    return null
  }
}

export async function listAutoBackups() {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE, 'readonly')
    const all = await new Promise(res => { const r = tx.objectStore(STORE).getAll(); r.onsuccess = () => res(r.result) })
    return all.sort((a, b) => b.day.localeCompare(a.day))
  } catch {
    return []
  }
}

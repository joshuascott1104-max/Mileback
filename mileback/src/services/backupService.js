import { format } from 'date-fns'

export function exportBackup({ mileageClaims, expenses, vehicles, settings, favouriteJourneys }) {
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    mileageClaims,
    expenses,
    vehicles,
    settings,
    favouriteJourneys,
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mileback-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function readBackupFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        const required = ['mileageClaims', 'expenses', 'vehicles', 'settings', 'favouriteJourneys']
        if (!required.every(k => Array.isArray(data[k]) || typeof data[k] === 'object')) {
          reject(new Error('Invalid backup file'))
          return
        }
        resolve(data)
      } catch {
        reject(new Error('Could not read backup file'))
      }
    }
    reader.onerror = () => reject(new Error('File read error'))
    reader.readAsText(file)
  })
}

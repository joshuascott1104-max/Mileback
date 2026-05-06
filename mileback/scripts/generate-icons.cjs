const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const svg = fs.readFileSync(path.join(__dirname, '../public/favicon.svg'))
const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
]

Promise.all(
  sizes.map(({ size, name }) =>
    sharp(svg)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, '../public', name))
  )
).then(() => console.log('Icons generated: icon-192.png, icon-512.png, apple-touch-icon.png'))
  .catch(err => { console.error('Icon generation failed:', err); process.exit(1) })

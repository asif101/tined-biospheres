import sharp from 'sharp'

export function makeThumbnail(imageBuffer) {
  return new Promise((resolve, reject) => {
    sharp(imageBuffer)
      .resize(100, 100)
      .toFormat('png')
      .toBuffer((err, data, info) => {
        if (err) reject(err)
        else resolve(data, info)
      })
  })
}

const Jimp = require('jimp')

const addWatermark = async (imageBuffer, { clubName, eventName, userRole }) => {
  try {
    const image = await Jimp.read(imageBuffer)
    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)

    const watermarkText = `${clubName} | ${eventName} | ${userRole}`

    const textX = image.getWidth() - 320
    const textY = image.getHeight() - 30

    // dark background strip behind text
    for (let x = Math.max(0, textX - 8); x < image.getWidth(); x++) {
      for (let y = Math.max(0, textY - 4); y < Math.min(image.getHeight(), textY + 24); y++) {
        const currentColor = image.getPixelColor(x, y)
        const rgba = Jimp.intToRGBA(currentColor)
        const darkened = Jimp.rgbaToInt(
          Math.floor(rgba.r * 0.3),
          Math.floor(rgba.g * 0.3),
          Math.floor(rgba.b * 0.3),
          rgba.a
        )
        image.setPixelColor(darkened, x, y)
      }
    }

    image.print(font, textX, textY, watermarkText)

    return await image.getBufferAsync(Jimp.MIME_JPEG)
  } catch (err) {
    console.log('Watermark error:', err.message)
    return imageBuffer
  }
}

module.exports = { addWatermark }
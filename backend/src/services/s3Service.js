const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const sharp = require('sharp')
const { v4: uuidv4 } = require('uuid')

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
})

const uploadToS3 = async (fileBuffer, mimetype, folder = 'media') => {
  const key = `${folder}/${uuidv4()}`

  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
  }))

  const cdnUrl = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${key}`
  return { key, cdnUrl }
}

const generateThumbnail = async (fileBuffer) => {
  return await sharp(fileBuffer)
    .resize(400, 400, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer()
}

const compressImage = async (fileBuffer) => {
  return await sharp(fileBuffer)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()
}

const deleteFromS3 = async (key) => {
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  }))
}

module.exports = { uploadToS3, generateThumbnail, compressImage, deleteFromS3 }
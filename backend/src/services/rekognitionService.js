const { RekognitionClient, DetectLabelsCommand, IndexFacesCommand, SearchFacesByImageCommand, CreateCollectionCommand } = require('@aws-sdk/client-rekognition')

const COLLECTION_ID = 'media-platform-faces'

// create client as a function so it always reads fresh env vars
const getClient = () => new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
})

const createFaceCollection = async () => {
  try {
    await getClient().send(new CreateCollectionCommand({ CollectionId: COLLECTION_ID }))
    console.log('Face collection created')
  } catch (err) {
    if (err.name === 'ResourceAlreadyExistsException') {
      console.log('Face collection already exists ✅')
    } else {
      console.error('Rekognition error:', err.message)
    }
  }
}

const detectLabels = async (s3Key) => {
  const command = new DetectLabelsCommand({
    Image: { S3Object: { Bucket: process.env.AWS_BUCKET_NAME, Name: s3Key } },
    MaxLabels: 10,
    MinConfidence: 75,
  })
  const response = await getClient().send(command)
  return response.Labels.map(label => ({
    label: label.Name,
    confidence: Math.round(label.Confidence)
  }))
}

const indexFace = async (s3Key, userId) => {
  const command = new IndexFacesCommand({
    CollectionId: COLLECTION_ID,
    Image: { S3Object: { Bucket: process.env.AWS_BUCKET_NAME, Name: s3Key } },
    ExternalImageId: userId,
    MaxFaces: 1,
    DetectionAttributes: []
  })
  const response = await getClient().send(command)
  if (!response.FaceRecords.length)
    throw new Error('No face detected in the selfie. Please upload a clear front-facing photo.')
  return response.FaceRecords[0].Face.FaceId
}

const searchFacesByImage = async (s3Key) => {
  const command = new SearchFacesByImageCommand({
    CollectionId: COLLECTION_ID,
    Image: { S3Object: { Bucket: process.env.AWS_BUCKET_NAME, Name: s3Key } },
    MaxFaces: 100,
    FaceMatchThreshold: 90,
  })
  const response = await getClient().send(command)
  return response.FaceMatches.map(match => ({
    faceId: match.Face.FaceId,
    externalImageId: match.Face.ExternalImageId,
    confidence: Math.round(match.Similarity)
  }))
}

module.exports = { createFaceCollection, detectLabels, indexFace, searchFacesByImage }
import * as faceapi from 'face-api.js'

const basePath = import.meta.env.MODE === 'production'
  ? '/new-ai-emotion-detector/models'
  : '/models'

export async function loadAllModels() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(basePath),
    faceapi.nets.faceLandmark68Net.loadFromUri(basePath),
    faceapi.nets.faceExpressionNet.loadFromUri(basePath),
  ])
}

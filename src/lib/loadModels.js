// src/lib/loadModels.js
import * as faceapi from 'face-api.js'

export async function loadAllModels(basePath = '/new-ai-emotion-detector/models') {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(basePath),
    faceapi.nets.faceLandmark68Net.loadFromUri(basePath),
    faceapi.nets.faceExpressionNet.loadFromUri(basePath),
  ])
}

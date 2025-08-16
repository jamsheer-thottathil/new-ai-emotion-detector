import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'
import { loadAllModels } from '../lib/loadModels.js'

export default function EmotionDetector({ onModelsLoaded }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('Loading models…')
  const [expressions, setExpressions] = useState(null)
  const [topExpression, setTopExpression] = useState(null)

  useEffect(() => {
    let stream, raf
    let isMounted = true

    async function start() {
      try {
        setStatus('Loading models…')
        await loadAllModels()
        onModelsLoaded?.()
        setStatus('Requesting camera…')
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
        if (!isMounted) return
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setStatus('Detecting…')
          detectLoop()
        }
      } catch (err) {
        console.error(err)
        setStatus('Error: ' + err.message)
      }
    }

    async function detectLoop() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      const { videoWidth, videoHeight } = video
      canvas.width = videoWidth
      canvas.height = videoHeight

      const displaySize = { width: videoWidth, height: videoHeight }
      const opts = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })

      const detections = await faceapi
        .detectAllFaces(video, opts)
        .withFaceLandmarks()
        .withFaceExpressions()

      const resized = faceapi.resizeResults(detections, displaySize)
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw detections and landmarks
      faceapi.draw.drawDetections(canvas, resized)
      faceapi.draw.drawFaceLandmarks(canvas, resized)

      if (resized.length > 0) {
        const best = resized.map((det) => {
          const top = Object.entries(det.expressions).reduce((a, b) => (a[1] > b[1] ? a : b))
          return { label: top[0], score: top[1] }
        })
        setExpressions(resized[0].expressions)
        setTopExpression(best[0])

        // Draw top label on canvas
        resized.forEach((det, i) => {
          const { x, y } = det.detection.box
          const label = `${best[i].label} ${Math.round(best[i].score * 100)}%`
          const pad = 4
          ctx.font = '16px system-ui'
          ctx.fillStyle = 'rgba(0,0,0,0.6)'
          ctx.fillRect(x, y - 22, ctx.measureText(label).width + 12, 20)
          ctx.fillStyle = '#fff'
          ctx.fillText(label, x + pad, y - 8)
        })
      } else {
        setExpressions(null)
        setTopExpression(null)
      }

      raf = requestAnimationFrame(detectLoop)
    }

    start()

    return () => {
      isMounted = false
      if (raf) cancelAnimationFrame(raf)
      if (videoRef.current) videoRef.current.pause()
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [onModelsLoaded])

  // Progress legend
  const legend = expressions
    ? Object.entries(expressions).map(([k, v]) => (
        <div className="item" key={k} style={{ marginBottom: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span>{k}</span>
            <span>{Math.round(v * 100)}%</span>
          </div>
          <div style={{ height: '6px', background: '#444', borderRadius: '3px' }}>
            <div style={{ width: `${Math.round(v * 100)}%`, height: '6px', background: '#0f9', borderRadius: '3px' }} />
          </div>
        </div>
      ))
    : <div style={{ fontSize: '12px' }}>No face detected. Ensure good lighting and face inside frame.</div>

  return (
    <div className="stage" style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      <video ref={videoRef} playsInline muted style={{ width: '100%' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <div
        className="badge"
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '12px',
          fontSize: '16px'
        }}
      >
        {topExpression ? `Top: ${topExpression.label} (${Math.round(topExpression.score * 100)}%)` : status}
      </div>
      <div
        className="legend"
        style={{ position: 'absolute', right: 12, top: 12, width: 'min(340px, 40vw)' }}
      >
        {legend}
      </div>
    </div>
  )
}

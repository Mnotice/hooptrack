import { useCallback, useEffect, useRef, useState } from 'react'

export function useCamera() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [facingMode, setFacingMode] = useState('environment')

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStatus('stopped')
  }, [])

  const startCamera = useCallback(async (modeOverride) => {
    const activeMode = modeOverride || facingMode
    setError(null)
    setStatus('starting')

    try {
      stopCamera()

      const constraints = {
        audio: false,
        video: {
          facingMode: { ideal: activeMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setStatus('active')
      return true
    } catch (err) {
      setError(err.message || 'Camera access denied')
      setStatus('error')
      return false
    }
  }, [facingMode, stopCamera])

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) return null

    const width = video.videoWidth
    const height = video.videoHeight
    if (!width || !height) return null

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(video, 0, 0, width, height)
    const imageData = ctx.getImageData(0, 0, width, height)
    return { imageData, width, height, ctx }
  }, [])

  const switchCamera = useCallback(async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(nextMode)
    if (!cameraWasActiveRef.current) return
    const ok = await startCamera(nextMode)
    cameraWasActiveRef.current = ok
  }, [facingMode, startCamera])

  useEffect(() => () => stopCamera(), [stopCamera])

  const cameraWasActiveRef = useRef(false)

  const wrappedStartCamera = useCallback(async () => {
    const ok = await startCamera()
    cameraWasActiveRef.current = ok
    return ok
  }, [startCamera])

  const wrappedStopCamera = useCallback(() => {
    cameraWasActiveRef.current = false
    stopCamera()
  }, [stopCamera])

  return {
    videoRef,
    canvasRef,
    status,
    error,
    facingMode,
    startCamera: wrappedStartCamera,
    stopCamera: wrappedStopCamera,
    switchCamera,
    captureFrame,
    isSupported: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
  }
}
import { useCallback, useRef, useState } from 'react'
import {
  Camera,
  CameraOff,
  Check,
  Crosshair,
  RefreshCw,
  SwitchCamera,
  Target,
  X,
  Zap,
} from 'lucide-react'
import { useCamera } from '../hooks/useCamera'
import { useShotDetection } from '../hooks/useShotDetection'
import { createShot, DEFAULT_RIM_CALIBRATION, getSessionStats, SHOT_SOURCES, ZONES } from '../utils/shotTypes'
import '../styles/CameraTab.css'

const PHASE_LABELS = [
  { id: 1, label: 'Calibrate', desc: 'Frame the rim' },
  { id: 2, label: 'Rim Motion', desc: 'Net movement detection' },
  { id: 3, label: 'Ball Track', desc: 'Trajectory analysis' },
  { id: 4, label: 'Auto Zone', desc: 'Zone inference' },
]

export default function CameraTab({ currentSession, onAddShot, onEndSession }) {
  const overlayRef = useRef(null)
  const dragRef = useRef(null)
  const [rimRoi, setRimRoi] = useState(DEFAULT_RIM_CALIBRATION)
  const [isCalibrating, setIsCalibrating] = useState(true)
  const [detectionPhase, setDetectionPhase] = useState(4)
  const [cameraActive, setCameraActive] = useState(false)
  const [selectedZone, setSelectedZone] = useState(null)

  const {
    videoRef,
    canvasRef,
    status,
    error,
    startCamera,
    stopCamera,
    switchCamera,
    captureFrame,
    isSupported,
  } = useCamera()

  const detectionEnabled = cameraActive && !!rimRoi && !isCalibrating
  const { metrics, suggestion, dismissSuggestion, resetDetectors } = useShotDetection({
    captureFrame,
    rimRoi,
    enabled: detectionEnabled,
    phase: detectionPhase,
  })

  const stats = getSessionStats(currentSession.shots)

  const handleStartCamera = async () => {
    const ok = await startCamera()
    if (ok) setCameraActive(true)
  }

  const handleStopCamera = () => {
    stopCamera()
    setCameraActive(false)
  }

  const confirmSuggestion = useCallback((override = null) => {
    if (!suggestion && !override) return

    const result = override?.result || suggestion.result
    const zone = override?.zone ?? suggestion?.zone ?? selectedZone
    const confidence = override ? 1 : suggestion.confidence

    onAddShot(createShot({
      result,
      zone,
      source: SHOT_SOURCES.CAMERA,
      confidence,
      confirmed: true,
      zoneSource: suggestion?.phases?.zone ? 'camera' : 'manual',
    }))

    dismissSuggestion()
    setSelectedZone(null)
  }, [suggestion, selectedZone, onAddShot, dismissSuggestion])

  const handleManualShot = (result) => {
    onAddShot(createShot({
      result,
      zone: selectedZone,
      source: SHOT_SOURCES.CAMERA,
      confidence: 1,
      confirmed: true,
      zoneSource: 'manual',
    }))
    setSelectedZone(null)
  }

  const finishCalibration = () => {
    if (!rimRoi) {
      setRimRoi(DEFAULT_RIM_CALIBRATION)
    }
    setIsCalibrating(false)
    resetDetectors()
  }

  const getPointerPos = (event, rect) => {
    const clientX = event.touches ? event.touches[0].clientX : event.clientX
    const clientY = event.touches ? event.touches[0].clientY : event.clientY
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    }
  }

  const onOverlayPointerDown = (event) => {
    if (!isCalibrating) return
    const rect = overlayRef.current.getBoundingClientRect()
    const pos = getPointerPos(event, rect)
    dragRef.current = { mode: 'move', start: pos, origin: rimRoi || DEFAULT_RIM_CALIBRATION }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onOverlayPointerMove = (event) => {
    if (!dragRef.current || !isCalibrating) return
    const rect = overlayRef.current.getBoundingClientRect()
    const pos = getPointerPos(event, rect)
    const { start, origin } = dragRef.current

    if (dragRef.current.mode === 'move') {
      setRimRoi({
        ...origin,
        cx: Math.max(0.08, Math.min(0.92, origin.cx + (pos.x - start.x))),
        cy: Math.max(0.08, Math.min(0.92, origin.cy + (pos.y - start.y))),
      })
    } else {
      const dx = pos.x - origin.cx
      const dy = pos.y - origin.cy
      const radius = Math.max(0.04, Math.min(0.2, Math.sqrt(dx * dx + dy * dy)))
      setRimRoi({ ...origin, radius })
    }
  }

  const onOverlayPointerUp = () => {
    dragRef.current = null
  }

  const onResizePointerDown = (event) => {
    if (!isCalibrating || !rimRoi) return
    event.stopPropagation()
    dragRef.current = { mode: 'resize', origin: rimRoi }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const activeRoi = rimRoi

  return (
    <div className="camera-container">
      <div className="camera-header">
        <div>
          <h2 className="section-title">Camera Tracker</h2>
          <p className="camera-subtitle">Point your iPhone or iPad at the hoop. Calibrate once, then let HoopTrack assist.</p>
        </div>
        <div className="camera-session-stats">
          <span>{stats.makes}/{stats.total}</span>
          <span>{stats.percentage}%</span>
        </div>
      </div>

      <div className="phase-pills">
        {PHASE_LABELS.map((phase) => (
          <button
            key={phase.id}
            type="button"
            className={`phase-pill ${detectionPhase >= phase.id ? 'active' : ''} ${detectionPhase === phase.id ? 'current' : ''}`}
            onClick={() => setDetectionPhase(phase.id)}
            title={phase.desc}
          >
            <span className="phase-num">P{phase.id}</span>
            <span className="phase-label">{phase.label}</span>
          </button>
        ))}
      </div>

      {!isSupported && (
        <div className="camera-alert">Camera is not supported in this browser.</div>
      )}

      {error && <div className="camera-alert error">{error}</div>}

      <div className="camera-viewport">
        <video
          ref={videoRef}
          className={`camera-video ${cameraActive ? 'visible' : ''}`}
          playsInline
          muted
          autoPlay
        />
        <canvas ref={canvasRef} className="camera-canvas" />

        {!cameraActive && (
          <div className="camera-placeholder">
            <Camera size={48} />
            <p>Start the camera to begin tracking</p>
            <button type="button" className="camera-primary-btn" onClick={handleStartCamera}>
              <Camera size={18} /> Enable Camera
            </button>
          </div>
        )}

        {cameraActive && (
          <div
            ref={overlayRef}
            className="camera-overlay"
            onPointerDown={onOverlayPointerDown}
            onPointerMove={onOverlayPointerMove}
            onPointerUp={onOverlayPointerUp}
          >
            <div
              className={`rim-target ${isCalibrating ? 'calibrating' : 'locked'}`}
              style={{
                left: `${activeRoi.cx * 100}%`,
                top: `${activeRoi.cy * 100}%`,
                width: `${activeRoi.radius * 200}%`,
                height: `${activeRoi.radius * 200}%`,
              }}
            >
              <Crosshair size={18} />
              {isCalibrating && (
                <button
                  type="button"
                  className="rim-resize-handle"
                  onPointerDown={onResizePointerDown}
                  aria-label="Resize rim target"
                />
              )}
            </div>

            {detectionEnabled && (
              <div className="live-metrics">
                <span>Rim Δ {Math.round(metrics.rimDelta || 0)}</span>
                <span>{metrics.ballDetected ? 'Ball ✓' : 'Ball —'}</span>
                {metrics.zonePreview && <span>Zone: {metrics.zonePreview}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="camera-controls">
        {cameraActive ? (
          <>
            <button type="button" className="camera-secondary-btn" onClick={switchCamera}>
              <SwitchCamera size={18} /> Flip
            </button>
            <button type="button" className="camera-secondary-btn" onClick={handleStopCamera}>
              <CameraOff size={18} /> Stop
            </button>
            {isCalibrating ? (
              <button type="button" className="camera-primary-btn" onClick={finishCalibration}>
                <Check size={18} /> Lock Rim
              </button>
            ) : (
              <button type="button" className="camera-secondary-btn" onClick={() => setIsCalibrating(true)}>
                <RefreshCw size={18} /> Recalibrate
              </button>
            )}
          </>
        ) : null}
      </div>

      {isCalibrating && cameraActive && (
        <div className="calibration-hint">
          Drag the circle over the rim. Pull the handle to resize. Tap <strong>Lock Rim</strong> when aligned.
        </div>
      )}

      {suggestion && !isCalibrating && (
        <div className="shot-suggestion">
          <div className="suggestion-main">
            <Zap size={20} />
            <div>
              <div className="suggestion-title">
                Suggested {suggestion.result === 'make' ? 'MAKE' : 'MISS'}
                <span className="suggestion-confidence">{Math.round(suggestion.confidence * 100)}%</span>
              </div>
              <div className="suggestion-meta">
                {suggestion.phases.rim && 'Rim '}
                {suggestion.phases.ball && '· Ball '}
                {suggestion.phases.zone && suggestion.zone && `· Zone: ${suggestion.zone.replace('-', ' ')}`}
              </div>
            </div>
          </div>
          <div className="suggestion-actions">
            <button type="button" className="confirm-make" onClick={() => confirmSuggestion()}>
              <Check size={16} /> Confirm
            </button>
            <button type="button" className="confirm-miss" onClick={() => confirmSuggestion({ result: suggestion.result === 'make' ? 'miss' : 'make' })}>
              <X size={16} /> Wrong
            </button>
            <button type="button" className="confirm-dismiss" onClick={dismissSuggestion}>Dismiss</button>
          </div>
        </div>
      )}

      <div className="manual-fallback">
        <p>Manual confirm (Phase 1 fallback)</p>
        <div className="zone-picker">
          {ZONES.map((zone) => (
            <button
              key={zone.id}
              type="button"
              className={`zone-chip ${selectedZone === zone.id ? 'selected' : ''}`}
              onClick={() => setSelectedZone(zone.id)}
            >
              {zone.label}
            </button>
          ))}
        </div>
        <div className="manual-shot-buttons">
          <button
            type="button"
            className="manual-make"
            disabled={!selectedZone}
            onClick={() => handleManualShot('make')}
          >
            <Check size={18} /> Make
          </button>
          <button
            type="button"
            className="manual-miss"
            disabled={!selectedZone}
            onClick={() => handleManualShot('miss')}
          >
            <X size={18} /> Miss
          </button>
        </div>
      </div>

      <div className="camera-summary">
        <div className="stat-card">
          <Target size={24} />
          <div>
            <div className="stat-number">{stats.makes}</div>
            <div className="stat-label">Makes</div>
          </div>
        </div>
        <div className="stat-card">
          <Zap size={24} />
          <div>
            <div className="stat-number">{stats.percentage}%</div>
            <div className="stat-label">FG%</div>
          </div>
        </div>
        <div className="stat-card">
          <Camera size={24} />
          <div>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Shots</div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="end-session-btn"
        onClick={onEndSession}
        disabled={stats.total === 0}
      >
        End Session & Save
      </button>

      {status === 'starting' && <div className="camera-status">Starting camera…</div>}
    </div>
  )
}
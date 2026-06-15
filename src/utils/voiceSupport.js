export function getVoiceSupport() {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      limited: false,
      reason: 'ssr',
      message: 'Voice commands are only available in the browser.',
    }
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true

  if (!SpeechRecognition) {
    return {
      supported: false,
      limited: false,
      reason: 'unsupported',
      message: 'Voice is not supported in this browser. Use Chrome or Edge on desktop, or manual Make/Miss buttons.',
    }
  }

  if (isIOS && isStandalone) {
    return {
      supported: false,
      limited: false,
      reason: 'ios-pwa',
      message: 'Voice does not work in the installed iPhone/iPad app. Open HoopTrack in Safari, or use the Make/Miss buttons.',
    }
  }

  if (isIOS) {
    return {
      supported: true,
      limited: true,
      reason: 'ios-safari',
      message: 'On iPhone/iPad, voice works in Safari only — not when added to Home Screen.',
    }
  }

  return {
    supported: true,
    limited: false,
    reason: 'full',
    message: null,
  }
}
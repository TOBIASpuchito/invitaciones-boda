const INVITATION_MUSIC_SRC = '/A Sky Full of Stars.mp3'
const INVITATION_MUSIC_START_SECONDS = 10

let invitationMusic: HTMLAudioElement | null = null
let removeUnlockListeners: (() => void) | null = null

function getInvitationMusic() {
  if (!import.meta.client) {
    return null
  }

  if (!invitationMusic) {
    invitationMusic = new Audio(INVITATION_MUSIC_SRC)
    invitationMusic.preload = 'auto'
  }

  return invitationMusic
}

function seekInvitationMusicStart(audio: HTMLAudioElement) {
  if (audio.readyState < 1) {
    return
  }

  if (Math.abs(audio.currentTime - INVITATION_MUSIC_START_SECONDS) > 0.35) {
    audio.currentTime = INVITATION_MUSIC_START_SECONDS
  }
}

function clearInvitationMusicUnlock() {
  removeUnlockListeners?.()
  removeUnlockListeners = null
}

function prepareInvitationMusic() {
  const audio = getInvitationMusic()

  if (!audio) {
    return
  }

  if (audio.readyState >= 1) {
    seekInvitationMusicStart(audio)
    return
  }

  audio.addEventListener('loadedmetadata', () => seekInvitationMusicStart(audio), { once: true })
  audio.load()
}

function primeInvitationMusic() {
  const audio = getInvitationMusic()

  if (!audio) {
    return Promise.resolve(false)
  }

  seekInvitationMusicStart(audio)
  audio.muted = true
  audio.volume = 0

  const playback = audio.play()

  if (!playback) {
    return Promise.resolve(true)
  }

  return playback
    .then(() => true)
    .catch(() => false)
}

function startInvitationMusic() {
  const audio = getInvitationMusic()

  if (!audio) {
    return Promise.resolve(false)
  }

  seekInvitationMusicStart(audio)
  audio.muted = false
  audio.volume = 1

   if (!audio.paused) {
    clearInvitationMusicUnlock()
    return Promise.resolve(true)
  }

  const playback = audio.play()

  if (!playback) {
    clearInvitationMusicUnlock()
    return Promise.resolve(true)
  }

  return playback
    .then(() => {
      clearInvitationMusicUnlock()
      return true
    })
    .catch(() => false)
}

function queueInvitationMusicUnlock() {
  if (!import.meta.client || removeUnlockListeners) {
    return
  }

  const tryStart = async () => {
    const hasStarted = await startInvitationMusic()

    if (!hasStarted) {
      return
    }

    clearInvitationMusicUnlock()
  }

  const pointerOptions: AddEventListenerOptions = { once: true, passive: true }
  const keyOptions: AddEventListenerOptions = { once: true }

  window.addEventListener('pointerdown', tryStart, pointerOptions)
  window.addEventListener('keydown', tryStart, keyOptions)

  removeUnlockListeners = () => {
    window.removeEventListener('pointerdown', tryStart)
    window.removeEventListener('keydown', tryStart)
  }
}

function stopInvitationMusic() {
  const audio = getInvitationMusic()

  if (!audio) {
    return
  }

  audio.pause()
  seekInvitationMusicStart(audio)
  clearInvitationMusicUnlock()
}

export function useInvitationMusic() {
  return {
    prepareInvitationMusic,
    primeInvitationMusic,
    startInvitationMusic,
    queueInvitationMusicUnlock,
    stopInvitationMusic,
  }
}
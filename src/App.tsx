import { useCallback, useEffect, useState } from 'react'
import { BEATS, CHAPTERS } from './story/script'
import { setAudioEnabled, sfx, startMusic, stopMusic, unlockAudio } from './game/audio'
import { completeSection, lightArray, loadProgress, saveProgress } from './game/progress'
import type { Progress } from './game/progress'
import { useReducedMotion } from './hooks/useReducedMotion'
import TitleScreen from './components/TitleScreen'
import Stage from './components/Stage'
import StationMap from './components/StationMap'
import StationPlayer from './components/StationPlayer'

type Screen = 'title' | 'story' | 'map' | 'station'

const SOUND_KEY = 'lumen.sound'

function readBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : v === 'true'
  } catch {
    return fallback
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable — settings simply won't persist */
  }
}

export default function App() {
  const reduced = useReducedMotion()
  const [screen, setScreen] = useState<Screen>('title')
  const [beatIndex, setBeatIndex] = useState(0)
  const [stationId, setStationId] = useState(1)
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [sound, setSound] = useState(() => readBool(SOUND_KEY, true))

  useEffect(() => {
    setAudioEnabled(sound)
    write(SOUND_KEY, String(sound))
    if (sound) startMusic()
    else stopMusic()
  }, [sound])

  // Browsers only allow audio after a real gesture, so unlock on the first one.
  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const beat = BEATS[beatIndex]
  const chapterIndex = CHAPTERS.indexOf(beat.chapter)
  const isLast = beatIndex === BEATS.length - 1

  const play = useCallback(() => {
    sfx.click()
    setBeatIndex(0)
    setScreen('story')
  }, [])

  const next = useCallback(() => {
    sfx.click()
    // Clamp inside the updater: a held key or a flurry of taps all fire before
    // React re-renders, so an unclamped `i + 1` can run past the end of BEATS —
    // and leave `beat` undefined, which white-screens the whole stage.
    setBeatIndex((i) => Math.min(i + 1, BEATS.length - 1))
    if (beatIndex >= BEATS.length - 1) setScreen('map')
  }, [beatIndex])

  const back = useCallback(() => {
    sfx.click()
    setBeatIndex((i) => Math.max(0, i - 1))
  }, [])

  const skip = useCallback(() => {
    sfx.click()
    setScreen('map')
  }, [])

  const openStation = useCallback((id: number) => {
    sfx.click()
    setStationId(id)
    setScreen('station')
  }, [])

  const handleSectionComplete = useCallback((id: number, sectionIndex: number, stars: number) => {
    setProgress((p) => completeSection(p, id, sectionIndex, stars))
  }, [])

  const replay = useCallback(() => {
    sfx.click()
    setBeatIndex(0)
    setScreen('story')
  }, [])

  const toggleSound = useCallback(() => {
    sfx.click()
    setSound((s) => !s)
  }, [])

  return (
    <div className="relative h-[100dvh] max-h-screen w-full overflow-hidden bg-navy-950">
      {screen === 'title' && (
        <TitleScreen
          onPlay={play}
          onSkipToStations={skip}
          sound={sound}
          onToggleSound={toggleSound}
        />
      )}

      {screen === 'story' && (
        <Stage
          beat={beat}
          chapterIndex={chapterIndex}
          chapterCount={CHAPTERS.length}
          isLast={isLast}
          isFirst={beatIndex === 0}
          onNext={next}
          onBack={back}
          onSkip={skip}
          sound={sound}
          onToggleSound={toggleSound}
          reduced={reduced}
          lights={lightArray(progress)}
        />
      )}

      {screen === 'map' && (
        <div className="h-full w-full overflow-y-auto">
          <StationMap progress={progress} onOpenStation={openStation} onReplayIntro={replay} />
        </div>
      )}

      {screen === 'station' && (
        <div className="h-full w-full overflow-y-auto">
          <StationPlayer
            key={stationId}
            stationId={stationId}
            progress={progress}
            onBack={() => setScreen('map')}
            onSectionComplete={handleSectionComplete}
          />
        </div>
      )}
    </div>
  )
}

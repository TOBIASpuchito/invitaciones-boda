<script setup lang="ts">
import { gsap } from 'gsap'

const props = defineProps<{
  guestName: string
  eventName: string
}>()

const emit = defineEmits<{
  complete: []
}>()

const started = ref(false)

const overlayRef = ref<HTMLElement | null>(null)
const envelopeRef = ref<HTMLElement | null>(null)
const flapRef = ref<HTMLElement | null>(null)
const sealRef = ref<HTMLElement | null>(null)
const paperRef = ref<HTMLElement | null>(null)
const sheetRef = ref<HTMLElement | null>(null)
const eyebrowRef = ref<HTMLElement | null>(null)
const nameRef = ref<HTMLElement | null>(null)
const eventRef = ref<HTMLElement | null>(null)
const coverRef = ref<HTMLElement | null>(null)

let tl: gsap.core.Timeline | null = null

function showEnvelope() {
  gsap.to(envelopeRef.value, {
    opacity: 1, y: 0, scale: 1,
    duration: 0.7, ease: 'back.out(1.4)',
  })
}

function choose(withMusic: boolean) {
  started.value = true
  buildTimeline()
}

function buildTimeline() {
  tl = gsap.timeline()

  tl.to(sealRef.value, {
    opacity: 0, scale: 0.1, rotation: 42,
    duration: 0.28, ease: 'back.in(3)',
  }, 0)

  tl.to(flapRef.value, {
    rotateX: -180,
    duration: 0.85, ease: 'power3.inOut',
  }, 0.15)

  // A mitad del giro la solapa pasa al plano trasero del sobre
  tl.set(flapRef.value, { zIndex: 1 }, 0.58)

  tl.to(paperRef.value, {
    y: '-55%',
    duration: 0.85, ease: 'power2.inOut',
  }, 0.9)

  tl.to(paperRef.value, {
    y: '-50%',
    duration: 0.28, ease: 'elastic.out(1, 0.5)',
  }, 1.75)

  tl.to(eyebrowRef.value, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }, 1.6)
  tl.to(nameRef.value, { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: 'back.out(1.6)' }, 1.8)
  tl.to(eventRef.value, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }, 2.0)

  tl.call(() => {
    if (!sheetRef.value || !coverRef.value) return
    const rect = sheetRef.value.getBoundingClientRect()
    gsap.set(coverRef.value, {
      display: 'block',
      opacity: 1,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      borderRadius: '1rem',
    })
  }, undefined, 2.95)

  tl.to(envelopeRef.value, { opacity: 0, duration: 0.22 }, 2.95)

  tl.to(coverRef.value, {
    top: 0, left: 0,
    width: '100%', height: '100%',
    borderRadius: 0,
    duration: 0.82, ease: 'expo.inOut',
  }, 3.0)

  tl.to(coverRef.value, {
    opacity: 0,
    duration: 0.48, ease: 'power2.inOut',
    onComplete: () => emit('complete'),
  }, 3.83)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    emit('complete')
    return
  }

  gsap.set(envelopeRef.value, { opacity: 0, y: 28, scale: 0.93 })
  gsap.set(flapRef.value, { rotateX: 0, transformOrigin: '50% 0%' })
  gsap.set(paperRef.value, { y: '85%' })
  gsap.set(eyebrowRef.value, { opacity: 0, y: 8 })
  gsap.set(nameRef.value, { opacity: 0, y: 14, scale: 0.94 })
  gsap.set(eventRef.value, { opacity: 0, y: 8 })
  gsap.set(coverRef.value, { display: 'none' })

  showEnvelope()
  choose(true)
})

onBeforeUnmount(() => {
  tl?.kill()
})
</script>

<template>
  <div ref="overlayRef" class="anim-overlay">
    <div class="anim-bg" />

    <div class="anim-group">
    <div class="anim-scene">
      <div ref="envelopeRef" class="env">

        <div class="env-back" />

        <div ref="paperRef" class="paper">
          <div ref="sheetRef" class="paper-sheet">
            <p ref="eyebrowRef" class="paper-eyebrow">Invitacion para</p>
            <p ref="nameRef" class="paper-name">{{ props.guestName }}</p>
            <p ref="eventRef" class="paper-event">{{ props.eventName }}</p>
            <div class="paper-divider" />
          </div>
        </div>

        <div class="env-pocket" />

        <div ref="flapRef" class="env-flap" />

        <div ref="sealRef" class="seal">
          <div class="seal-ring" />
        </div>

      </div>
    </div>

    </div>

    <div ref="coverRef" class="anim-cover" />
  </div>
</template>

<style scoped>
.anim-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #ffffff;
}

.anim-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 22% 20%, rgba(240, 240, 240, 0.4) 0%, transparent 28%);
  pointer-events: none;
}

.anim-scene {
  position: relative;
  width: min(84vw, 360px);
  filter: drop-shadow(0 16px 26px rgba(100, 75, 42, 0.2));
}

.env {
  position: relative;
  width: 100%;
  aspect-ratio: 7 / 5;
  perspective: 1100px;
  /*
   * Recorta el papel en los bordes inferior/lateral pero NO arriba.
   * El valor -999px en top extiende el area de recorte hacia arriba
   * para que el papel pueda emerger por la boca sin ser cortado.
   */
  clip-path: inset(-999px 0 0 0 round 0 0 14px 14px);
}

.env-back,
.paper,
.env-pocket,
.env-flap,
.seal {
  position: absolute;
}

.env-back {
  inset: 0;
  z-index: 1;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.paper {
  top: 14%;
  left: 11%;
  right: 11%;
  z-index: 2;
}

.paper-sheet {
  width: 100%;
  padding: 1.4rem 1.1rem 1.3rem;
  border-radius: 8px;
  background: #ffffff;
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.10),
    0 1px 3px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.paper-eyebrow {
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(112, 88, 50, 0.7);
}

.paper-name {
  margin-top: 0.7rem;
  font-family: var(--font-display, Georgia, serif);
  font-size: clamp(1.3rem, 3vw, 2rem);
  line-height: 1.06;
  color: #4a3820;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

.paper-event {
  margin-top: 0.55rem;
  font-size: 0.62rem;
  line-height: 1.42;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(98, 76, 44, 0.65);
  text-wrap: balance;
}

.paper-divider {
  margin: 0.85rem auto 0;
  width: 46%;
  height: 1px;
  border-radius: 9999px;
  background: rgba(128, 104, 68, 0.14);
}

.env-pocket {
  top: 38%;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  background: #f5f5f5;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  border-top-left-radius: 50% 38%;
  border-top-right-radius: 50% 38%;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.05);
}

.env-flap {
  top: 0;
  left: 0;
  right: 0;
  height: 56%;
  z-index: 4;
  transform-origin: center top;
  clip-path: polygon(0 0, 100% 0, 50% 84%);
  background: #ffffff;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.06));
}

.seal {
  left: 50%;
  top: 43%;
  z-index: 5;
  width: 3.4rem;
  height: 3.4rem;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid rgba(100, 40, 60, 0.25);
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.10),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.seal-ring {
  position: absolute;
  inset: 22%;
  border-radius: 50%;
  border: 1.5px solid rgba(100, 40, 60, 0.2);
}

.anim-cover {
  position: absolute;
  background: #ffffff;
}

@media (max-width: 480px) {
  .anim-scene {
    width: min(90vw, 300px);
  }

  .paper-name {
    font-size: clamp(1.15rem, 7vw, 1.75rem);
  }

  .seal {
    width: 2.9rem;
    height: 2.9rem;
  }
}

.anim-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
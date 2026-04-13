<script setup lang="ts">
import { gsap } from 'gsap'

const props = defineProps<{
  guestName: string
  eventName: string
}>()

const emit = defineEmits<{
  complete: []
}>()

const overlayRef = ref<HTMLElement | null>(null)
const envelopeRef = ref<HTMLElement | null>(null)
const sealRef = ref<HTMLElement | null>(null)
const flapRef = ref<HTMLElement | null>(null)
const paperRef = ref<HTMLElement | null>(null)
const sheetRef = ref<HTMLElement | null>(null)
const eyebrowRef = ref<HTMLElement | null>(null)
const nameRef = ref<HTMLElement | null>(null)
const eventRef = ref<HTMLElement | null>(null)
const coverRef = ref<HTMLElement | null>(null)

let tl: gsap.core.Timeline | null = null

function buildTimeline() {
  tl = gsap.timeline()

  tl.to(envelopeRef.value, {
    opacity: 1, y: 0, scale: 1,
    duration: 0.8, ease: 'back.out(1.5)',
  }, 0)

  tl.to(sealRef.value, {
    opacity: 0, scale: 0.1, rotation: 35,
    duration: 0.35, ease: 'back.in(3)',
  }, 0.9)

  tl.to(flapRef.value, {
    rotateX: -178,
    duration: 1.15, ease: 'power4.out',
  }, 1.1)

  tl.to(paperRef.value, {
    y: '-58%',
    duration: 1.0, ease: 'power2.inOut',
  }, 1.9)

  tl.to(paperRef.value, {
    y: '-54%',
    duration: 0.4, ease: 'elastic.out(1, 0.7)',
  }, 2.9)

  tl.to(eyebrowRef.value, {
    opacity: 1, y: 0,
    duration: 0.35, ease: 'power2.out',
  }, 2.7)

  tl.to(nameRef.value, {
    opacity: 1, y: 0, scale: 1,
    duration: 0.45, ease: 'back.out(1.8)',
  }, 2.9)

  tl.to(eventRef.value, {
    opacity: 1, y: 0,
    duration: 0.35, ease: 'power2.out',
  }, 3.1)

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
      borderRadius: '1.4rem',
    })
  }, undefined, 4.1)

  tl.to(envelopeRef.value, { opacity: 0, duration: 0.25 }, 4.1)

  tl.to(coverRef.value, {
    top: 0, left: 0,
    width: '100%', height: '100%',
    borderRadius: 0,
    duration: 0.9, ease: 'expo.inOut',
  }, 4.15)

  tl.to(coverRef.value, {
    opacity: 0,
    duration: 0.6, ease: 'power2.inOut',
    onComplete: () => emit('complete'),
  }, 5.05)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    emit('complete')
    return
  }

  gsap.set(envelopeRef.value, { opacity: 0, y: 50, scale: 0.9 })
  gsap.set(flapRef.value, { rotateX: 0, transformOrigin: '50% 0%' })
  gsap.set(paperRef.value, { y: '18%' })
  gsap.set(eyebrowRef.value, { opacity: 0, y: 10 })
  gsap.set(nameRef.value, { opacity: 0, y: 18, scale: 0.93 })
  gsap.set(eventRef.value, { opacity: 0, y: 10 })
  gsap.set(coverRef.value, { display: 'none' })

  buildTimeline()
})

onBeforeUnmount(() => {
  tl?.kill()
})
</script>

<template>
  <div ref="overlayRef" class="anim-overlay">
    <div class="anim-bg" />

    <div class="anim-scene">
      <div ref="envelopeRef" class="env">
        <div class="env-back" />

        <div ref="paperRef" class="paper">
          <div ref="sheetRef" class="paper-sheet">
            <p ref="eyebrowRef" class="paper-eyebrow">Invitacion para</p>
            <p ref="nameRef" class="paper-name">{{ props.guestName }}</p>
            <p ref="eventRef" class="paper-event">{{ props.eventName }}</p>
            <div class="paper-lines">
              <span /><span /><span />
            </div>
          </div>
        </div>

        <div class="env-front">
          <div class="env-fold-left" />
          <div class="env-fold-right" />
          <div class="env-fold-bottom" />
        </div>

        <div ref="flapRef" class="env-flap">
          <div class="env-flap-face" />
        </div>

        <div ref="sealRef" class="seal">
          <div class="seal-ring" />
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
  background: linear-gradient(170deg, #faf4ee 0%, #f0ddd2 100%);
}

.anim-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.6) 0%, transparent 26%),
    radial-gradient(circle at 82% 80%, rgba(148, 112, 122, 0.14) 0%, transparent 22%);
  pointer-events: none;
}

.anim-scene {
  position: relative;
  width: min(84vw, 340px);
  perspective: 1200px;
  filter: drop-shadow(0 28px 32px rgba(90, 58, 68, 0.15));
}

.env {
  position: relative;
  width: 100%;
  aspect-ratio: 5 / 4;
  transform-style: preserve-3d;
}

.env-back,
.env-front,
.env-flap,
.paper,
.seal {
  position: absolute;
}

.env-back {
  inset: 0;
  border-radius: 1.6rem;
  background: linear-gradient(155deg, #f7e3d6 0%, #eccebc 100%);
  border: 1px solid rgba(138, 98, 112, 0.14);
}

.paper {
  top: 8%;
  left: 9%;
  right: 9%;
}

.paper-sheet {
  width: 100%;
  max-width: 100%;
  padding: 1.45rem 1.2rem 1.15rem;
  border-radius: 1.4rem;
  background: linear-gradient(170deg, #ffffff 0%, #fef9f5 100%);
  box-shadow:
    0 14px 32px rgba(80, 56, 66, 0.13),
    0 2px 6px rgba(80, 56, 66, 0.06);
  text-align: center;
  overflow: hidden;
}

.paper-eyebrow {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(108, 68, 82, 0.7);
}

.paper-name {
  margin-top: 0.8rem;
  font-family: var(--font-display, Georgia, serif);
  font-size: clamp(1.45rem, 3.6vw, 2.35rem);
  line-height: 0.98;
  color: #3b2831;
  text-wrap: balance;
  overflow-wrap: anywhere;
}

.paper-event {
  margin-top: 0.65rem;
  font-size: 0.72rem;
  line-height: 1.4;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(82, 60, 68, 0.65);
  text-wrap: balance;
}

.paper-lines {
  margin-top: 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  align-items: center;
}

.paper-lines span {
  display: block;
  height: 0.32rem;
  border-radius: 9999px;
  background: rgba(120, 92, 100, 0.1);
}

.paper-lines span:nth-child(1) { width: 74%; }
.paper-lines span:nth-child(2) { width: 56%; }
.paper-lines span:nth-child(3) { width: 64%; }

.env-front {
  inset: 0;
  border-radius: 1.6rem;
  overflow: hidden;
}

.env-fold-left,
.env-fold-right,
.env-fold-bottom {
  position: absolute;
}

.env-fold-left {
  inset: 34% auto 0 0;
  width: 54%;
  background: linear-gradient(130deg, #eccfc0, #ddbead);
  clip-path: polygon(0 0, 100% 50%, 0 100%);
}

.env-fold-right {
  inset: 34% 0 0 auto;
  width: 54%;
  background: linear-gradient(230deg, #e9cfc1, #dbbdac);
  clip-path: polygon(100% 0, 100% 100%, 0 50%);
}

.env-fold-bottom {
  inset: 52% 0 0;
  background: linear-gradient(180deg, #e6c3b0, #d9af9b);
  clip-path: polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%);
  border-bottom-left-radius: 1.6rem;
  border-bottom-right-radius: 1.6rem;
}

.env-flap {
  inset: 0;
  transform-origin: 50% 0%;
}

.env-flap-face {
  position: absolute;
  inset: 0;
  clip-path: polygon(0 0, 50% 56%, 100% 0);
  background: linear-gradient(175deg, #f3d9cc 0%, #e7c6b2 100%);
  border-bottom: 1px solid rgba(138, 97, 108, 0.10);
}

.seal {
  left: 50%;
  top: 54%;
  width: 3.8rem;
  height: 3.8rem;
  margin-left: -1.9rem;
  margin-top: -1.9rem;
  border-radius: 9999px;
  background: radial-gradient(circle at 50% 50%, #9b677a, #7d5163 60%, #623b4d 100%);
  box-shadow:
    0 6px 18px rgba(80, 48, 62, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.seal-ring {
  position: absolute;
  inset: 22%;
  border-radius: 9999px;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
}

.anim-cover {
  position: absolute;
  background: linear-gradient(170deg, #ffffff 0%, #fef9f5 100%);
}

@media (max-width: 480px) {
  .anim-scene {
    width: min(88vw, 300px);
  }

  .paper-sheet {
    padding: 1.15rem 0.95rem 1rem;
  }

  .paper-name {
    font-size: clamp(1.3rem, 8vw, 1.95rem);
  }

  .paper-event {
    font-size: 0.66rem;
    letter-spacing: 0.14em;
  }

  .seal {
    width: 3.2rem;
    height: 3.2rem;
    margin-left: -1.6rem;
    margin-top: -1.6rem;
  }
}
</style>

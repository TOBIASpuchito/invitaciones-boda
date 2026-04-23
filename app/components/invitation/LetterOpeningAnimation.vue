<script setup lang="ts">
import { gsap } from 'gsap'

type LetterPaperExpose = {
  getAnimationElements: () => {
    paper: HTMLElement | null
    sheet: HTMLElement | null
    eyebrow: HTMLElement | null
    name: HTMLElement | null
    event: HTMLElement | null
  }
}

const props = defineProps<{
  guestName: string
  eventName: string
}>()

const emit = defineEmits<{
  complete: []
}>()

const envelopeRef = ref<HTMLElement | null>(null)
const flapRef = ref<HTMLElement | null>(null)
const sealRef = ref<HTMLElement | null>(null)
const paperComponentRef = ref<LetterPaperExpose | null>(null)
const coverRef = ref<HTMLElement | null>(null)

let tl: gsap.core.Timeline | null = null

const flapStyle = {
  backgroundImage: "url('/tapa.png')",
  backgroundPosition: 'center top',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
}

const sealStyle = {
  backgroundImage: "url('/sello.png')",
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'contain',
}

function getPaperElements() {
  return paperComponentRef.value?.getAnimationElements() ?? {
    paper: null,
    sheet: null,
    eyebrow: null,
    name: null,
    event: null,
  }
}

async function waitForPaperElements(maxTries = 10) {
  for (let attempt = 0; attempt < maxTries; attempt += 1) {
    await nextTick()

    const elements = getPaperElements()

    if (elements.paper && elements.sheet && elements.eyebrow && elements.name && elements.event) {
      return elements
    }

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  }

  return getPaperElements()
}

function showEnvelope() {
  return gsap.to(envelopeRef.value, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.7,
    ease: 'back.out(1.4)',
  })
}

function choose(withMusic: boolean) {
  buildTimeline()
}

function buildTimeline() {
  const { paper, sheet, eyebrow, name, event } = getPaperElements()

  if (!envelopeRef.value || !flapRef.value || !sealRef.value || !paper || !sheet || !eyebrow || !name || !event || !coverRef.value) {
    return
  }

  tl = gsap.timeline()

  tl.to(sealRef.value, {
    opacity: 0, scale: 0.1, rotation: 42,
    duration: 0.28, ease: 'back.in(3)',
  }, 0)

  tl.to(flapRef.value, {
    rotateX: 180,
    duration: 0.85, ease: 'power3.inOut',
  }, 0.15)

  // A mitad del giro la solapa pasa al plano trasero del sobre
  tl.set(flapRef.value, { zIndex: 1 }, 0.58)

  tl.to(paper, {
    y: '-55%',
    duration: 0.85, ease: 'power2.inOut',
  }, 0.9)

  tl.to(paper, {
    y: '-50%',
    duration: 0.28, ease: 'elastic.out(1, 0.5)',
  }, 1.75)

  tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }, 1.6)
  tl.to(name, { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: 'back.out(1.6)' }, 1.8)
  tl.to(event, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }, 2.0)

  tl.call(() => {
    if (!coverRef.value) return
    const rect = sheet.getBoundingClientRect()
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

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    emit('complete')
    return
  }

  const { paper, eyebrow, name, event } = await waitForPaperElements()

  if (!envelopeRef.value || !flapRef.value || !paper || !eyebrow || !name || !event || !coverRef.value) {
    emit('complete')
    return
  }

  gsap.set(envelopeRef.value, { opacity: 0, y: 28, scale: 0.93 })
  gsap.set(flapRef.value, { rotateX: 0, transformOrigin: '50% 0%' })
  gsap.set(paper, { y: '85%' })
  gsap.set(eyebrow, { opacity: 0, y: 8 })
  gsap.set(name, { opacity: 0, y: 14, scale: 0.94 })
  gsap.set(event, { opacity: 0, y: 8 })
  gsap.set(coverRef.value, { display: 'none' })

  showEnvelope().eventCallback('onComplete', () => {
    choose(true)
  })
})

onBeforeUnmount(() => {
  tl?.kill()
})
</script>

<template>
  <div class="fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-[#fcfaf8]">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(240,240,240,0.4)_0%,transparent_28%)]" />

    <div class="flex flex-col items-center">
      <div class="relative w-[min(84vw,360px)] drop-shadow-[0_16px_26px_rgba(100,75,42,0.2)] sm:w-[min(84vw,380px)]">
        <div
          ref="envelopeRef"
          class="relative aspect-[7/5] rounded-[18px] [perspective:1100px]"
        >
          <div class="absolute inset-0 z-[1] rounded-[18px] bg-[#edd9ca] shadow-[0_18px_40px_rgba(132,101,77,0.14)]" />

          <div class="absolute inset-x-0 bottom-0 top-0 z-[2] [clip-path:inset(-999px_0_0_0_round_0_0_18px_18px)]">
            <InvitationLetterPaper
              ref="paperComponentRef"
              :guest-name="props.guestName"
              :event-name="props.eventName"
            />
          </div>

          <div
            class="absolute inset-x-0 bottom-0 z-[3] h-[56%] rounded-b-[18px] bg-[#ead6c8] [border-top-left-radius:58%_44%] [border-top-right-radius:58%_44%]"
          />

          <div
            ref="flapRef"
            class="absolute inset-x-0 top-0 z-[4] h-[56%] origin-top [transform-style:preserve-3d]"
          >
            <div class="absolute -left-[12%] -right-[12%] -top-[38%] h-[220%]" :style="flapStyle" />
          </div>

          <div
            ref="sealRef"
            class="absolute left-1/2 top-[46%] z-[5] h-[3.75rem] w-[3.75rem] -translate-x-1/2 -translate-y-1/2 sm:h-[4rem] sm:w-[4rem]"
          >
            <div class="h-full w-full" :style="sealStyle" />
          </div>
        </div>
      </div>
    </div>

    <div ref="coverRef" class="absolute bg-white" />
  </div>
</template>
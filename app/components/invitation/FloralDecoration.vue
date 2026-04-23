<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const floralRef = ref<HTMLElement | null>(null)
const bottomLeftRef = ref<HTMLImageElement | null>(null)
const bottomRightRef = ref<HTMLImageElement | null>(null)

let ctx: gsap.Context | null = null

onMounted(() => {
  if (!import.meta.client || !floralRef.value) {
    return
  }

  ctx = gsap.context(() => {
    const pageTrigger = document.documentElement

    if (bottomLeftRef.value) {
      gsap.set(bottomLeftRef.value, { transformOrigin: 'bottom left' })
      gsap.to(bottomLeftRef.value, {
        rotation: -6.5,
        x: 22,
        y: -14,
        scale: 1.08,
        duration: 5.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      gsap.to(bottomLeftRef.value, {
        xPercent: 10,
        yPercent: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: pageTrigger,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      })
    }

    if (bottomRightRef.value) {
      gsap.set(bottomRightRef.value, { transformOrigin: 'bottom right' })
      gsap.to(bottomRightRef.value, {
        rotation: 6,
        x: -18,
        y: -16,
        scale: 1.06,
        duration: 5.6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      gsap.to(bottomRightRef.value, {
        xPercent: -6,
        yPercent: -24,
        ease: 'none',
        scrollTrigger: {
          trigger: pageTrigger,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      })
    }
  }, floralRef)
})

onBeforeUnmount(() => {
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <div ref="floralRef" class="floral-bg" aria-hidden="true">
    <img ref="bottomLeftRef" class="floral floral--bl" src="/341376.svg" alt="" />
    <img ref="bottomRightRef" class="floral floral--br" src="/37872.svg" alt="" />
  </div>
</template>

<style scoped>
.floral-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.floral {
  position: absolute;
  width: clamp(200px, 26vw, 360px);
  will-change: transform;
  filter:
    invert(38%) sepia(22%) saturate(700%) hue-rotate(68deg) brightness(72%) opacity(0.55);
}

.floral--bl {
  bottom: -3rem;
  left: -3rem;
}

.floral--br {
  bottom: -3rem;
  right: -3rem;
}
</style>

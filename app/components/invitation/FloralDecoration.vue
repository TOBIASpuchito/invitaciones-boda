<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const floralRef = ref<HTMLElement | null>(null)
const topRightRef = ref<HTMLImageElement | null>(null)
const bottomLeftRef = ref<HTMLImageElement | null>(null)
const bottomRightRef = ref<HTMLImageElement | null>(null)

let ctx: gsap.Context | null = null

onMounted(() => {
  if (!import.meta.client || !floralRef.value) {
    return
  }

  ctx = gsap.context(() => {
    const pageTrigger = document.documentElement

    if (topRightRef.value) {
      gsap.set(topRightRef.value, { scaleY: -1, transformOrigin: 'top right' })
      gsap.to(topRightRef.value, {
        rotation: 2.6,
        x: -10,
        duration: 6.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      gsap.to(topRightRef.value, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: pageTrigger,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
        },
      })
    }

    if (bottomLeftRef.value) {
      gsap.set(bottomLeftRef.value, { transformOrigin: 'bottom left' })
      gsap.to(bottomLeftRef.value, {
        rotation: -2.2,
        x: 8,
        duration: 7.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      gsap.to(bottomLeftRef.value, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: pageTrigger,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.4,
        },
      })
    }

    if (bottomRightRef.value) {
      gsap.set(bottomRightRef.value, { transformOrigin: 'bottom right' })
      gsap.to(bottomRightRef.value, {
        rotation: 2,
        x: -8,
        duration: 8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      gsap.to(bottomRightRef.value, {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: pageTrigger,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.6,
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
    <img ref="topRightRef" class="floral floral--tr" src="/341376.svg" alt="" />
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

.floral--tr {
  top: -3rem;
  right: -3rem;
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

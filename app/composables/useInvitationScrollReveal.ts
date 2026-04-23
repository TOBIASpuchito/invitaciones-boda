import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { onBeforeUnmount, onMounted, type Ref } from 'vue'

gsap.registerPlugin(ScrollTrigger)

type ScrollRevealOptions = {
  selector?: string
  start?: string
  distance?: number
  duration?: number
}

export function useInvitationScrollReveal(
  scopeRef: Ref<HTMLElement | null>,
  options: ScrollRevealOptions = {},
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    if (!import.meta.client || !scopeRef.value) {
      return
    }

    ctx = gsap.context(() => {
      const container = scopeRef.value!
      const elements = gsap.utils.toArray<HTMLElement>(options.selector ?? '[data-reveal]', container)

      elements.forEach((element, index) => {
        const delay = Number(element.dataset.revealDelay ?? '0')

        gsap.set(element, {
          autoAlpha: 0,
          y: options.distance ?? 36,
          scale: 0.982,
          transformOrigin: '50% 60%',
          willChange: 'transform, opacity',
        })

        gsap.to(element, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          delay,
          duration: options.duration ?? 1.05,
          ease: 'expo.out',
          clearProps: 'transform,opacity,visibility,willChange',
          immediateRender: false,
          scrollTrigger: {
            trigger: element,
            start: options.start ?? 'top 93%',
            toggleActions: 'play none none none',
            once: true,
            invalidateOnRefresh: true,
            refreshPriority: index + 1,
          },
        })
      })
    }, scopeRef.value)

    ScrollTrigger.refresh()
  })

  onBeforeUnmount(() => {
    ctx?.revert()
    ctx = null
  })
}
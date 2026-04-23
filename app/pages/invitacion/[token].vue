<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { defineAsyncComponent, nextTick } from 'vue'

gsap.registerPlugin(ScrollTrigger)

const route = useRoute()
const config = useRuntimeConfig()
const token = route.params.token as string

const InvitationLetterOpeningAnimation = defineAsyncComponent(() => import('~/components/invitation/LetterOpeningAnimation.vue'))

const { invitation, pending, error, isSaving, submitError, submitSuccess, submit: submitRsvp } = await useInvitation(token)
const { startInvitationMusic, queueInvitationMusicUnlock } = useInvitationMusic()

const showOpeningAnimation = ref(false)
const hasPlayedOpeningAnimation = ref(false)
const hasAnimatedCards = ref(false)
const detailsCardRef = ref<HTMLElement | null>(null)

watch(
  invitation,
  (currentInvitation) => {
    if (!currentInvitation) {
      return
    }

    if (import.meta.client && !hasPlayedOpeningAnimation.value) {
      hasPlayedOpeningAnimation.value = true
      showOpeningAnimation.value = true

      void startInvitationMusic().then((hasStarted) => {
        if (!hasStarted) {
          queueInvitationMusicUnlock()
        }
      })
    }
  },
  { immediate: true },
)

function handleOpeningAnimationComplete() {
  showOpeningAnimation.value = false
}

async function animateCardsIn() {
  if (!import.meta.client || hasAnimatedCards.value) {
    return
  }

  await nextTick()

  const cards = [detailsCardRef.value].filter((card): card is HTMLElement => Boolean(card))

  if (!cards.length) {
    return
  }

  gsap.killTweensOf(cards)
  gsap.fromTo(
    cards,
    {
      opacity: 0,
      y: 34,
      scale: 0.975,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.9,
      stagger: 0.14,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
    },
  )

  hasAnimatedCards.value = true
}

watch(
  [invitation, showOpeningAnimation],
  async ([currentInvitation, isOpening]) => {
    if (!currentInvitation) {
      hasAnimatedCards.value = false
      return
    }

    if (isOpening) {
      hasAnimatedCards.value = false
      return
    }

    await animateCardsIn()
  },
  { flush: 'post' },
)
</script>

<template>
  <main class="relative min-h-screen px-6 py-10 sm:py-14">
    <InvitationFloralDecoration />
    <InvitationLetterOpeningAnimation
      v-if="invitation && showOpeningAnimation"
      :guest-name="invitation.displayName"
      :event-name="config.public.eventName"
      :event-date="config.public.eventDate"
      :event-time="config.public.eventTime"
      :event-venue="config.public.eventVenue"
      @complete="handleOpeningAnimationComplete"
    />

    <div class="relative z-10 mx-auto max-w-2xl">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 rounded-full border border-blush bg-white/80 px-4 py-2 text-sm font-medium text-cocoa shadow-sm backdrop-blur transition hover:border-wine hover:text-wine"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/>
          <path d="M12 19l-7-7 7-7"/>
        </svg>
        Volver a la pantalla inicial
      </NuxtLink>

      <div v-if="pending && !invitation" class="mt-8 rounded-[2rem] border border-white/70 bg-white/80 p-8 text-center shadow-glow backdrop-blur">
        <p class="text-lg font-medium text-cocoa">
          Cargando invitacion...
        </p>
      </div>

      <div v-else-if="error || !invitation" class="mt-8 rounded-[2rem] border border-rose-200 bg-white/80 p-8 shadow-glow backdrop-blur">
        <p class="text-sm uppercase tracking-[0.35em] text-rose-600">
          Invitacion no encontrada
        </p>
        <h1 class="mt-4 font-display text-4xl text-cocoa">
          No encontramos este enlace
        </h1>
        <p class="mt-4 max-w-2xl text-base leading-7 text-stone-600">
          Este enlace no corresponde a ninguna invitacion activa. Por favor verifica que hayas ingresado tu nombre correctamente o contacta a los novios.
        </p>
      </div>

      <div v-else-if="!showOpeningAnimation" class="mt-8 flex flex-col gap-6">
        <div
          ref="detailsCardRef"
        >
          <InvitationDetailsCard
            :invitation="invitation"
            :rsvp-deadline="config.public.rsvpDeadline"
            :event-name="config.public.eventName"
            :event-date="config.public.eventDate"
          />
        </div>

        <div>
          <InvitationRsvpCard
            :invitation="invitation"
            :is-saving="isSaving"
            :submit-error="submitError"
            :submit-success="submitSuccess"
            @submit="submitRsvp"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import type { InvitationDetail, InvitationRsvpPayload } from '~/types/invitations'
import { getApiErrorMessage } from '~/utils/api-error'

const route = useRoute()
const config = useRuntimeConfig()
const token = route.params.token as string
const api = useApiClient()

const InvitationLetterOpeningAnimation = defineAsyncComponent(() => import('~/components/invitation/LetterOpeningAnimation.vue'))

const { data, pending, error } = await useFetch<{ invitation: InvitationDetail }>(`/api/invitations/${token}`, {
  key: `invitation-${token}`,
  deep: false,
})

const invitation = computed(() => data.value?.invitation ?? null)
const showOpeningAnimation = ref(false)
const isSaving = ref(false)
const submitError = ref('')
const submitSuccess = ref('')
const hasPlayedOpeningAnimation = ref(false)

watch(
  invitation,
  (currentInvitation) => {
    if (!currentInvitation) {
      return
    }

    if (import.meta.client && !hasPlayedOpeningAnimation.value) {
      hasPlayedOpeningAnimation.value = true
      showOpeningAnimation.value = true
    }
  },
  { immediate: true },
)

function handleOpeningAnimationComplete() {
  showOpeningAnimation.value = false
}

async function submitRsvp(payload: InvitationRsvpPayload) {
  if (!invitation.value) {
    return
  }

  submitError.value = ''
  submitSuccess.value = ''

  isSaving.value = true

  try {
    const response = await api.post<{ invitation: InvitationDetail; message: string }>(`/api/invitations/${token}/rsvp`, payload)

    data.value = { invitation: response.data.invitation }
    submitSuccess.value = response.data.message
  } catch (error) {
    submitError.value = getApiErrorMessage(error, 'No pudimos guardar tu respuesta.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <main class="min-h-screen px-6 py-10 sm:py-14">
    <InvitationLetterOpeningAnimation
      v-if="invitation && showOpeningAnimation"
      :guest-name="invitation.displayName"
      :event-name="config.public.eventName"
      @complete="handleOpeningAnimationComplete"
    />

    <div class="mx-auto max-w-5xl">
      <NuxtLink
        to="/"
        class="inline-flex items-center rounded-full border border-blush bg-white/80 px-4 py-2 text-sm font-medium text-cocoa shadow-sm backdrop-blur transition hover:border-wine hover:text-wine"
      >
        Cambiar nombre
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
          Revisa el nombre nuevamente desde la pantalla inicial o conecta esta ruta a Supabase para trabajar con tus invitados reales.
        </p>
      </div>

      <div
        v-else
        class="mt-8 grid gap-6 transition duration-700 ease-out lg:grid-cols-[1.1fr_0.9fr]"
        :class="showOpeningAnimation ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'"
      >
        <InvitationDetailsCard
          :invitation="invitation"
          :event-date="config.public.eventDate"
          :event-time="config.public.eventTime"
          :event-venue="config.public.eventVenue"
          :event-address="config.public.eventAddress"
          :event-map-url="config.public.eventMapUrl"
          :rsvp-deadline="config.public.rsvpDeadline"
        />

        <InvitationRsvpCard
          :invitation="invitation"
          :is-saving="isSaving"
          :submit-error="submitError"
          :submit-success="submitSuccess"
          @submit="submitRsvp"
        />
      </div>
    </div>
  </main>
</template>

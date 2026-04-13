<script setup lang="ts">
import type { Attendance, InvitationDetail } from '~/types/invitations'

const route = useRoute()
const config = useRuntimeConfig()
const token = route.params.token as string

const { data, pending, error } = await useFetch<{ invitation: InvitationDetail }>(`/api/invitations/${token}`, {
  key: `invitation-${token}`,
})

const invitation = computed(() => data.value?.invitation ?? null)
const countOptions = computed(() => Array.from({ length: invitation.value?.allowedGuests ?? 0 }, (_, index) => index + 1))
const submitLabel = computed(() => {
  if (isSaving.value) {
    return 'Guardando...'
  }

  return attendance.value === 'yes' ? 'Confirmar asistencia' : 'Enviar respuesta'
})

const attendance = ref<Attendance>('yes')
const confirmedCount = ref(1)
const phone = ref('')
const message = ref('')
const guestNamesText = ref('')
const isSaving = ref(false)
const submitError = ref('')
const submitSuccess = ref('')

watch(
  invitation,
  (currentInvitation) => {
    if (!currentInvitation) {
      return
    }

    attendance.value = currentInvitation.rsvp?.attendance ?? (currentInvitation.status === 'declined' ? 'no' : 'yes')
    confirmedCount.value = currentInvitation.rsvp?.confirmedCount ?? (currentInvitation.status === 'declined' ? 0 : Math.min(currentInvitation.allowedGuests, 1))
    phone.value = currentInvitation.rsvp?.phone ?? ''
    message.value = currentInvitation.rsvp?.message ?? ''
    guestNamesText.value = currentInvitation.rsvp?.guestNames.length
      ? currentInvitation.rsvp.guestNames.join(', ')
      : currentInvitation.namedGuests.join(', ')
  },
  { immediate: true },
)

watch(attendance, (value) => {
  if (!invitation.value) {
    return
  }

  if (value === 'no') {
    confirmedCount.value = 0
    return
  }

  if (confirmedCount.value < 1) {
    confirmedCount.value = Math.min(invitation.value.allowedGuests, 1)
  }
})

const responseSummary = computed(() => {
  if (!invitation.value?.rsvp) {
    return ''
  }

  if (invitation.value.rsvp.attendance === 'yes') {
    const label = invitation.value.rsvp.confirmedCount === 1 ? 'persona' : 'personas'
    return `Respuesta guardada para ${invitation.value.rsvp.confirmedCount} ${label}.`
  }

  return 'Respuesta guardada como no asistira.'
})

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'data' in error) {
    const data = (error as { data?: { statusMessage?: string; message?: string } }).data

    return data?.statusMessage ?? data?.message ?? fallback
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

function parseGuestNames(value: string) {
  return value
    .split(/[\n,]/)
    .map((name) => name.trim())
    .filter(Boolean)
}

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

async function submitRsvp() {
  if (!invitation.value) {
    return
  }

  submitError.value = ''
  submitSuccess.value = ''

  isSaving.value = true

  try {
    const response = await $fetch<{ invitation: InvitationDetail; message: string }>(`/api/invitations/${token}/rsvp`, {
      method: 'POST',
      body: {
        attendance: attendance.value,
        confirmedCount: attendance.value === 'yes' ? confirmedCount.value : 0,
        phone: phone.value.trim() || undefined,
        message: message.value.trim() || undefined,
        guestNames: attendance.value === 'yes' ? parseGuestNames(guestNamesText.value) : [],
      },
    })

    data.value = { invitation: response.invitation }
    submitSuccess.value = response.message
  } catch (error) {
    submitError.value = getErrorMessage(error, 'No pudimos guardar tu respuesta.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <main class="min-h-screen px-6 py-10 sm:py-14">
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

      <div v-else class="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section class="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur">
          <p class="text-sm uppercase tracking-[0.35em] text-wine/70">
            Tu invitacion
          </p>

          <h1 class="mt-5 font-display text-4xl leading-tight text-cocoa sm:text-5xl">
            {{ invitation.displayName }}
          </h1>

          <p class="mt-4 text-lg leading-8 text-stone-600">
            Nos encantaria celebrar contigo este momento tan importante. Esta pagina representa la invitacion unica para tu registro.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <span class="rounded-full bg-sand px-4 py-2 text-sm font-medium text-cocoa">
              {{ invitation.relationship }}
            </span>
            <span class="rounded-full bg-sand px-4 py-2 text-sm font-medium text-cocoa">
              {{ invitation.allowedGuests }} cupo<span v-if="invitation.allowedGuests !== 1">s</span>
            </span>
            <span class="rounded-full bg-sand px-4 py-2 text-sm font-medium text-cocoa">
              RSVP hasta {{ config.public.rsvpDeadline }}
            </span>
          </div>

          <div class="mt-8 rounded-[1.75rem] bg-sand p-6">
            <p class="text-xs uppercase tracking-[0.28em] text-stone-500">
              Invitados registrados
            </p>

            <div class="mt-4 flex flex-wrap gap-3">
              <span
                v-for="guest in invitation.namedGuests"
                :key="guest"
                class="rounded-full border border-blush bg-white px-4 py-2 text-sm text-cocoa"
              >
                {{ guest }}
              </span>
            </div>

            <p v-if="invitation.notes" class="mt-5 text-sm leading-6 text-stone-600">
              {{ invitation.notes }}
            </p>
          </div>

          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div class="rounded-[1.75rem] border border-blush/70 bg-sand/70 p-6">
              <p class="text-xs uppercase tracking-[0.25em] text-stone-500">
                Fecha
              </p>
              <p class="mt-3 font-display text-2xl text-cocoa">
                {{ config.public.eventDate }}
              </p>
            </div>

            <div class="rounded-[1.75rem] border border-blush/70 bg-sand/70 p-6">
              <p class="text-xs uppercase tracking-[0.25em] text-stone-500">
                Hora
              </p>
              <p class="mt-3 font-display text-2xl text-cocoa">
                {{ config.public.eventTime }}
              </p>
            </div>

            <div class="rounded-[1.75rem] border border-blush/70 bg-sand/70 p-6 sm:col-span-2">
              <p class="text-xs uppercase tracking-[0.25em] text-stone-500">
                Lugar
              </p>
              <p class="mt-3 text-xl font-semibold text-cocoa">
                {{ config.public.eventVenue }}
              </p>
              <p class="mt-2 text-sm leading-6 text-stone-500">
                {{ config.public.eventAddress }}
              </p>

              <a
                :href="config.public.eventMapUrl"
                target="_blank"
                rel="noreferrer"
                class="mt-5 inline-flex items-center rounded-full bg-cocoa px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-wine"
              >
                Abrir mapa
              </a>
            </div>
          </div>
        </section>

        <section class="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur">
          <p class="text-sm uppercase tracking-[0.35em] text-wine/70">
            Confirmacion RSVP
          </p>

          <h2 class="mt-4 font-display text-3xl text-cocoa">
            Responde tu asistencia
          </h2>

          <p class="mt-3 text-sm leading-6 text-stone-500">
            Este formulario guarda la confirmacion en Supabase desde las APIs del proyecto, sin exponer la base de datos al navegador.
          </p>

          <div v-if="invitation.rsvp" class="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
            <p class="text-sm font-semibold text-emerald-700">
              {{ responseSummary }}
            </p>
            <p class="mt-2 text-sm text-emerald-700/90">
              Ultima actualizacion: {{ formatSubmittedAt(invitation.rsvp.submittedAt) }}
            </p>
          </div>

          <form class="mt-6 space-y-5" @submit.prevent="submitRsvp">
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="rounded-[1.5rem] border border-blush bg-sand/60 p-4 text-sm font-medium text-cocoa transition has-[:checked]:border-wine has-[:checked]:bg-white">
                <input v-model="attendance" type="radio" value="yes" class="sr-only">
                Si, asistire
              </label>

              <label class="rounded-[1.5rem] border border-blush bg-sand/60 p-4 text-sm font-medium text-cocoa transition has-[:checked]:border-wine has-[:checked]:bg-white">
                <input v-model="attendance" type="radio" value="no" class="sr-only">
                No podre asistir
              </label>
            </div>

            <div v-if="attendance === 'yes'" class="space-y-5">
              <div>
                <label for="confirmed-count" class="block text-sm font-medium text-cocoa">
                  Cuantos cupos confirmas
                </label>

                <select
                  id="confirmed-count"
                  v-model.number="confirmedCount"
                  class="mt-3 w-full rounded-2xl border border-blush bg-sand/60 px-5 py-4 text-base text-cocoa outline-none transition focus:border-wine focus:ring-2 focus:ring-wine/20"
                >
                  <option v-for="count in countOptions" :key="count" :value="count">
                    {{ count }} asistente<span v-if="count !== 1">s</span>
                  </option>
                </select>
              </div>

              <div v-if="invitation.allowedGuests > 1">
                <label for="guest-names" class="block text-sm font-medium text-cocoa">
                  Nombres de quienes asistiran
                </label>

                <textarea
                  id="guest-names"
                  v-model="guestNamesText"
                  rows="3"
                  placeholder="Separa los nombres con comas"
                  class="mt-3 w-full rounded-2xl border border-blush bg-sand/60 px-5 py-4 text-base text-cocoa outline-none transition placeholder:text-stone-400 focus:border-wine focus:ring-2 focus:ring-wine/20"
                />
              </div>
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-cocoa">
                Telefono de contacto
              </label>

              <input
                id="phone"
                v-model="phone"
                type="tel"
                autocomplete="tel"
                placeholder="Opcional"
                class="mt-3 w-full rounded-2xl border border-blush bg-sand/60 px-5 py-4 text-base text-cocoa outline-none transition placeholder:text-stone-400 focus:border-wine focus:ring-2 focus:ring-wine/20"
              >
            </div>

            <div>
              <label for="message" class="block text-sm font-medium text-cocoa">
                Mensaje para los novios
              </label>

              <textarea
                id="message"
                v-model="message"
                rows="4"
                placeholder="Opcional"
                class="mt-3 w-full rounded-2xl border border-blush bg-sand/60 px-5 py-4 text-base text-cocoa outline-none transition placeholder:text-stone-400 focus:border-wine focus:ring-2 focus:ring-wine/20"
              />
            </div>

            <p v-if="submitError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {{ submitError }}
            </p>

            <p v-if="submitSuccess" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {{ submitSuccess }}
            </p>

            <button
              type="submit"
              :disabled="isSaving"
              class="inline-flex w-full items-center justify-center rounded-2xl bg-wine px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-cocoa disabled:cursor-not-allowed disabled:opacity-70"
            >
              {{ submitLabel }}
            </button>
          </form>
        </section>
      </div>
    </div>
  </main>
</template>

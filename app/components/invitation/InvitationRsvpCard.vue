<script setup lang="ts">
import { SelectValue } from 'reka-ui'
import Select from '~/components/ui/select/Select.vue'
import SelectContent from '~/components/ui/select/SelectContent.vue'
import SelectItem from '~/components/ui/select/SelectItem.vue'
import SelectTrigger from '~/components/ui/select/SelectTrigger.vue'
import type { Attendance, InvitationDetail, InvitationRsvpPayload } from '~/types/invitations'

const props = defineProps<{
  invitation: InvitationDetail
  isSaving: boolean
  submitError: string
  submitSuccess: string
}>()

const emit = defineEmits<{
  submit: [payload: InvitationRsvpPayload]
}>()

const attendance = ref<Attendance>('yes')
const confirmedCount = ref(1)
const phone = ref('')
const message = ref('')
const guestNamesText = ref('')

const countOptions = computed(() => Array.from({ length: props.invitation.allowedGuests }, (_, index) => index + 1))

const confirmedCountValue = computed({
  get: () => String(confirmedCount.value),
  set: (value: string) => {
    const nextValue = Number(value)

    confirmedCount.value = Number.isFinite(nextValue)
      ? nextValue
      : Math.min(props.invitation.allowedGuests, 1)
  },
})

const submitLabel = computed(() => {
  if (props.isSaving) {
    return 'Guardando...'
  }

  return attendance.value === 'yes' ? 'Confirmar asistencia' : 'Enviar respuesta'
})

const responseSummary = computed(() => {
  if (!props.invitation.rsvp) {
    return ''
  }

  if (props.invitation.rsvp.attendance === 'yes') {
    const label = props.invitation.rsvp.confirmedCount === 1 ? 'persona' : 'personas'
    return `Respuesta guardada para ${props.invitation.rsvp.confirmedCount} ${label}.`
  }

  return 'Respuesta guardada como no asistira.'
})

watch(
  () => props.invitation,
  (currentInvitation) => {
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
  if (value === 'no') {
    confirmedCount.value = 0
    return
  }

  if (confirmedCount.value < 1) {
    confirmedCount.value = Math.min(props.invitation.allowedGuests, 1)
  }
})

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

function submitRsvp() {
  emit('submit', {
    attendance: attendance.value,
    confirmedCount: attendance.value === 'yes' ? confirmedCount.value : 0,
    phone: phone.value.trim() || undefined,
    message: message.value.trim() || undefined,
    guestNames: attendance.value === 'yes' ? parseGuestNames(guestNamesText.value) : [],
  })
}
</script>

<template>
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

          <Select v-model="confirmedCountValue">
            <SelectTrigger id="confirmed-count" class="mt-3">
              <SelectValue placeholder="Selecciona los cupos" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem v-for="count in countOptions" :key="count" :value="String(count)">
                {{ count }} asistente<span v-if="count !== 1">s</span>
              </SelectItem>
            </SelectContent>
          </Select>
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
</template>
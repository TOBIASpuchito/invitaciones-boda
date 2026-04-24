<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SelectValue } from 'reka-ui'
import Select from '~/components/ui/select/Select.vue'
import SelectContent from '~/components/ui/select/SelectContent.vue'
import SelectItem from '~/components/ui/select/SelectItem.vue'
import SelectTrigger from '~/components/ui/select/SelectTrigger.vue'
import { useInvitationScrollReveal } from '~/composables/useInvitationScrollReveal'
import type { Attendance, InvitationDetail, InvitationRsvpPayload } from '~/types/invitations'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps<{
  invitation: InvitationDetail
  isSaving: boolean
  submitError: string
  submitSuccess: string
}>()

const emit = defineEmits<{
  submit: [payload: InvitationRsvpPayload]
}>()

const sectionRef = ref<HTMLElement | null>(null)
const successOverlayRef = ref<HTMLElement | null>(null)
const lastSubmitWasYes = ref(true)
let cardEntranceContext: gsap.Context | null = null
let successTl: gsap.core.Timeline | null = null

const attendance = ref<Attendance>('yes')
const confirmedCount = ref(1)
const phone = ref('')
const message = ref('')
const guestNamesText = ref('')
const haveChanges = ref(false)

const normalizedGuestNames = computed(() => parseGuestNames(guestNamesText.value))

const currentPayload = computed<InvitationRsvpPayload>(() => ({
  attendance: attendance.value,
  confirmedCount: attendance.value === 'yes' ? confirmedCount.value : 0,
  phone: phone.value.trim() || undefined,
  message: message.value.trim() || undefined,
  guestNames: attendance.value === 'yes' ? normalizedGuestNames.value : [],
}))

const initialPayload = computed<InvitationRsvpPayload>(() => ({
  attendance: props.invitation.rsvp?.attendance ?? (props.invitation.status === 'declined' ? 'no' : 'yes'),
  confirmedCount: props.invitation.rsvp?.attendance === 'yes'
    ? props.invitation.rsvp.confirmedCount
    : (props.invitation.status === 'declined' ? 0 : Math.min(props.invitation.allowedGuests, 1)),
  phone: props.invitation.rsvp?.phone?.trim() || undefined,
  message: props.invitation.rsvp?.message?.trim() || undefined,
  guestNames: (props.invitation.rsvp?.guestNames.length
    ? props.invitation.rsvp.guestNames
    : props.invitation.namedGuests).map(name => name.trim()).filter(Boolean),
}))

const isSubmitDisabled = computed(() => props.isSaving || !haveChanges.value)

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

  return 'Respuesta guardada como no asistirá.'
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

watch(
  [currentPayload, initialPayload],
  ([currentValue, initialValue]) => {
    haveChanges.value = JSON.stringify(currentValue) !== JSON.stringify(initialValue)
  },
  { immediate: true },
)

watch(() => props.submitSuccess, (val) => {
  if (!val || !import.meta.client || !successOverlayRef.value) return

  const overlay = successOverlayRef.value
  const icon = overlay.querySelector<HTMLElement>('.s-icon')
  const texts = overlay.querySelectorAll<HTMLElement>('.s-text')

  successTl?.kill()
  successTl = gsap.timeline()
  successTl.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: 'power2.out' })
  successTl.fromTo(
    icon,
    { scale: 0, rotation: -20, autoAlpha: 0 },
    { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.8)' },
    '-=0.15',
  )
  successTl.fromTo(
    Array.from(texts),
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12, ease: 'power3.out' },
    '-=0.35',
  )
  successTl.to(overlay, { autoAlpha: 0, duration: 0.6, ease: 'power2.in', delay: 3 })
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
  if (isSubmitDisabled.value) {
    return
  }

  lastSubmitWasYes.value = attendance.value === 'yes'
  emit('submit', {
    ...currentPayload.value,
  })
}

useInvitationScrollReveal(sectionRef)

onMounted(() => {
  if (!import.meta.client || !sectionRef.value) {
    return
  }

  cardEntranceContext = gsap.context(() => {
    gsap.set(sectionRef.value, {
      autoAlpha: 0,
      y: 44,
      scale: 0.985,
      transformOrigin: '50% 50%',
      willChange: 'transform, opacity',
    })

    gsap.to(sectionRef.value, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 1,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility,willChange',
      immediateRender: false,
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top 88%',
        toggleActions: 'play none none none',
        once: true,
        invalidateOnRefresh: true,
        refreshPriority: 30,
      },
    })
  }, sectionRef)

  ScrollTrigger.refresh()
})

onBeforeUnmount(() => {
  cardEntranceContext?.revert()
  successTl?.kill()
  cardEntranceContext = null
  successTl = null
})
</script>

<template>
  <section ref="sectionRef" class="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur">

    <!-- Overlay de éxito -->
    <div ref="successOverlayRef" class="success-overlay">
      <div class="s-icon">
        <svg viewBox="0 0 72 72" fill="none">
          <circle cx="36" cy="36" r="34" fill="rgba(74,40,48,0.06)" stroke="rgba(140,50,70,0.18)" stroke-width="1.5"/>
          <path d="M22 36 L31 46 L50 26" stroke="#4a2830" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <p class="s-heading s-text">{{ lastSubmitWasYes ? '¡Asistencia confirmada!' : 'Gracias por avisarnos' }}</p>
      <p class="s-sub s-text">{{ lastSubmitWasYes ? 'Cindy y Marcelo están muy felices de contar contigo en este día tan especial' : 'Cindy y Marcelo te echan de menos, pero lo entienden con mucho cariño' }}</p>
    </div>

    <p data-reveal class="text-sm uppercase tracking-[0.35em] text-wine/70">
      Confirmación RSVP
    </p>

    <h2 data-reveal data-reveal-delay="0.04" class="mt-4 font-display text-3xl text-cocoa">
      ¿Podrás acompañarnos?
    </h2>

    <p data-reveal data-reveal-delay="0.08" class="mt-3 text-sm leading-6 text-stone-500">
      Tu respuesta nos ayuda a organizar el día con todo el cariño que merece.
    </p>

    <div v-if="invitation.rsvp" data-reveal class="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
      <p class="text-sm font-semibold text-emerald-700">
        {{ responseSummary }}
      </p>
      <p class="mt-2 text-sm text-emerald-700/90">
        Última actualización: {{ formatSubmittedAt(invitation.rsvp.submittedAt) }}
      </p>
    </div>

    <form class="mt-6 space-y-5" @submit.prevent="submitRsvp">
      <div data-reveal class="att-grid">
        <label class="att-card" :class="{ 'att-card--yes': attendance === 'yes' }">
          <input v-model="attendance" type="radio" value="yes" class="sr-only">
          <span class="att-icon att-icon--yes">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </span>
          <span class="att-label">Sí, estaré</span>
          <span class="att-sub">¡Con mucho gusto!</span>
          <span v-if="attendance === 'yes'" class="att-check" aria-hidden="true">✓</span>
        </label>

        <label class="att-card" :class="{ 'att-card--no': attendance === 'no' }">
          <input v-model="attendance" type="radio" value="no" class="sr-only">
          <span class="att-icon att-icon--no">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </span>
          <span class="att-label">No podré asistir</span>
          <span class="att-sub">Estarás en nuestros corazones</span>
          <span v-if="attendance === 'no'" class="att-check" aria-hidden="true">✓</span>
        </label>
      </div>

      <div v-if="attendance === 'yes'" class="space-y-5">
        <div data-reveal>
          <label for="confirmed-count" class="block text-sm font-medium text-cocoa">
            Cuántos cupos confirmas
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

        <div v-if="invitation.allowedGuests > 1" data-reveal>
          <label for="guest-names" class="block text-sm font-medium text-cocoa">
            Nombres de quienes asistirán
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

      <div data-reveal>
        <label for="phone" class="block text-sm font-medium text-cocoa">
          Teléfono de contacto
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

      <div data-reveal>
        <label for="message" class="block text-sm font-medium text-cocoa">
          Mensaje para Cindy y Marcelo
        </label>

        <textarea
          id="message"
          v-model="message"
          rows="4"
          placeholder="Opcional"
          class="mt-3 w-full rounded-2xl border border-blush bg-sand/60 px-5 py-4 text-base text-cocoa outline-none transition placeholder:text-stone-400 focus:border-wine focus:ring-2 focus:ring-wine/20"
        />
      </div>

      <p v-if="submitError" data-reveal class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ submitError }}
      </p>

      <p v-if="submitSuccess" data-reveal class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {{ submitSuccess }}
      </p>

      <button
        data-reveal
        type="submit"
        :disabled="isSubmitDisabled"
        class="inline-flex w-full items-center justify-center rounded-2xl bg-wine px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-cocoa disabled:cursor-not-allowed disabled:opacity-70"
      >
        {{ submitLabel }}
      </button>
    </form>
  </section>
</template>

<style scoped>
/* ── success overlay ───────────────────────────────────────── */
.success-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
  padding: 2.5rem 2rem;
  background: rgba(253, 248, 246, 0.96);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: 2rem;
  /* GSAP autoAlpha controls visibility + opacity */
  visibility: hidden;
  opacity: 0;
}

.s-icon {
  width: 5.5rem;
  height: 5.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.s-icon svg {
  width: 100%;
  height: 100%;
}

.s-heading {
  font-family: var(--font-display, Georgia, serif);
  font-size: 1.6rem;
  line-height: 1.2;
  color: #4a2830;
}

.s-sub {
  font-size: 0.88rem;
  line-height: 1.65;
  color: rgba(74, 40, 48, 0.58);
  max-width: 22rem;
}

/* ── attendance cards ──────────────────────────────────────── */
.att-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.att-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 1.35rem 0.75rem 1.1rem;
  border-radius: 1.5rem;
  border: 1.5px solid rgba(222, 195, 193, 0.6);
  background: rgba(252, 244, 242, 0.5);
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
}

.att-card:hover {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 18px rgba(120, 60, 70, 0.09);
}

.att-card--yes {
  border-color: rgba(140, 50, 65, 0.45);
  background: #ffffff;
  box-shadow: 0 4px 22px rgba(140, 50, 65, 0.1);
}

.att-card--no {
  border-color: rgba(100, 100, 120, 0.32);
  background: #ffffff;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
}

.att-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.2rem;
  transition: transform 0.2s ease;
}

.att-card:hover .att-icon {
  transform: scale(1.1);
}

.att-icon--yes {
  background: rgba(180, 60, 80, 0.1);
  color: rgba(140, 40, 60, 0.85);
}

.att-icon--no {
  background: rgba(100, 100, 120, 0.08);
  color: rgba(80, 80, 105, 0.65);
}

.att-icon svg {
  width: 1.1rem;
  height: 1.1rem;
}

.att-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #4a2830;
  line-height: 1.3;
}

.att-sub {
  font-size: 0.66rem;
  color: rgba(100, 70, 75, 0.52);
  line-height: 1.4;
}

.att-check {
  position: absolute;
  top: 0.6rem;
  right: 0.7rem;
  font-size: 0.68rem;
  font-weight: 700;
  color: rgba(140, 50, 65, 0.75);
}
</style>
<script setup lang="ts">
import type { InvitationDetail } from '~/types/invitations'
import { useInvitationScrollReveal } from '~/composables/useInvitationScrollReveal'

defineProps<{
  invitation: InvitationDetail
  rsvpDeadline: string
}>()

const sectionRef = ref<HTMLElement | null>(null)

useInvitationScrollReveal(sectionRef)
</script>

<template>
  <section ref="sectionRef" class="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur">
    <p data-reveal data-reveal-delay="0" class="text-sm uppercase tracking-[0.35em] text-wine/70">
      Tu invitacion
    </p>

    <h1 data-reveal data-reveal-delay="0.04" class="mt-5 font-display text-4xl leading-tight text-cocoa sm:text-5xl">
      {{ invitation.displayName }}
    </h1>

    <p data-reveal data-reveal-delay="0.08" class="mt-4 text-lg leading-8 text-stone-600">
      Cindy y Marcelo tienen el honor de invitarte a celebrar el dia mas especial de sus vidas. Esta pagina es tu invitacion personal.
    </p>

    <blockquote data-reveal data-reveal-delay="0.12" class="mt-6 border-l-2 border-wine/30 pl-5 space-y-2">
      <p class="text-sm leading-7 text-stone-500 italic">Hace 12 años el destino unió a Cindy y Marcelo&hellip;</p>
      <p class="text-sm leading-7 text-stone-500 italic">y desde entonces, no han dejado de elegirse el uno al otro.</p>
      <p class="text-sm leading-7 text-stone-500 italic">Construyeron juntos una familia, un hogar y un amor que los transformó.</p>
      <p class="text-sm leading-7 text-stone-500 italic">Y ahora, dan el paso definitivo: unir sus vidas para siempre.</p>
      <p class="text-sm leading-7 text-stone-500 italic">Este no es solo su día, es la celebración de una historia que sigue creciendo.</p>
    </blockquote>

    <div data-reveal class="mt-8 rounded-[1.75rem] border border-white/70 bg-white/60 px-6 py-5 shadow-sm backdrop-blur">
      <InvitationWeddingCountdown />
    </div>

    <div data-reveal class="mt-8 flex flex-wrap gap-3">
      <span class="rounded-full bg-sand px-4 py-2 text-sm font-medium text-cocoa">
        {{ invitation.relationship }}
      </span>
      <span class="rounded-full bg-sand px-4 py-2 text-sm font-medium text-cocoa">
        {{ invitation.allowedGuests }} cupo<span v-if="invitation.allowedGuests !== 1">s</span>
      </span>
      <span class="rounded-full bg-sand px-4 py-2 text-sm font-medium text-cocoa">
        RSVP hasta {{ rsvpDeadline }}
      </span>
    </div>

    <div data-reveal class="mt-8 rounded-[1.75rem] bg-sand p-6">
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

    <!-- Widgets animados de detalles del evento -->
    <div class="detail-widgets mt-6 grid gap-4 sm:grid-cols-2">

      <!-- Fecha -->
      <div data-reveal data-reveal-delay="0" class="widget widget--date">
        <div class="widget-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="3" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <p class="widget-label">Fecha</p>
        <p class="widget-value">25 de julio de 2026</p>
        <div class="widget-ring" />
      </div>

      <!-- Hora -->
      <div data-reveal data-reveal-delay="0.08" class="widget widget--time">
        <div class="widget-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15.5 15.5" />
          </svg>
        </div>
        <p class="widget-label">Hora de inicio</p>
        <p class="widget-value">14h00</p>
        <div class="widget-ring" />
      </div>

      <!-- Lugar -->
      <div data-reveal data-reveal-delay="0.16" class="widget widget--venue sm:col-span-2">
        <div class="widget-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        </div>
        <p class="widget-label">Lugar</p>
        <p class="widget-value">Quinta Boutique Kristal</p>
        <p class="mt-1 text-sm leading-6 text-stone-500">Principal de San Francisco de Alpahuma. Valle de los Chillos &mdash; Quito</p>
        <a
          href="https://www.google.com/maps/place/Quinta+Krystal+Hotel+Boutique/@-0.3423903,-78.4017385,17z/data=!3m1!4b1!4m9!3m8!1s0x91d5bde0cde41817:0xe919a005646f845d!5m2!4m1!1i2!8m2!3d-0.3423903!4d-78.4017385!16s%2Fg%2F11hf8477wj?entry=tts"
          target="_blank"
          rel="noreferrer"
          class="map-btn mt-4"
        >
          <svg class="map-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          Abrir en Google Maps
        </a>
        <div class="widget-ring" />
      </div>

    </div>

    <div data-reveal>
      <InvitationGiftSection />
    </div>
  </section>
</template>

<style scoped>
/* ── base widget ──────────────────────────────────────────── */
.widget {
  position: relative;
  overflow: hidden;
  border-radius: 1.75rem;
  border: 1px solid rgba(222, 195, 193, 0.55);
  background: linear-gradient(145deg, #ffffff 0%, #fdf6f4 100%);
  padding: 1.5rem;
  will-change: transform, opacity;
  box-shadow:
    0 2px 12px rgba(120, 60, 70, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.widget:hover {
  transform: translateY(-3px);
  box-shadow:
    0 8px 28px rgba(120, 60, 70, 0.12),
    0 2px 6px rgba(0, 0, 0, 0.06);
}

/* ── decorative animated ring in corner ──────────────────── */
.widget-ring {
  position: absolute;
  bottom: -2rem;
  right: -2rem;
  width: 7rem;
  height: 7rem;
  border-radius: 50%;
  border: 1.5px solid rgba(180, 100, 110, 0.10);
  animation: ringPulse 3.5s ease-in-out infinite;
  pointer-events: none;
}

.widget-ring::before {
  content: '';
  position: absolute;
  inset: 18%;
  border-radius: 50%;
  border: 1px solid rgba(180, 100, 110, 0.08);
  animation: ringPulse 3.5s ease-in-out 0.6s infinite;
}

@keyframes ringPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.06); }
}

/* ── icon ─────────────────────────────────────────────────── */
.widget-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.75rem;
  background: rgba(180, 80, 90, 0.08);
  color: rgba(140, 50, 65, 0.8);
  margin-bottom: 0.85rem;
}

.widget-icon svg {
  width: 1.1rem;
  height: 1.1rem;
}

.widget-icon--large {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 0.9rem;
  flex-shrink: 0;
  align-self: flex-start;
}

.widget-icon--large svg {
  width: 1.3rem;
  height: 1.3rem;
}

/* ── venue layout ─────────────────────────────────────────── */
.widget--venue {
  display: block;
}

/* ── typography ───────────────────────────────────────────── */
.widget-label {
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: rgba(100, 70, 75, 0.55);
}

.widget-value {
  margin-top: 0.45rem;
  font-family: var(--font-display, Georgia, serif);
  font-size: 1.35rem;
  line-height: 1.2;
  color: #4a2830;
}

/* ── map button ───────────────────────────────────────────── */
.map-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.15rem;
  border-radius: 9999px;
  background: #4a2830;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background 0.2s, transform 0.15s;
}

.map-btn:hover {
  background: #7a1f35;
  transform: translateY(-1px);
}

.map-btn-icon {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
}
</style>
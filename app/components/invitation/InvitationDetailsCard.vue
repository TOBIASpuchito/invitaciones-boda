<script setup lang="ts">
import type { InvitationDetail } from '~/types/invitations'

defineProps<{
  invitation: InvitationDetail
  eventDate: string
  eventTime: string
  eventVenue: string
  eventAddress: string
  eventMapUrl: string
  rsvpDeadline: string
}>()
</script>

<template>
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
        RSVP hasta {{ rsvpDeadline }}
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
          {{ eventDate }}
        </p>
      </div>

      <div class="rounded-[1.75rem] border border-blush/70 bg-sand/70 p-6">
        <p class="text-xs uppercase tracking-[0.25em] text-stone-500">
          Hora
        </p>
        <p class="mt-3 font-display text-2xl text-cocoa">
          {{ eventTime }}
        </p>
      </div>

      <div class="rounded-[1.75rem] border border-blush/70 bg-sand/70 p-6 sm:col-span-2">
        <p class="text-xs uppercase tracking-[0.25em] text-stone-500">
          Lugar
        </p>
        <p class="mt-3 text-xl font-semibold text-cocoa">
          {{ eventVenue }}
        </p>
        <p class="mt-2 text-sm leading-6 text-stone-500">
          {{ eventAddress }}
        </p>

        <a
          :href="eventMapUrl"
          target="_blank"
          rel="noreferrer"
          class="mt-5 inline-flex items-center rounded-full bg-cocoa px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-wine"
        >
          Abrir mapa
        </a>
      </div>
    </div>
  </section>
</template>
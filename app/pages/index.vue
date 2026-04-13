<script setup lang="ts">
import type { InvitationStatus, InvitationSummary } from '~/types/invitations'

const config = useRuntimeConfig()

const guestName = ref('')
const isSearching = ref(false)
const hasSearched = ref(false)
const searchError = ref('')
const results = ref<InvitationSummary[]>([])

async function searchInvitations() {
  const query = guestName.value.trim()

  searchError.value = ''

  if (query.length < 2) {
    searchError.value = 'Escribe al menos nombre y apellido para continuar.'
    return
  }

  isSearching.value = true

  try {
    const response = await $fetch<{ results: InvitationSummary[] }>('/api/invitations/search', {
      method: 'POST',
      body: { query },
    })

    results.value = response.results
    hasSearched.value = true
  } catch (error) {
    searchError.value = getErrorMessage(error, 'No pudimos buscar tu invitacion.')
  } finally {
    isSearching.value = false
  }
}

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

function statusLabel(status: InvitationStatus) {
  if (status === 'confirmed') {
    return 'Confirmada'
  }

  if (status === 'declined') {
    return 'No asistira'
  }

  return 'Pendiente'
}

function statusClass(status: InvitationStatus) {
  if (status === 'confirmed') {
    return 'bg-emerald-100 text-emerald-700'
  }

  if (status === 'declined') {
    return 'bg-stone-200 text-stone-700'
  }

  return 'bg-amber-100 text-amber-700'
}
</script>

<template>
  <main class="relative min-h-screen overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(222,195,193,0.55),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(169,177,157,0.25),_transparent_32%)]" />

    <section class="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 lg:flex-row lg:items-center lg:gap-16">
      <div class="max-w-2xl">
        <p class="text-sm uppercase tracking-[0.35em] text-wine/70">
          Invitacion digital
        </p>

        <h1 class="mt-5 font-display text-5xl leading-tight text-cocoa sm:text-6xl">
          {{ config.public.eventName }}
        </h1>

        <p class="mt-6 max-w-xl text-lg leading-8 text-stone-600">
          Comparte un solo enlace, identifica al invitado por nombre y carga una invitacion unica para confirmar asistencia sin salir del sitio.
        </p>

        <NuxtLink
          to="/admin"
          class="mt-6 inline-flex items-center rounded-full border border-blush bg-white/80 px-4 py-2 text-sm font-medium text-cocoa shadow-sm backdrop-blur transition hover:border-wine hover:text-wine"
        >
          Entrar como administrador
        </NuxtLink>

        <div class="mt-10 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-glow backdrop-blur sm:p-8">
          <form class="space-y-4" @submit.prevent="searchInvitations">
            <div>
              <label for="guest-name" class="block text-sm font-medium text-cocoa">
                Nombre con el que apareces en la lista
              </label>

              <input
                id="guest-name"
                v-model="guestName"
                type="text"
                autocomplete="name"
                placeholder="Ej. Jane Buenaventura"
                class="mt-3 w-full rounded-2xl border border-blush bg-sand/60 px-5 py-4 text-base text-cocoa outline-none transition placeholder:text-stone-400 focus:border-wine focus:ring-2 focus:ring-wine/20"
              >
            </div>

            <button
              type="submit"
              :disabled="isSearching"
              class="inline-flex w-full items-center justify-center rounded-2xl bg-wine px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-cocoa disabled:cursor-not-allowed disabled:opacity-70"
            >
              {{ isSearching ? 'Buscando...' : 'Buscar mi invitacion' }}
            </button>

            <p v-if="searchError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {{ searchError }}
            </p>

            <p v-if="!config.public.usingSupabase" class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Modo demo activo. La app esta funcionando con invitados de ejemplo hasta conectar Supabase.
            </p>
          </form>
        </div>
      </div>

      <div class="mt-12 w-full max-w-xl lg:mt-0">
        <div class="rounded-[2rem] border border-white/70 bg-white/75 p-8 shadow-glow backdrop-blur">
          <p class="text-sm uppercase tracking-[0.35em] text-wine/70">
            Vista base del MVP
          </p>

          <div class="mt-8 grid gap-4 sm:grid-cols-2">
            <div class="rounded-2xl bg-sand p-5">
              <p class="text-xs uppercase tracking-[0.25em] text-stone-500">
                Fecha
              </p>
              <p class="mt-3 font-display text-2xl text-cocoa">
                {{ config.public.eventDate }}
              </p>
            </div>

            <div class="rounded-2xl bg-sand p-5">
              <p class="text-xs uppercase tracking-[0.25em] text-stone-500">
                Hora
              </p>
              <p class="mt-3 font-display text-2xl text-cocoa">
                {{ config.public.eventTime }}
              </p>
            </div>

            <div class="rounded-2xl bg-sand p-5 sm:col-span-2">
              <p class="text-xs uppercase tracking-[0.25em] text-stone-500">
                Lugar
              </p>
              <p class="mt-3 text-lg font-semibold text-cocoa">
                {{ config.public.eventVenue }}
              </p>
              <p class="mt-2 text-sm text-stone-500">
                {{ config.public.eventAddress }}
              </p>
            </div>

            <div class="rounded-2xl bg-cocoa p-5 text-white sm:col-span-2">
              <p class="text-xs uppercase tracking-[0.25em] text-white/60">
                RSVP
              </p>
              <p class="mt-3 text-lg font-medium leading-7">
                Cada resultado abre una ruta unica por token y guarda la respuesta del invitado sin exponer la base al cliente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="hasSearched" class="relative mx-auto max-w-6xl px-6 pb-16">
      <div class="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-glow backdrop-blur sm:p-8">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.35em] text-wine/70">
              Resultados
            </p>
            <h2 class="mt-3 font-display text-3xl text-cocoa">
              Selecciona tu invitacion
            </h2>
            <p class="mt-2 text-sm text-stone-500">
              Si no te encuentras, luego podemos sumar una pantalla de ayuda o contacto directo por WhatsApp.
            </p>
          </div>

          <div class="rounded-full bg-sand px-4 py-2 text-sm font-medium text-cocoa">
            {{ results.length }} coincidencia<span v-if="results.length !== 1">s</span>
          </div>
        </div>

        <div v-if="results.length > 0" class="mt-8 grid gap-4 md:grid-cols-2">
          <article
            v-for="invitation in results"
            :key="invitation.token"
            class="rounded-[1.75rem] border border-blush/70 bg-sand/70 p-6"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs uppercase tracking-[0.28em] text-wine/70">
                  {{ invitation.relationship }}
                </p>
                <h3 class="mt-3 font-display text-2xl leading-tight text-cocoa">
                  {{ invitation.displayName }}
                </h3>
              </div>

              <span
                class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                :class="statusClass(invitation.status)"
              >
                {{ statusLabel(invitation.status) }}
              </span>
            </div>

            <p class="mt-5 text-sm text-stone-500">
              Cupos reservados: {{ invitation.allowedGuests }}
            </p>

            <p v-if="invitation.notes" class="mt-2 text-sm leading-6 text-stone-600">
              {{ invitation.notes }}
            </p>

            <NuxtLink
              :to="`/invitacion/${invitation.token}`"
              class="mt-6 inline-flex items-center rounded-full bg-cocoa px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-wine"
            >
              Ver invitacion
            </NuxtLink>
          </article>
        </div>

        <div v-else class="mt-8 rounded-[1.75rem] border border-dashed border-blush bg-sand/60 p-8 text-center">
          <p class="text-lg font-medium text-cocoa">
            No encontramos coincidencias con ese nombre.
          </p>
          <p class="mt-2 text-sm text-stone-500">
            En la siguiente iteracion podemos agregar alias, telefono o busqueda mas flexible para evitar errores de escritura.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

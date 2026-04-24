<script setup lang="ts">
const config = useRuntimeConfig()
const { prepareInvitationMusic, stopInvitationMusic } = useInvitationMusic()
const { guestName, isSearching, error: searchError, search: searchInvitations } = useInvitationSearch()

onMounted(() => {
  stopInvitationMusic()
  prepareInvitationMusic()
})
</script>

<template>
  <main class="relative min-h-screen overflow-hidden text-center">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(222,195,193,0.55),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(169,177,157,0.25),_transparent_32%)]" />

    <section class="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 lg:flex-row lg:items-center lg:gap-16">
      <div class="max-w-2xl">
        <p class="text-sm uppercase tracking-[0.35em] text-wine/70">
          Boda de: 
        </p>

        <h1 class="mt-5 font-display text-5xl leading-tight text-cocoa sm:text-6xl">
          {{ config.public.eventName }}
        </h1>

        <p class="mt-6 max-w-xl text-lg leading-8 text-stone-600">
          Escribe tu nombre y apellido para encontrar tu invitación y confirmar tu asistencia en un solo paso.
        </p>

        <div class="mt-10 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-glow backdrop-blur sm:p-8">
          <form class="space-y-4" @submit.prevent="searchInvitations">
            <div>
              <label for="guest-name" class="block text-sm font-medium text-cocoa">
                Nombre y apellido
              </label>

              <input
                id="guest-name"
                v-model="guestName"
                type="text"
                autocomplete="name"
                placeholder="Ej. Jean Buenaventura"
                class="mt-3 w-full rounded-2xl border border-blush bg-sand/60 px-5 py-4 text-base text-cocoa outline-none transition placeholder:text-stone-400 focus:border-wine focus:ring-2 focus:ring-wine/20"
              >
            </div>

            <button
              type="submit"
              :disabled="isSearching"
              class="inline-flex w-full items-center justify-center rounded-2xl bg-wine px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-cocoa disabled:cursor-not-allowed disabled:opacity-70"
            >
              {{ isSearching ? 'Buscando...' : 'Buscar mi invitación' }}
            </button>

            <p v-if="searchError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {{ searchError }}
            </p>


          </form>
        </div>
      </div>

      <div class="mt-12 w-full max-w-xl lg:mt-0">
        <div class="rounded-[2rem] border border-white/70 bg-white/75 p-8 shadow-glow backdrop-blur">
          <p class="text-sm uppercase tracking-[0.35em] text-wine/70">
            Los detalles de la boda
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
                Si encontramos tu nombre, te llevaremos directo a tu invitación para confirmar asistencia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

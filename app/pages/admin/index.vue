<script setup lang="ts">
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const { data: session } = await useFetch<{ authenticated: boolean }>('/api/admin/session', {
  key: 'admin-session',
})

if (session.value?.authenticated) {
  await navigateTo('/admin/dashboard')
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

async function login() {
  errorMessage.value = ''
  isLoading.value = true

  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: {
        password: password.value,
      },
    })

    await navigateTo('/admin/dashboard')
  } catch (error) {
    errorMessage.value = getErrorMessage(error, 'No se pudo iniciar sesion.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="relative min-h-screen overflow-hidden px-6 py-10 sm:py-14">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(222,195,193,0.5),_transparent_38%),linear-gradient(135deg,_rgba(252,248,244,0.98),_rgba(243,236,230,0.92))]" />

    <div class="relative mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section class="rounded-[2rem] border border-white/80 bg-white/70 p-8 shadow-glow backdrop-blur sm:p-10">
        <p class="text-sm uppercase tracking-[0.35em] text-wine/70">
          Portal admin
        </p>

        <h1 class="mt-5 font-display text-4xl leading-tight text-cocoa sm:text-5xl">
          Acceso al tablero de invitados
        </h1>

        <p class="mt-5 max-w-xl text-base leading-8 text-stone-600">
          Desde aqui puedes revisar quienes ya confirmaron, quienes declinaron y los mensajes que dejaron al responder el RSVP.
        </p>

        <div class="mt-8 grid gap-4 sm:grid-cols-3">
          <div class="rounded-[1.5rem] bg-sand p-5">
            <p class="text-xs uppercase tracking-[0.25em] text-stone-500">
              Flujo
            </p>
            <p class="mt-3 text-lg font-semibold text-cocoa">
              Login rapido
            </p>
          </div>

          <div class="rounded-[1.5rem] bg-sand p-5">
            <p class="text-xs uppercase tracking-[0.25em] text-stone-500">
              Datos
            </p>
            <p class="mt-3 text-lg font-semibold text-cocoa">
              Invitados y RSVP
            </p>
          </div>

          <div class="rounded-[1.5rem] bg-cocoa p-5 text-white">
            <p class="text-xs uppercase tracking-[0.25em] text-white/60">
              Fuente
            </p>
            <p class="mt-3 text-lg font-semibold text-white">
              Supabase en vivo
            </p>
          </div>
        </div>
      </section>

      <section class="rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-glow backdrop-blur sm:p-10">
        <p class="text-sm uppercase tracking-[0.35em] text-wine/70">
          Iniciar sesion
        </p>

        <form class="mt-6 space-y-5" @submit.prevent="login">
          <div>
            <label for="admin-password" class="block text-sm font-medium text-cocoa">
              Clave de administrador
            </label>

            <input
              id="admin-password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="Ingresa tu clave"
              class="mt-3 w-full rounded-2xl border border-blush bg-sand/60 px-5 py-4 text-base text-cocoa outline-none transition placeholder:text-stone-400 focus:border-wine focus:ring-2 focus:ring-wine/20"
            >
          </div>

          <p v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            :disabled="isLoading"
            class="inline-flex w-full items-center justify-center rounded-2xl bg-wine px-5 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-cocoa disabled:cursor-not-allowed disabled:opacity-70"
          >
            {{ isLoading ? 'Ingresando...' : 'Entrar al dashboard' }}
          </button>
        </form>

        <NuxtLink
          to="/"
          class="mt-5 inline-flex items-center rounded-full border border-blush bg-white/80 px-4 py-2 text-sm font-medium text-cocoa shadow-sm backdrop-blur transition hover:border-wine hover:text-wine"
        >
          Volver al inicio
        </NuxtLink>
      </section>
    </div>
  </main>
</template>
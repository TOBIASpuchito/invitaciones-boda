<script setup lang="ts">
import type { AdminInvitation, InvitationStatus } from '~/types/invitations'

const searchQuery = ref('')
const statusFilter = ref<'all' | InvitationStatus>('all')
const logoutLoading = ref(false)

const { data, pending, error, refresh } = await useFetch<{ invitations: AdminInvitation[] }>('/api/admin/invitations', {
  key: 'admin-invitations',
})

if (error.value?.statusCode === 401) {
  await navigateTo('/admin')
}

watch(error, async (currentError) => {
  if (currentError?.statusCode === 401) {
    await navigateTo('/admin')
  }
})

const invitations = computed(() => data.value?.invitations ?? [])

const stats = computed(() => {
  const source = invitations.value

  return {
    total: source.length,
    confirmed: source.filter((invitation) => invitation.status === 'confirmed').length,
    declined: source.filter((invitation) => invitation.status === 'declined').length,
    pending: source.filter((invitation) => invitation.status === 'pending').length,
  }
})

const filteredInvitations = computed(() => {
  const normalizedSearch = searchQuery.value.trim().toLowerCase()

  return invitations.value.filter((invitation) => {
    const matchesStatus = statusFilter.value === 'all' || invitation.status === statusFilter.value
    const matchesSearch = !normalizedSearch
      || invitation.displayName.toLowerCase().includes(normalizedSearch)
      || invitation.relationship.toLowerCase().includes(normalizedSearch)
      || invitation.namedGuests.some((guest) => guest.toLowerCase().includes(normalizedSearch))

    return matchesStatus && matchesSearch
  })
})

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

function formatDate(value?: string | null) {
  if (!value) {
    return 'Sin respuesta'
  }

  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

async function logout() {
  logoutLoading.value = true

  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
    await navigateTo('/admin')
  } finally {
    logoutLoading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen px-6 py-10 sm:py-14">
    <div class="mx-auto max-w-7xl space-y-6">
      <section class="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.35em] text-wine/70">
              Dashboard admin
            </p>

            <h1 class="mt-4 font-display text-4xl text-cocoa sm:text-5xl">
              Control de confirmaciones
            </h1>

            <p class="mt-4 max-w-2xl text-base leading-7 text-stone-600">
              Vista centralizada para revisar confirmaciones, cantidad de asistentes, telefonos y mensajes recibidos.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              class="rounded-full border border-blush bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-cocoa transition hover:border-wine hover:text-wine"
              @click="refresh()"
            >
              Actualizar
            </button>

            <button
              type="button"
              :disabled="logoutLoading"
              class="rounded-full bg-cocoa px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-wine disabled:cursor-not-allowed disabled:opacity-70"
              @click="logout"
            >
              {{ logoutLoading ? 'Saliendo...' : 'Cerrar sesion' }}
            </button>
          </div>
        </div>

        <div class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-[1.5rem] bg-sand p-5">
            <p class="text-xs uppercase tracking-[0.25em] text-stone-500">
              Total
            </p>
            <p class="mt-3 font-display text-3xl text-cocoa">
              {{ stats.total }}
            </p>
          </div>

          <div class="rounded-[1.5rem] bg-emerald-50 p-5">
            <p class="text-xs uppercase tracking-[0.25em] text-emerald-700/70">
              Confirmadas
            </p>
            <p class="mt-3 font-display text-3xl text-emerald-700">
              {{ stats.confirmed }}
            </p>
          </div>

          <div class="rounded-[1.5rem] bg-amber-50 p-5">
            <p class="text-xs uppercase tracking-[0.25em] text-amber-700/70">
              Pendientes
            </p>
            <p class="mt-3 font-display text-3xl text-amber-700">
              {{ stats.pending }}
            </p>
          </div>

          <div class="rounded-[1.5rem] bg-stone-200 p-5">
            <p class="text-xs uppercase tracking-[0.25em] text-stone-600">
              No asistiran
            </p>
            <p class="mt-3 font-display text-3xl text-stone-700">
              {{ stats.declined }}
            </p>
          </div>
        </div>
      </section>

      <section class="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur">
        <div class="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div>
            <label for="admin-search" class="block text-sm font-medium text-cocoa">
              Buscar invitado o parentesco
            </label>

            <input
              id="admin-search"
              v-model="searchQuery"
              type="text"
              placeholder="Ej. Buenaventura"
              class="mt-3 w-full rounded-2xl border border-blush bg-sand/60 px-5 py-4 text-base text-cocoa outline-none transition placeholder:text-stone-400 focus:border-wine focus:ring-2 focus:ring-wine/20"
            >
          </div>

          <div>
            <label for="status-filter" class="block text-sm font-medium text-cocoa">
              Estado
            </label>

            <select
              id="status-filter"
              v-model="statusFilter"
              class="mt-3 w-full rounded-2xl border border-blush bg-sand/60 px-5 py-4 text-base text-cocoa outline-none transition focus:border-wine focus:ring-2 focus:ring-wine/20"
            >
              <option value="all">
                Todos
              </option>
              <option value="confirmed">
                Confirmadas
              </option>
              <option value="pending">
                Pendientes
              </option>
              <option value="declined">
                No asistiran
              </option>
            </select>
          </div>
        </div>

        <div v-if="pending && !invitations.length" class="mt-8 rounded-[1.75rem] border border-dashed border-blush bg-sand/60 p-8 text-center text-cocoa">
          Cargando panel de invitados...
        </div>

        <div v-else-if="error" class="mt-8 rounded-[1.75rem] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
          No pudimos cargar las invitaciones del panel admin.
        </div>

        <div v-else-if="filteredInvitations.length === 0" class="mt-8 rounded-[1.75rem] border border-dashed border-blush bg-sand/60 p-8 text-center">
          <p class="text-lg font-medium text-cocoa">
            No hay resultados con ese filtro.
          </p>
          <p class="mt-2 text-sm text-stone-500">
            Ajusta la busqueda o cambia el estado para volver a ver todas las invitaciones.
          </p>
        </div>

        <div v-else class="mt-8 overflow-hidden rounded-[1.75rem] border border-blush/70">
          <div class="hidden grid-cols-[1.4fr_0.9fr_0.75fr_0.7fr_1.1fr_1.3fr] gap-4 bg-sand/80 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 lg:grid">
            <span>Invitado</span>
            <span>Relacion</span>
            <span>Estado</span>
            <span>Cupos</span>
            <span>Ultimo RSVP</span>
            <span>Contacto</span>
          </div>

          <article
            v-for="invitation in filteredInvitations"
            :key="invitation.id"
            class="grid gap-4 border-t border-blush/50 bg-white px-6 py-5 first:border-t-0 lg:grid-cols-[1.4fr_0.9fr_0.75fr_0.7fr_1.1fr_1.3fr] lg:items-start"
          >
            <div>
              <p class="font-display text-2xl leading-tight text-cocoa">
                {{ invitation.displayName }}
              </p>
              <p class="mt-2 text-sm text-stone-500">
                Token: {{ invitation.token }}
              </p>
              <p v-if="invitation.namedGuests.length" class="mt-3 text-sm leading-6 text-stone-600">
                Invitados: {{ invitation.namedGuests.join(', ') }}
              </p>
              <p v-if="invitation.notes" class="mt-2 text-sm leading-6 text-stone-500">
                {{ invitation.notes }}
              </p>
            </div>

            <div class="text-sm leading-6 text-stone-600">
              {{ invitation.relationship }}
            </div>

            <div>
              <span class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]" :class="statusClass(invitation.status)">
                {{ statusLabel(invitation.status) }}
              </span>
            </div>

            <div class="text-sm leading-6 text-stone-600">
              {{ invitation.confirmedCount ?? 0 }} / {{ invitation.allowedGuests }}
            </div>

            <div class="text-sm leading-6 text-stone-600">
              <p>
                {{ formatDate(invitation.rsvp?.submittedAt) }}
              </p>
              <p v-if="invitation.rsvp?.guestNames.length" class="mt-2 text-stone-500">
                {{ invitation.rsvp.guestNames.join(', ') }}
              </p>
              <p v-if="invitation.rsvp?.message" class="mt-2 text-stone-500">
                {{ invitation.rsvp.message }}
              </p>
            </div>

            <div class="text-sm leading-6 text-stone-600">
              <p>
                {{ invitation.rsvp?.phone || 'Sin telefono' }}
              </p>
              <NuxtLink
                :to="`/invitacion/${invitation.token}`"
                class="mt-3 inline-flex items-center rounded-full border border-blush bg-sand/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cocoa transition hover:border-wine hover:text-wine"
              >
                Ver invitacion
              </NuxtLink>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>
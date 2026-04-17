<script setup lang="ts">
import { ChevronDown, LogOut, RefreshCcw, Trash2, UserPlus } from 'lucide-vue-next'
import { SelectValue } from 'reka-ui'
import Badge from '~/components/ui/badge/Badge.vue'
import Button from '~/components/ui/button/Button.vue'
import Table from '~/components/ui/table/Table.vue'
import TableBody from '~/components/ui/table/TableBody.vue'
import TableCell from '~/components/ui/table/TableCell.vue'
import TableHead from '~/components/ui/table/TableHead.vue'
import TableHeader from '~/components/ui/table/TableHeader.vue'
import TableRow from '~/components/ui/table/TableRow.vue'
import Dialog from '~/components/ui/dialog/Dialog.vue'
import DialogContent from '~/components/ui/dialog/DialogContent.vue'
import DialogDescription from '~/components/ui/dialog/DialogDescription.vue'
import DialogFooter from '~/components/ui/dialog/DialogFooter.vue'
import DialogHeader from '~/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '~/components/ui/dialog/DialogTitle.vue'
import DropdownMenu from '~/components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuContent from '~/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '~/components/ui/dropdown-menu/DropdownMenuItem.vue'
import DropdownMenuLabel from '~/components/ui/dropdown-menu/DropdownMenuLabel.vue'
import DropdownMenuSeparator from '~/components/ui/dropdown-menu/DropdownMenuSeparator.vue'
import DropdownMenuTrigger from '~/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import Select from '~/components/ui/select/Select.vue'
import SelectContent from '~/components/ui/select/SelectContent.vue'
import SelectItem from '~/components/ui/select/SelectItem.vue'
import SelectTrigger from '~/components/ui/select/SelectTrigger.vue'
import Textarea from '~/components/ui/textarea/Textarea.vue'
import type { AdminCreateInvitationPayload, AdminInvitation, InvitationStatus } from '~/types/invitations'
import { getApiErrorMessage } from '~/utils/api-error'

const searchQuery = ref('')
const statusFilter = ref<'all' | InvitationStatus>('all')
const confirmTarget = ref<AdminInvitation | null>(null)
const createError = ref('')
const createSuccess = ref('')
const deleteError = ref('')
const deleteSuccess = ref('')
const createForm = reactive({
  displayName: '',
  namedGuestsText: '',
  relationship: '',
  allowedGuests: 1,
  notes: '',
})

const { invitations, pending, fetchError, refresh, createLoading, deletingId, create, remove } = await useAdminInvitations()
const { logout, logoutLoading } = useAdminAuth()

if (fetchError.value?.statusCode === 401) {
  await navigateTo('/admin')
}

watch(fetchError, async (currentError) => {
  if (currentError?.statusCode === 401) {
    await navigateTo('/admin')
  }
})

const statusFilterValue = computed({
  get: () => statusFilter.value,
  set: (value: string) => {
    if (value === 'all' || value === 'confirmed' || value === 'pending' || value === 'declined') {
      statusFilter.value = value
    }
  },
})

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

function formatDate(value?: string | null) {
  if (!value) {
    return 'Sin respuesta'
  }

  return new Intl.DateTimeFormat('es-EC', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function parseNamedGuests(value: string, fallbackName: string) {
  const guests = value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean)

  return guests.length ? guests : [fallbackName.trim()]
}

function resetCreateForm() {
  createForm.displayName = ''
  createForm.namedGuestsText = ''
  createForm.relationship = ''
  createForm.allowedGuests = 1
  createForm.notes = ''
}

async function createInvitation() {
  const displayName = createForm.displayName.trim()
  const namedGuests = parseNamedGuests(createForm.namedGuestsText, displayName)

  createError.value = ''
  createSuccess.value = ''
  deleteError.value = ''
  deleteSuccess.value = ''

  if (!displayName) {
    createError.value = 'Escribe el nombre principal del invitado.'
    return
  }

  if (!Number.isInteger(createForm.allowedGuests) || createForm.allowedGuests < 1) {
    createError.value = 'Debe haber al menos 1 cupo disponible.'
    return
  }

  if (namedGuests.length > createForm.allowedGuests) {
    createError.value = 'Los invitados nominales no pueden superar los cupos permitidos.'
    return
  }

  createLoading.value = true

  try {
    const payload: AdminCreateInvitationPayload = {
      displayName,
      namedGuests,
      relationship: createForm.relationship.trim(),
      allowedGuests: createForm.allowedGuests,
      notes: createForm.notes.trim() || undefined,
    }

    const result = await create(payload)

    createSuccess.value = `${result.message} Token generado: ${result.invitation.token}.`
    searchQuery.value = result.invitation.displayName
    statusFilter.value = 'all'
    resetCreateForm()
  } catch (err) {
    createError.value = getApiErrorMessage(err, 'No se pudo crear la invitacion.')
  } finally {
    createLoading.value = false
  }
}

function requestDeleteInvitation(invitation: AdminInvitation) {
  createError.value = ''
  createSuccess.value = ''
  deleteError.value = ''
  deleteSuccess.value = ''
  confirmTarget.value = invitation
}

async function executeDeleteInvitation() {
  if (!confirmTarget.value) {
    return
  }

  const target = confirmTarget.value
  confirmTarget.value = null

  try {
    const result = await remove(target.id)
    deleteSuccess.value = `${result.message} Invitado eliminado: ${target.displayName}.`
  } catch (err) {
    deleteError.value = getApiErrorMessage(err, 'No se pudo eliminar la invitacion.')
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

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="secondary">
                Acciones
                <ChevronDown class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" class="w-64">
              <DropdownMenuLabel>Panel admin</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem @select="refresh()">
                <RefreshCcw class="h-4 w-4 text-wine" />
                Actualizar listado
              </DropdownMenuItem>

              <DropdownMenuItem class="text-rose-700 focus:bg-rose-50 focus:text-rose-700" :disabled="logoutLoading" @select="logout">
                <LogOut class="h-4 w-4" />
                {{ logoutLoading ? 'Saliendo...' : 'Cerrar sesion' }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p class="text-sm uppercase tracking-[0.35em] text-wine/70">
              Crear invitado
            </p>

            <h2 class="mt-4 font-display text-3xl text-cocoa sm:text-4xl">
              Agregar una nueva invitacion
            </h2>

            <p class="mt-4 max-w-2xl text-base leading-7 text-stone-600">
              Crea invitados manualmente desde el panel. El token se genera automaticamente y queda disponible al instante.
            </p>

            <form class="mt-8 grid gap-4 sm:grid-cols-2" @submit.prevent="createInvitation">
              <div class="sm:col-span-2 space-y-2">
                <Label for="create-display-name">Nombre principal</Label>
                <Input
                  id="create-display-name"
                  v-model="createForm.displayName"
                  type="text"
                  placeholder="Ej. Jane Buenaventura y Luis Alvarado"
                />
              </div>

              <div class="space-y-2">
                <Label for="create-relationship">Relacion</Label>
                <Input
                  id="create-relationship"
                  v-model="createForm.relationship"
                  type="text"
                  placeholder="Ej. Hermana y esposo"
                />
              </div>

              <div class="space-y-2">
                <Label for="create-allowed-guests">Cupos</Label>
                <Input
                  id="create-allowed-guests"
                  v-model.number="createForm.allowedGuests"
                  type="number"
                  min="1"
                  max="12"
                />
              </div>

              <div class="sm:col-span-2 space-y-2">
                <Label for="create-named-guests">Invitados nominales</Label>
                <Textarea
                  id="create-named-guests"
                  v-model="createForm.namedGuestsText"
                  rows="4"
                  placeholder="Un nombre por linea o separados por comas"
                />
                <p class="text-sm text-stone-500">
                  Si lo dejas vacio, se usara el nombre principal como invitado nominal.
                </p>
              </div>

              <div class="sm:col-span-2 space-y-2">
                <Label for="create-notes">Notas</Label>
                <Textarea
                  id="create-notes"
                  v-model="createForm.notes"
                  rows="3"
                  placeholder="Ej. Sin invitados adicionales"
                />
              </div>

              <div class="sm:col-span-2 flex flex-wrap items-center gap-3">
                <Button type="submit" :disabled="createLoading">
                  <UserPlus class="h-4 w-4" />
                  {{ createLoading ? 'Creando...' : 'Crear invitado' }}
                </Button>
                <Button type="button" variant="secondary" @click="resetCreateForm">
                  Limpiar
                </Button>
              </div>
            </form>
          </div>

          <div class="rounded-[1.75rem] bg-sand/70 p-6">
            <p class="text-xs uppercase tracking-[0.25em] text-stone-500">
              Reglas recomendadas
            </p>

            <div class="mt-5 space-y-4 text-sm leading-7 text-stone-600">
              <p>
                Usa el nombre visible tal como quieres que aparezca en la invitacion.
              </p>
              <p>
                Los invitados nominales se usan para la busqueda, el detalle de la invitacion y el formulario RSVP.
              </p>
              <p>
                Si luego eliminas una invitacion, tambien se eliminan sus respuestas RSVP registradas.
              </p>
            </div>

            <div v-if="createError" class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {{ createError }}
            </div>

            <div v-if="createSuccess" class="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {{ createSuccess }}
            </div>

            <div v-if="deleteError" class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {{ deleteError }}
            </div>

            <div v-if="deleteSuccess" class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {{ deleteSuccess }}
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur">
        <div class="grid gap-4 lg:grid-cols-[1fr_220px]">
          <div class="space-y-2">
            <Label for="admin-search">Buscar invitado o parentesco</Label>
            <Input
              id="admin-search"
              v-model="searchQuery"
              type="text"
              placeholder="Ej. Buenaventura"
            />
          </div>

          <div class="space-y-2">
            <Label for="status-filter">Estado</Label>
            <Select v-model="statusFilterValue">
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Filtra por estado" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  Todos
                </SelectItem>
                <SelectItem value="confirmed">
                  Confirmadas
                </SelectItem>
                <SelectItem value="pending">
                  Pendientes
                </SelectItem>
                <SelectItem value="declined">
                  No asistiran
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div v-if="pending && !invitations.length" class="mt-8 rounded-[1.75rem] border border-dashed border-blush bg-sand/60 p-8 text-center text-cocoa">
          Cargando panel de invitados...
        </div>

        <div v-else-if="fetchError" class="mt-8 rounded-[1.75rem] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
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

        <div v-else class="mt-8 overflow-hidden rounded-[1.75rem] border border-blush/70 bg-white">
          <Table>
            <TableHeader>
              <TableRow class="bg-sand/80 hover:bg-sand/80">
                <TableHead>Invitado</TableHead>
                <TableHead>Relacion</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cupos</TableHead>
                <TableHead>Ultimo RSVP</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead class="text-right">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow v-for="invitation in filteredInvitations" :key="invitation.id">
                <TableCell class="min-w-[13rem]">
                  <p class="font-display text-lg leading-tight text-cocoa">
                    {{ invitation.displayName }}
                  </p>
                </TableCell>

                <TableCell class="min-w-[8rem] text-stone-600">
                  {{ invitation.relationship || '—' }}
                </TableCell>

                <TableCell>
                  <Badge :variant="invitation.status">
                    {{ statusLabel(invitation.status) }}
                  </Badge>
                </TableCell>

                <TableCell class="tabular-nums text-stone-600">
                  {{ invitation.confirmedCount ?? 0 }}&thinsp;/&thinsp;{{ invitation.allowedGuests }}
                </TableCell>

                <TableCell class="min-w-[11rem] text-stone-600">
                  <p>{{ formatDate(invitation.rsvp?.submittedAt) }}</p>
                  <p v-if="invitation.rsvp?.guestNames.length" class="mt-1 text-xs text-stone-400">
                    {{ invitation.rsvp.guestNames.join(', ') }}
                  </p>
                  <p v-if="invitation.rsvp?.message" class="mt-1 text-xs italic text-stone-400">
                    "{{ invitation.rsvp.message }}"
                  </p>
                </TableCell>

                <TableCell class="text-stone-600">
                  {{ invitation.rsvp?.phone || '—' }}
                </TableCell>

                <TableCell class="text-right">
                  <div class="flex items-center justify-end gap-2">
                    <NuxtLink
                      :to="`/invitacion/${invitation.token}`"
                      class="inline-flex items-center rounded-full border border-blush bg-sand/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cocoa transition hover:border-wine hover:text-wine"
                    >
                      Ver
                    </NuxtLink>

                    <Button
                      size="sm"
                      variant="destructive"
                      :disabled="deletingId === invitation.id"
                      @click="requestDeleteInvitation(invitation)"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                      {{ deletingId === invitation.id ? 'Eliminando...' : 'Eliminar' }}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  </main>

  <Dialog :open="Boolean(confirmTarget)" @update:open="(open) => { if (!open) confirmTarget = null }">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Eliminar invitado</DialogTitle>
        <DialogDescription>
          Se eliminara a <strong class="font-semibold text-cocoa">{{ confirmTarget?.displayName }}</strong> junto
          con todo su historial RSVP. Esta accion no se puede deshacer.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="secondary" @click="confirmTarget = null">Cancelar</Button>
        <Button variant="destructive" @click="executeDeleteInvitation">
          <Trash2 class="h-4 w-4" />
          Eliminar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
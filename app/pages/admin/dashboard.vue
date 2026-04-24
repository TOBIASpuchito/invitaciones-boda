<script setup lang="ts">
import * as XLSX from 'xlsx'
import { ChevronDown, LogOut, RefreshCcw, Search, Trash2, UserPlus } from 'lucide-vue-next'
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
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const confirmTarget = ref<AdminInvitation | null>(null)
const createError = ref('')
const createSuccess = ref('')
const importError = ref('')
const importSuccess = ref('')
const deleteError = ref('')
const deleteSuccess = ref('')
const importFileName = ref('')
const importPreviewCount = ref(0)
const importPreviewRows = ref<AdminCreateInvitationPayload[]>([])
const importInputRef = ref<HTMLInputElement | null>(null)
const createForm = reactive({
  displayName: '',
  namedGuestsText: '',
  relationship: '',
  allowedGuests: 1,
  notes: '',
})

const { invitations, pending, fetchError, refresh, applyFilters, clearFilters: clearInvitationFilterResults, activeFilters, createLoading, importLoading, deletingId, create, importMany, remove } = await useAdminInvitations()
const { logout, logoutLoading } = useAdminAuth()

type SheetRow = Record<string, unknown>

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

const filteredInvitations = computed(() => invitations.value)

async function applyInvitationFilters() {
  await applyFilters({
    search: searchQuery.value,
    status: statusFilter.value,
  })
}

async function clearInvitationFilters() {
  if (debounceTimer) clearTimeout(debounceTimer)
  searchQuery.value = ''
  statusFilter.value = 'all'
  await clearInvitationFilterResults()
}

// Live search: aplica el filtro 500ms después de que el usuario deja de escribir
watch(searchQuery, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    applyFilters({ search: value, status: statusFilter.value })
  }, 500)
})

// Aplica filtro de estado inmediatamente al cambiar el select
watch(statusFilter, (value) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  applyFilters({ search: searchQuery.value, status: value })
})

function statusLabel(status: InvitationStatus) {
  if (status === 'confirmed') {
    return 'Confirmada'
  }

  if (status === 'declined') {
    return 'No asistirá'
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

function normalizeHeader(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function findHeaderRowIndex(rows: unknown[][]) {
  return rows.findIndex((row) => row.some((cell) => {
    const header = normalizeHeader(String(cell ?? ''))
    return ['nombre', 'nombres', 'invitado', 'invitados'].includes(header)
  }))
}

function getCellValue(row: SheetRow, headerCandidates: string[]) {
  const normalizedCandidates = headerCandidates.map(normalizeHeader)

  for (const [key, value] of Object.entries(row)) {
    if (normalizedCandidates.includes(normalizeHeader(key))) {
      return String(value ?? '').trim()
    }
  }

  return ''
}

function getNumericCellValue(row: SheetRow, headerCandidates: string[]) {
  const rawValue = getCellValue(row, headerCandidates)
  const parsedValue = Number(rawValue)

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0
}

function splitNamedGuests(displayName: string, allowedGuests: number) {
  if (allowedGuests <= 1) {
    return [displayName.replace(/\s+/g, ' ').trim()]
  }

  const guests = displayName
    .split(/\s+(?:y|e)\s+|\s*&\s*/i)
    .map((guest) => guest.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  return guests.length > 1 ? guests : [displayName.replace(/\s+/g, ' ').trim()]
}

function clearImportFeedback() {
  importError.value = ''
  importSuccess.value = ''
}

function resetImportState(clearInput = false) {
  importFileName.value = ''
  importPreviewCount.value = 0
  importPreviewRows.value = []
  clearImportFeedback()

  if (clearInput && importInputRef.value) {
    importInputRef.value.value = ''
  }
}

async function handleImportFileChange(event: Event) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]

  resetImportState()
  createError.value = ''
  createSuccess.value = ''
  deleteError.value = ''
  deleteSuccess.value = ''

  if (!file) {
    return
  }

  importFileName.value = file.name

  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const firstSheetName = workbook.SheetNames[0]

    if (!firstSheetName) {
      importError.value = 'El archivo no contiene una hoja válida.'
      return
    }

    const firstSheet = workbook.Sheets[firstSheetName]

    if (!firstSheet) {
      importError.value = 'El archivo no contiene una hoja válida.'
      return
    }

    const rawRows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, { header: 1, defval: '' })
    const headerRowIndex = findHeaderRowIndex(rawRows)

    if (headerRowIndex < 0) {
      importError.value = 'No encontramos una columna de nombre en el Excel.'
      return
    }

    const rows = XLSX.utils.sheet_to_json<SheetRow>(firstSheet, {
      range: headerRowIndex,
      defval: '',
    })

    const parsedRows = rows
      .map((row) => {
        const displayName = getCellValue(row, ['nombre', 'nombres', 'invitado', 'invitados']).replace(/\s+/g, ' ').trim()
        const relationship = getCellValue(row, ['parentesco', 'relacion', 'relación'])
        const allowedGuests = getNumericCellValue(row, ['cantidad', 'cupos', 'invitados permitidos', 'cantidad invitados']) || (displayName.includes('&') || /\s+(y|e)\s+/i.test(displayName) ? 2 : 1)
        const namedGuestsRaw = getCellValue(row, ['invitados nominales', 'nombres invitados', 'acompanantes', 'acompañantes'])
        const notes = getCellValue(row, ['notas', 'nota', 'observaciones'])

        if (!displayName) {
          return null
        }

        const namedGuests = namedGuestsRaw
          ? parseNamedGuests(namedGuestsRaw, displayName)
          : splitNamedGuests(displayName, allowedGuests)

        const invitationPayload: AdminCreateInvitationPayload = {
          displayName,
          namedGuests,
          relationship,
          allowedGuests,
          notes: notes || undefined,
        }

        return invitationPayload
      })
      .filter((row): row is AdminCreateInvitationPayload => row !== null)

    if (!parsedRows.length) {
      importError.value = 'No se encontraron invitados válidos en el archivo.'
      return
    }

    const invalidRow = parsedRows.find((row) => row.namedGuests.length > row.allowedGuests)

    if (invalidRow) {
      importError.value = `La fila de ${invalidRow.displayName} tiene más invitados nominales que cupos.`
      return
    }

    importPreviewRows.value = parsedRows
    importPreviewCount.value = parsedRows.length
  } catch (error) {
    importError.value = getApiErrorMessage(error, 'No se pudo leer el archivo Excel.')
  }
}

async function importInvitationsFromExcel() {
  if (!importPreviewRows.value.length) {
    importError.value = 'Primero selecciona un archivo Excel válido.'
    return
  }

  clearImportFeedback()
  createError.value = ''
  createSuccess.value = ''
  deleteError.value = ''
  deleteSuccess.value = ''

  try {
    const result = await importMany(importPreviewRows.value)
    importSuccess.value = result.message
    searchQuery.value = ''
    statusFilter.value = 'all'
    await clearInvitationFilterResults()
    resetImportState(true)
  } catch (error) {
    importError.value = getApiErrorMessage(error, 'No se pudieron importar los invitados desde el Excel.')
  }
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
    await applyFilters({
      search: result.invitation.displayName,
      status: 'all',
    })
    resetCreateForm()
  } catch (err) {
    createError.value = getApiErrorMessage(err, 'No se pudo crear la invitación.')
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
    deleteError.value = getApiErrorMessage(err, 'No se pudo eliminar la invitación.')
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
              Vista centralizada para revisar confirmaciones, cantidad de asistentes, teléfonos y mensajes recibidos.
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
                {{ logoutLoading ? 'Saliendo...' : 'Cerrar sesión' }}
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
              No asistirán
            </p>
            <p class="mt-3 font-display text-3xl text-stone-700">
              {{ stats.declined }}
            </p>
          </div>
        </div>
      </section>

      <section class="rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur">
        <div class="flex flex-col gap-8">
          <div>
            <p class="text-sm uppercase tracking-[0.35em] text-wine/70">
              Crear invitado
            </p>

            <h2 class="mt-4 font-display text-3xl text-cocoa sm:text-4xl">
              Agregar una nueva invitación
            </h2>

            <p class="mt-4 max-w-2xl text-base leading-7 text-stone-600">
              Crea invitados manualmente desde el panel. El token se genera automáticamente y queda disponible al instante.
            </p>

            <div class="mt-6 rounded-[1.5rem] border border-blush/70 bg-sand/50 p-5">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p class="text-xs uppercase tracking-[0.25em] text-stone-500">
                    Importar desde Excel
                  </p>
                  <p class="mt-2 text-sm leading-6 text-stone-600">
                    Sube un archivo `.xlsx` o `.xls` con columnas como nombre, parentesco, cantidad, invitados nominales y notas.
                  </p>
                </div>

                <div class="flex flex-wrap gap-3">
                  <Button type="button" variant="secondary" :disabled="importLoading || !importPreviewCount" @click="importInvitationsFromExcel">
                    {{ importLoading ? 'Importando...' : 'Importar invitados' }}
                  </Button>
                  <Button type="button" variant="secondary" @click="resetImportState(true)">
                    Limpiar archivo
                  </Button>
                </div>
              </div>

              <div class="mt-4">
                <label for="excel-import" class="block text-sm font-medium text-cocoa">Archivo Excel</label>
                <input
                  id="excel-import"
                  ref="importInputRef"
                  type="file"
                  accept=".xlsx,.xls"
                  class="mt-3 block w-full rounded-2xl border border-blush bg-white px-4 py-3 text-sm text-cocoa file:mr-4 file:rounded-full file:border-0 file:bg-sand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cocoa"
                  @change="handleImportFileChange"
                >
              </div>

              <div v-if="importFileName || importPreviewCount" class="mt-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-stone-600">
                <p><strong class="font-semibold text-cocoa">Archivo:</strong> {{ importFileName || 'Sin archivo seleccionado' }}</p>
                <p class="mt-1"><strong class="font-semibold text-cocoa">Invitados detectados:</strong> {{ importPreviewCount }}</p>
                <p v-if="importPreviewRows.length" class="mt-1">
                  <strong class="font-semibold text-cocoa">Primeros nombres:</strong>
                  {{ importPreviewRows.slice(0, 3).map(row => row.displayName).join(', ') }}<span v-if="importPreviewRows.length > 3">...</span>
                </p>
              </div>
            </div>

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
                <Label for="create-relationship">Relación</Label>
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
                  placeholder="Un nombre por línea o separados por comas"
                />
                <p class="text-sm text-stone-500">
                  Si lo dejas vacío, se usará el nombre principal como invitado nominal.
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
                Usa el nombre visible tal como quieres que aparezca en la invitación.
              </p>
              <p>
                Los invitados nominales se usan para la búsqueda, el detalle de la invitación y el formulario RSVP.
              </p>
              <p>
                Si luego eliminas una invitación, también se eliminan sus respuestas RSVP registradas.
              </p>
            </div>

            <div v-if="createError" class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {{ createError }}
            </div>

            <div v-if="createSuccess" class="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {{ createSuccess }}
            </div>

            <div v-if="importError" class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {{ importError }}
            </div>

            <div v-if="importSuccess" class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {{ importSuccess }}
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
        <form class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]" @submit.prevent="applyInvitationFilters">
          <div class="space-y-2">
            <Label for="admin-search">Buscar por nombre</Label>
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
                  No asistirán
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-end lg:justify-end">
            <Button type="button" class="w-full sm:w-auto" :disabled="pending" @click="applyInvitationFilters">
              <Search class="h-4 w-4" />
              {{ pending ? 'Buscando...' : 'Buscar' }}
            </Button>
            <Button type="button" variant="secondary" class="w-full sm:w-auto" @click="clearInvitationFilters">
              Limpiar filtros
            </Button>
          </div>
        </form>

        <div v-if="activeFilters.search || activeFilters.status !== 'all'" class="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-stone-500">
          <span v-if="activeFilters.search" class="rounded-full bg-sand px-3 py-2 text-cocoa">
            Búsqueda: {{ activeFilters.search }}
          </span>
          <span v-if="activeFilters.status !== 'all'" class="rounded-full bg-sand px-3 py-2 text-cocoa">
            Estado: {{ statusLabel(activeFilters.status) }}
          </span>
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
            No encontramos invitados con ese nombre. Ajusta la búsqueda o cambia el estado para volver a ver todas las invitaciones.
          </p>
        </div>

        <div v-else class="mt-8 space-y-4">
          <div class="grid gap-4 lg:hidden">
            <article v-for="invitation in filteredInvitations" :key="`${invitation.id}-mobile`" class="rounded-[1.5rem] border border-blush/70 bg-white p-5 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-display text-xl leading-tight text-cocoa">
                    {{ invitation.displayName }}
                  </p>
                  <p class="mt-1 text-sm text-stone-500">
                    {{ invitation.relationship || 'Sin relación registrada' }}
                  </p>
                </div>
                <Badge :variant="invitation.status">
                  {{ statusLabel(invitation.status) }}
                </Badge>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-sand/55 p-4 text-sm text-stone-600">
                <div>
                  <p class="text-[0.65rem] uppercase tracking-[0.18em] text-stone-400">Cupos</p>
                  <p class="mt-1 font-semibold text-cocoa">{{ invitation.confirmedCount ?? 0 }}/{{ invitation.allowedGuests }}</p>
                </div>
                <div>
                  <p class="text-[0.65rem] uppercase tracking-[0.18em] text-stone-400">Teléfono</p>
                  <p class="mt-1 font-semibold text-cocoa break-words">{{ invitation.rsvp?.phone || '—' }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-[0.65rem] uppercase tracking-[0.18em] text-stone-400">Último RSVP</p>
                  <p class="mt-1 font-semibold text-cocoa">{{ formatDate(invitation.rsvp?.submittedAt) }}</p>
                  <p v-if="invitation.rsvp?.guestNames.length" class="mt-1 text-xs text-stone-500 break-words">
                    {{ invitation.rsvp.guestNames.join(', ') }}
                  </p>
                  <p v-if="invitation.rsvp?.message" class="mt-1 text-xs italic text-stone-500 break-words">
                    "{{ invitation.rsvp.message }}"
                  </p>
                </div>
              </div>

              <div class="mt-4 flex flex-col gap-2 sm:flex-row">
                <NuxtLink
                  :to="`/invitacion/${invitation.token}`"
                  class="inline-flex w-full items-center justify-center rounded-full border border-blush bg-sand/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cocoa transition hover:border-wine hover:text-wine sm:w-auto"
                >
                  Ver invitación
                </NuxtLink>

                <Button
                  size="sm"
                  variant="destructive"
                  class="w-full sm:w-auto"
                  :disabled="deletingId === invitation.id"
                  @click="requestDeleteInvitation(invitation)"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                  {{ deletingId === invitation.id ? 'Eliminando...' : 'Eliminar' }}
                </Button>
              </div>
            </article>
          </div>

          <div class="hidden overflow-x-auto rounded-[1.75rem] border border-blush/70 bg-white lg:block">
            <Table>
            <TableHeader>
              <TableRow class="bg-sand/80 hover:bg-sand/80">
                <TableHead>Invitado</TableHead>
                <TableHead>Relación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cupos</TableHead>
                <TableHead>Último RSVP</TableHead>
                <TableHead>Teléfono</TableHead>
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
        </div>
      </section>
    </div>
  </main>

  <Dialog :open="Boolean(confirmTarget)" @update:open="(open) => { if (!open) confirmTarget = null }">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Eliminar invitado</DialogTitle>
        <DialogDescription>
          Se eliminará a <strong class="font-semibold text-cocoa">{{ confirmTarget?.displayName }}</strong> junto
          con todo su historial RSVP. Esta acción no se puede deshacer.
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
import { normalizeText } from '../utils/text'

export type InvitationStatus = 'pending' | 'confirmed' | 'declined'
export type Attendance = 'yes' | 'no'

export interface InvitationRsvpRecord {
  attendance: Attendance
  confirmedCount: number
  phone?: string | null
  message?: string | null
  guestNames: string[]
  submittedAt: string
}

export interface InvitationRecord {
  id: string
  token: string
  displayName: string
  namedGuests: string[]
  relationship: string
  allowedGuests: number
  notes?: string | null
  status: InvitationStatus
  confirmedCount: number | null
  searchName: string
  rsvp: InvitationRsvpRecord | null
}

const baseInvitations: Omit<InvitationRecord, 'searchName'>[] = [
  {
    id: '1',
    token: 'jean-buenaventura',
    displayName: 'Jean Buenaventura',
    namedGuests: ['Jean Buenaventura'],
    relationship: 'Hermano - Testigo de Boda',
    allowedGuests: 1,
    notes: 'Tu presencia es importante para nosotros.',
    status: 'confirmed',
    confirmedCount: 1,
    rsvp: {
      attendance: 'yes',
      confirmedCount: 1,
      phone: '0990000001',
      message: 'Listo para celebrar con ustedes.',
      guestNames: ['Jean Buenaventura'],
      submittedAt: '2026-04-10T18:30:00.000Z',
    },
  },
  {
    id: '2',
    token: 'tito-buenaventura',
    displayName: 'Tito Buenaventura',
    namedGuests: ['Tito Buenaventura'],
    relationship: 'Padre',
    allowedGuests: 1,
    notes: 'Hemos reservado un lugar especial para ti.',
    status: 'pending',
    confirmedCount: null,
    rsvp: null,
  },
  {
    id: '3',
    token: 'angelica-martinez',
    displayName: 'Angelica Martinez',
    namedGuests: ['Angelica Martinez'],
    relationship: 'Amiga de mi Padre',
    allowedGuests: 1,
    notes: null,
    status: 'pending',
    confirmedCount: null,
    rsvp: null,
  },
  {
    id: '4',
    token: 'jane-buenaventura-luis-alvarado',
    displayName: 'Jane Buenaventura y Luis Alvarado',
    namedGuests: ['Jane Buenaventura', 'Luis Alvarado'],
    relationship: 'Hermana y Esposo',
    allowedGuests: 2,
    notes: 'Invitacion para ambos, sin invitados adicionales.',
    status: 'pending',
    confirmedCount: null,
    rsvp: null,
  },
  {
    id: '5',
    token: 'leonardo-buenaventura-esperanza-zambrano',
    displayName: 'Leonardo Buenaventura y Esperanza Zambrano',
    namedGuests: ['Leonardo Buenaventura', 'Esperanza Zambrano'],
    relationship: 'Hermano y Esposa',
    allowedGuests: 2,
    notes: null,
    status: 'pending',
    confirmedCount: null,
    rsvp: null,
  },
  {
    id: '6',
    token: 'valeria-zambrano-cristhian-palacios',
    displayName: 'Valeria Zambrano y Cristhian Palacios',
    namedGuests: ['Valeria Zambrano', 'Cristhian Palacios'],
    relationship: 'Amiga y Esposo',
    allowedGuests: 2,
    notes: 'No puede traer hijos.',
    status: 'pending',
    confirmedCount: null,
    rsvp: null,
  },
  {
    id: '7',
    token: 'consuelo-aveiga-carolina-mera',
    displayName: 'Consuelo Aveiga y Carolina Mera',
    namedGuests: ['Consuelo Aveiga', 'Carolina Mera'],
    relationship: 'Hermana e Hija',
    allowedGuests: 2,
    notes: 'No puede traer hijos adicionales.',
    status: 'pending',
    confirmedCount: null,
    rsvp: null,
  },
  {
    id: '8',
    token: 'irene-zambrano',
    displayName: 'Irene Zambrano',
    namedGuests: ['Irene Zambrano'],
    relationship: 'Amiga',
    allowedGuests: 1,
    notes: 'No puede traer hijos.',
    status: 'declined',
    confirmedCount: 0,
    rsvp: {
      attendance: 'no',
      confirmedCount: 0,
      phone: '0990000008',
      message: 'Gracias por la invitacion, esta vez no podre acompanarlos.',
      guestNames: [],
      submittedAt: '2026-04-09T15:15:00.000Z',
    },
  },
  {
    id: '9',
    token: 'melanie-lopez-jaime-buenaventura',
    displayName: 'Melanie Lopez y Jaime Buenaventura',
    namedGuests: ['Melanie Lopez', 'Jaime Buenaventura'],
    relationship: 'Amiga y Esposo',
    allowedGuests: 2,
    notes: null,
    status: 'pending',
    confirmedCount: null,
    rsvp: null,
  },
  {
    id: '10',
    token: 'patricia-osorio',
    displayName: 'Patricia Osorio',
    namedGuests: ['Patricia Osorio'],
    relationship: 'Amiga',
    allowedGuests: 1,
    notes: null,
    status: 'pending',
    confirmedCount: null,
    rsvp: null,
  },
  {
    id: '11',
    token: 'jenny-jehilyn-freddy-benavides',
    displayName: 'Jenny Buenaventura, Jehilyn Buenaventura y Freddy Benavides',
    namedGuests: ['Jenny Buenaventura', 'Jehilyn Buenaventura', 'Freddy Benavides'],
    relationship: 'Hija, Sobrina y Esposo',
    allowedGuests: 3,
    notes: 'La unica nina invitada es Jehilyn.',
    status: 'pending',
    confirmedCount: null,
    rsvp: null,
  },
  {
    id: '12',
    token: 'maholy-buenaventura',
    displayName: 'Maholy Buenaventura',
    namedGuests: ['Maholy Buenaventura'],
    relationship: 'Sobrina',
    allowedGuests: 1,
    notes: 'No puede traer hijos.',
    status: 'pending',
    confirmedCount: null,
    rsvp: null,
  },
]

export const mockInvitations: InvitationRecord[] = baseInvitations.map((invitation) => ({
  ...invitation,
  searchName: normalizeText([invitation.displayName, ...invitation.namedGuests].join(' ')),
}))

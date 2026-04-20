export type InvitationStatus = 'pending' | 'confirmed' | 'declined'
export type Attendance = 'yes' | 'no'

export interface InvitationRsvp {
  attendance: Attendance
  confirmedCount: number
  phone?: string | null
  message?: string | null
  guestNames: string[]
  submittedAt: string
}

export interface InvitationRsvpPayload {
  attendance: Attendance
  confirmedCount: number
  phone?: string
  message?: string
  guestNames: string[]
}

export interface InvitationSummary {
  token: string
  displayName: string
  relationship: string
  allowedGuests: number
  notes?: string | null
  status: InvitationStatus
}

export interface InvitationDetail extends InvitationSummary {
  namedGuests: string[]
  confirmedCount: number | null
  rsvp: InvitationRsvp | null
}

export interface AdminInvitation extends InvitationDetail {
  id: string
  createdAt: string
  updatedAt: string
}

export interface AdminCreateInvitationPayload {
  displayName: string
  namedGuests: string[]
  relationship: string
  allowedGuests: number
  notes?: string
}

export interface AdminImportInvitationsPayload {
  invitations: AdminCreateInvitationPayload[]
}

export interface AdminImportInvitationsResult {
  invitations: AdminInvitation[]
  createdCount: number
  message: string
}

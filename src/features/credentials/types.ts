export type CredentialStatus = 'verified' | 'pending' | 'expired'
export type CredentialAccent = 'red' | 'blue' | 'green'

export interface Credential {
  id: string
  type: string
  issuer: string
  holderName: string
  sensitiveNumber: string
  status: CredentialStatus
  issuedAt: string
  expiresAt?: string
  accent: CredentialAccent
}

const statuses: CredentialStatus[] = ['verified', 'pending', 'expired']
const accents: CredentialAccent[] = ['red', 'blue', 'green']
const isDate = (value: unknown) => typeof value === 'string' && !Number.isNaN(Date.parse(value))

export function isCredential(value: unknown): value is Credential {
  if (!value || typeof value !== 'object') return false
  const credential = value as Record<string, unknown>
  return typeof credential.id === 'string' && credential.id.length > 0
    && typeof credential.type === 'string' && credential.type.length > 0
    && typeof credential.issuer === 'string' && credential.issuer.length > 0
    && typeof credential.holderName === 'string' && credential.holderName.length > 0
    && typeof credential.sensitiveNumber === 'string' && credential.sensitiveNumber.length >= 4
    && statuses.includes(credential.status as CredentialStatus)
    && isDate(credential.issuedAt)
    && (credential.expiresAt === undefined || isDate(credential.expiresAt))
    && accents.includes(credential.accent as CredentialAccent)
}

export function parseCredentials(value: unknown): Credential[] {
  if (!Array.isArray(value) || !value.every(isCredential)) throw new Error('The credential service returned invalid data.')
  return value
}

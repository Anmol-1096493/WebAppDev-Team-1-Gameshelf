import { ApiError } from '../../api'

// De statuswaarden komen overeen met de enum in de backend.
export const CONFIRMED = 0
export const WAITING = 1

// Zet verschillende soorten fouten om naar een leesbare melding.
export function messageOf(e: unknown): string {
  if (e instanceof ApiError) return e.message
  if (e instanceof Error) return e.message
  return 'Something went wrong.'
}

// Toont een ISO-datum in de lokale datumnotatie van de browser.
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

// Toont een ISO-tijdstip in de lokale tijdzone van de browser.
export function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

// De API gebruikt UTC; invoervelden voor bewerken tonen de lokale datum en tijd.
export function localDateFields(iso: string) {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  }
}

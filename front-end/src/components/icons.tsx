/* Inline SVG icons used across the mockup pages. */

type IconProps = { className?: string }

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function PlayersIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-4a6 6 0 0 1 12 0v4M17 4a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 5v2" />
    </svg>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <circle cx="10" cy="10" r="6" />
      <path d="m15 15 6 6" />
    </svg>
  )
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M18 8a6 6 0 0 0-12 0c0 8-3 8-3 10h18c0-2-3-2-3-10M10 22h4" />
    </svg>
  )
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 0 1 14 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M7 3v5m10-5v5M3 11h18M8 15h2m4 0h2" />
    </svg>
  )
}

export function SwapIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M3 7h12l-3-3m3 3-3 3M21 17H9l3-3m-3 3 3 3" />
    </svg>
  )
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  )
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="4" y="10" width="16" height="12" rx="2" />
      <path d="M8 10V6a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function DotsIcon({ className }: IconProps) {
  return <span className={className} aria-hidden="true">•••</span>
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

export function CollectionIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 5h16v15H4zM8 2v6M16 2v6M4 10h16" />
    </svg>
  )
}

export function LendIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M3 7h12l-3-3m3 3-3 3M21 17H9l3-3m-3 3 3 3" />
    </svg>
  )
}

export function SessionIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M7 3v5m10-5v5M3 11h18M8 15h2m4 0h2" />
    </svg>
  )
}

export function WishlistIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  )
}
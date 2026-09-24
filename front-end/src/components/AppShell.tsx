import type { ReactNode } from 'react'
import {
  CollectionIcon,
  GridIcon,
  LendIcon,
  SessionIcon,
  WishlistIcon,
  SearchIcon,
  BellIcon,
  ChevronDownIcon,
} from './icons.tsx'
import type { PageId } from './AppShellTypes'
import './mockup.css'

type AppShellProps = {
  children: ReactNode
  currentPage: PageId
  user?: { name: string; isCommittee?: boolean } | null
  onLogout?: () => void
}

const navigationItems: Array<{ id: PageId; label: string; href: string; Icon: (p: { className?: string }) => ReactNode }> = [
  { id: 'catalogue', label: 'Catalogue', href: '/catalogue', Icon: GridIcon },
  { id: 'collections', label: 'My collection', href: '/collections', Icon: CollectionIcon },
  { id: 'lending', label: 'Lending', href: '/lending', Icon: LendIcon },
  { id: 'sessions', label: 'Game sessions', href: '/sessions', Icon: SessionIcon },
  { id: 'wishlists', label: 'Wishlists', href: '/wishlists', Icon: WishlistIcon },
]

const today = new Date().toLocaleDateString('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function AppShell({ children, currentPage, user, onLogout }: AppShellProps) {
  const initials = user?.name?.slice(0, 1).toUpperCase() ?? '?'
  const role = user?.isCommittee ? 'Committee member' : 'Club member'

  return (
    <div className="mp-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <aside className="sidebar">
        <div className="sidebar__brand">
          <a className="sidebar__brand-link" href="/" aria-label="GameShelf home">
            <span className="dice-logo" aria-hidden="true">⚄</span>
            GameShelf
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                marginLeft: '0.25rem',
                width: '0.375rem',
                height: '0.375rem',
                borderRadius: '9999px',
                background: 'var(--color-accent)',
              }}
            />
          </a>
          <span className="sidebar__tagline">THE CLUB FOR PLAYERS</span>
        </div>

        <p className="sidebar__heading">DISCOVER &amp; PLAY</p>

        <nav className="sidebar__nav" aria-label="Main navigation">
          {navigationItems.map(({ id, label, href, Icon }) => {
            const isCurrent = currentPage === id
            return (
              <a
                key={id}
                className="nav-link"
                href={href}
                aria-current={isCurrent ? 'page' : undefined}
              >
                <Icon className="" />
                <span>{label}</span>
              </a>
            )
          })}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar-promo">
            <span className="sidebar-promo__mark" aria-hidden="true">✦</span>
            <p className="sidebar-promo__title">
              Good games.<br />Good people.
            </p>
            <p className="sidebar-promo__text">Your next game night starts here.</p>
            <div className="sidebar-promo__dots">
              <span style={{ background: 'var(--color-accent)' }} />
              <span style={{ background: 'var(--color-highlight)' }} />
              <span style={{ background: 'var(--color-info)' }} />
            </div>
          </div>

          {user && (
            <a className="sidebar-user" href="/profile" aria-label={`${user.name}, ${role}`}>
              <span className="avatar" title={user.name}>{initials}</span>
              <div style={{ flex: 1 }}>
                <p className="sidebar-user__name">{user.name}</p>
                <p className="sidebar-user__role">{role}</p>
              </div>
              <ChevronDownIcon className="size-4" />
            </a>
          )}
          {user && onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="btn-secondary"
              style={{ marginTop: 'var(--space-3)', width: '100%' }}
            >
              Log out
            </button>
          )}
        </div>
      </aside>

      <div className="mp-main-col">
        <header className="mp-header">
          <label className="mp-search" htmlFor="site-search">
            <SearchIcon className="size-4" />
            <input
              id="site-search"
              type="search"
              placeholder="Search this section…"
              aria-label="Search this section"
            />
            <kbd>/</kbd>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
            <span className="mp-header__date">{today}</span>
            <button type="button" className="mp-bell" aria-label="Notifications">
              <BellIcon className="size-5" />
              <span className="mp-bell__dot" />
            </button>
          </div>
        </header>

        <main className="mp-content" id="main-content" tabIndex={-1}>
          {children}
        </main>

        <footer className="mp-footer">
          <span>GameShelf · Together at the table.</span>
          <span>
            <span className="mp-footer__dot" />
            Design preview · Sample data
          </span>
        </footer>
      </div>
    </div>
  )
}

export default AppShell
export type { PageId }
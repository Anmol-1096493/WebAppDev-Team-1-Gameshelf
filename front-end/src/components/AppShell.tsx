import type { ReactNode } from 'react'
import logo from '../assets/logo/gameshelf-logo.svg'
import './AppShell.css'

export type PageId =
  | 'catalogue'
  | 'collections'
  | 'lending'
  | 'sessions'
  | 'wishlists'
  | 'profile'

type AppShellProps = {
  children: ReactNode
  currentPage: PageId
}

const navigationItems: Array<{ id: PageId; label: string; href: string }> = [
  { id: 'catalogue', label: 'Catalogue', href: '/catalogue' },
  { id: 'collections', label: 'Collections', href: '/collections' },
  { id: 'lending', label: 'Lending', href: '/lending' },
  { id: 'sessions', label: 'Sessions', href: '/sessions' },
  { id: 'wishlists', label: 'Wishlists', href: '/wishlists' },
  { id: 'profile', label: 'Profile', href: '/profile' },
]

function AppShell({ children, currentPage }: AppShellProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <a className="brand" href="/" aria-label="GameShelf home">
          <img className="brand__logo" src={logo} alt="" />
          <span className="brand__name">GameShelf</span>
        </a>

        <div className="site-header__tools">
          <label className="search" htmlFor="site-search">
            <span className="sr-only">Search GameShelf</span>
            <span aria-hidden="true">⌕</span>
            <input
              id="site-search"
              type="search"
              placeholder="Search games, members or sessions…"
            />
          </label>
        </div>
      </header>

      <nav className="primary-navigation" aria-label="Main navigation">
        <ul className="primary-navigation__list">
          {navigationItems.map((item) => {
            const isCurrent = currentPage === item.id

            return (
              <li key={item.id}>
                <a
                  className="primary-navigation__link"
                  href={item.href}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      <main className="main-content" id="main-content" tabIndex={-1}>
        {children}
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} GameShelf</p>
        <p>Good games bring good people together.</p>
      </footer>
    </div>
  )
}

export default AppShell

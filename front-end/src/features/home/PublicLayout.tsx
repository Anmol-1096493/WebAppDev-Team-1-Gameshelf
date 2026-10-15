import type { ReactNode } from 'react'
import logo from '../../assets/logo/gameshelf-logo.svg'
import './HomePage.css'

// Openbare pagina's hebben een eenvoudige header zonder het ledenmenu.
export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-layout">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="public-header">
        <a className="public-brand" href="/" aria-label="GameShelf home">
          <img src={logo} alt="" />
          <span>GameShelf</span>
        </a>
        <a className="button button--secondary" href="/login">Sign in</a>
      </header>
      <main className="public-main" id="main-content" tabIndex={-1}>{children}</main>
      <footer className="public-footer">© {new Date().getFullYear()} GameShelf</footer>
    </div>
  )
}

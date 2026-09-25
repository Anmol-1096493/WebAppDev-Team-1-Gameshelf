import { useCallback, useEffect, useState } from 'react'
import AppShell, { type PageId } from './AppShell.tsx'
import SessionsPage from './SessionsPage.tsx'
import { MockPage } from './MockPages.tsx'
import LoginScreen from './LoginScreen.tsx'
import { auth, clearToken, type Member } from '../api.ts'
import BoxDetailPage from '../pages/BoxDetailPage'
import LendingListPage from '../pages/LendingListPage'
import { lendingBoxes } from '../data/lendingBoxes'
import './App.css'

type Route = PageId | 'home'

function pathToRoute(path: string): Route {
  const segment = path.replace(/^\//, '').split('/')[0] ?? ''
  switch (segment) {
    case 'catalogue':
    case 'collections':
    case 'lending':
    case 'sessions':
    case 'wishlists':
    case 'profile':
      return segment
    default:
      return 'home'
  }
}

function App() {
  const [route, setRoute] = useState<Route>(() => pathToRoute(window.location.pathname))
  const boxId = window.location.pathname.match(/^\/lending\/boxes\/([^/]+)\/?$/)?.[1]
  const selectedBox = lendingBoxes.find((box) => box.id === boxId)
  const [member, setMember] = useState<Member | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Restore the session from a stored token on first load.
  useEffect(() => {
    const token = localStorage.getItem('gameshelf.token')
    if (!token) {
      setAuthChecked(true)
      return
    }
    auth
      .me()
      .then(setMember)
      .catch(() => clearToken())
      .finally(() => setAuthChecked(true))
  }, [])

  // Lightweight client-side router: intercept internal nav links and popstate.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const target = (e.target as HTMLElement)?.closest('a')
      if (!target) return
      const href = target.getAttribute('href') ?? ''
      if (!href.startsWith('/') || href.startsWith('//')) return
      e.preventDefault()
      const url = new URL(target.href, window.location.href)
      if (url.pathname !== window.location.pathname) {
        window.history.pushState({}, '', url.pathname)
        setRoute(pathToRoute(url.pathname))
      }
    }
    function onPop() {
      setRoute(pathToRoute(window.location.pathname))
    }
    document.addEventListener('click', onClick)
    window.addEventListener('popstate', onPop)
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('popstate', onPop)
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setMember(null)
  }, [])

  if (!authChecked) {
    return (
      <AppShell currentPage="collections">
        <section aria-labelledby="page-title">
          <p className="eyebrow">Your games</p>
          <h1 id="page-title">Collections</h1>
          <p className="text-muted">Loading…</p>
        </section>
      </AppShell>
    )
  }

  if (!member) {
    return (
      <AppShell currentPage="collections">
        <LoginScreen onLoggedIn={setMember} />
      </AppShell>
    )
  }

  const currentPage: PageId = route === 'home' ? 'collections' : route

  return (
    <AppShell currentPage={currentPage} user={member} onLogout={logout}>
      {route === 'sessions' ? (
        <SessionsPage member={member} />
      ) : route === 'lending' ? (
        selectedBox ? (
          <BoxDetailPage box={selectedBox} />
        ) : (
          <LendingListPage />
        )
      ) : (
        <MockPage page={currentPage} member={member} />
      )}
    </AppShell>
  )
}

export default App
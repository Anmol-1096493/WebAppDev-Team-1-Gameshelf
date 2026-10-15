import { useCallback, useEffect, useState } from 'react'
import AppShell, { type PageId } from './AppShell.tsx'
import { SessionsPage } from '../features/sessions/SessionsPage'
import { MockPage } from './MockPages.tsx'
import LoginPage from '../features/auth/LoginPage'
import { HomePage } from '../features/home/HomePage'
import { PublicLayout } from '../features/home/PublicLayout'
import { auth, clearToken, type Member } from '../api.ts'
import BoxDetailPage from '../pages/BoxDetailPage'
import LendingListPage from '../features/lending/LendingListPage.tsx'
import { lendingBoxes } from '../data/lendingBoxes'
import WishlistPage from '../pages/WishlistPage'
import WishlistDetailsPage from '../pages/WishlistDetailsPage'
import TradeOfferFormPage from '../pages/TradeOfferFormPage'
import TradeOffersPage from '../pages/TradeOffersPage'
import { CollectionPage } from '../features/collection/CollectionPage'
import { CollectionDetailPage } from '../features/collection/CollectionDetailPage'
import { CollectionRecordForm } from "../features/collection/CollectionRecordForm";
import { ShelvesPage } from "../features/shelves/ShelvesPage";
import { ShelfForm } from "../features/shelves/ShelfForm";
import { ShelfDetailPage } from "../features/shelves/ShelfDetailPage";

import './App.css'

type Route =
  | PageId
  | 'collection-detail'
  | 'collection-record-form'
  | 'shelf-form'
  | 'shelf-detail'
  | 'shelves'
  | 'wishlist-detail'
  | 'trade-offer-form'
  | 'trade-offers'
  | 'home'
  | 'login'

function pathToRoute(path: string): Route {
  const segments = path.split('/').filter(Boolean)
  const segment = segments[0] ?? ''

  // Collection detail pages use the /collections/:id URL structure.
  if (segment === 'collections' && segments.length > 1) {
    return 'collection-detail'
  }

  // Trade offer form: /wishlists/:id/offer
  if (
    segment === 'wishlists' &&
    segments.length === 3 &&
    /^\d+$/.test(segments[1]) &&
    segments[2] === 'offer'
  ) {
    return 'trade-offer-form'
  }

  // Wishlist detail: /wishlists/:id
  if (
    segment === 'wishlists' &&
    segments.length === 2 &&
    /^\d+$/.test(segments[1])
  ) {
    return 'wishlist-detail'
  }

  // Trade offers overview: /trade-offers
  if (segment === 'trade-offers' && segments.length === 1) {
    return 'trade-offers'
  }

  if (segment === 'collection-record') {
    return 'collection-record-form'
  }

  if (segment === 'shelf') {
    return 'shelf-form'
  }

  if (segment === 'shelf-detail') {
    return 'shelf-detail'
  }

  if (segment === 'shelves') {
    return 'shelves'
  }

  switch (segment) {
    case 'login':
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
  const [path, setPath] = useState(window.location.pathname)
  const route = pathToRoute(path)
  const [returnTo, setReturnTo] = useState(() =>
    route === 'home' || route === 'login' ? '/sessions' : path,
  )
  const boxId = path.match(/^\/lending\/boxes\/([^/]+)\/?$/)?.[1]
  const selectedBox = lendingBoxes.find((box) => box.id === boxId)
  const [member, setMember] = useState<Member | null>(null)
  const [authChecked, setAuthChecked] = useState(() => !localStorage.getItem('gameshelf.token'))

  // Restore the session from a stored token on first load.
  useEffect(() => {
    const token = localStorage.getItem('gameshelf.token')
    if (!token) return
    auth
      .me()
      .then(setMember)
      .catch(() => clearToken())
      .finally(() => setAuthChecked(true))
  }, [])

  // Kleine router voor bestaande links, inclusief terug/vooruit in de browser.
  const navigateTo = useCallback((destination: string) => {
    window.history.pushState({}, '', destination)
    setPath(window.location.pathname)
  }, [])

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element)?.closest('a')
      if (!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return
      const href = anchor.getAttribute('href') ?? ''
      if (!href.startsWith('/') || href.startsWith('//')) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return
      event.preventDefault()
      if (url.href !== window.location.href) navigateTo(url.pathname + url.search + url.hash)
    }
    function onPop() { setPath(window.location.pathname) }
    document.addEventListener('click', onClick)
    window.addEventListener('popstate', onPop)
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('popstate', onPop)
    }
  }, [navigateTo])

  const logout = useCallback(() => {
    clearToken()
    setMember(null)
    setReturnTo('/sessions')
    navigateTo('/')
  }, [navigateTo])

  function loggedIn(signedInMember: Member) {
    setMember(signedInMember)
    navigateTo(returnTo)
  }

  if (!authChecked) {
    return <PublicLayout><p role="status">Checking your sign-in…</p></PublicLayout>
  }

  // Bezoekers beginnen op de homepagina; het formulier staat apart op /login.
  // De backend blijft alle beveiligde API-aanroepen zelf controleren.
  if (!member) {
    return (
      <PublicLayout>
        {route === 'login' ? <LoginPage onLoggedIn={loggedIn} /> : <HomePage />}
      </PublicLayout>
    )
  }

  const currentPage: PageId | undefined =
    route === 'home' || route === 'login' ? undefined
      : route === 'collection-detail' || route === 'collection-record-form' ? 'collections'
      : route === 'shelf-form' || route === 'shelf-detail' ? 'shelves'
      : route === 'wishlist-detail' || route === 'trade-offer-form' || route === 'trade-offers' ? 'wishlists'
      : route

  return (
    <AppShell currentPage={currentPage} user={member} onLogout={logout}>
      {route === 'home' || route === 'login' ? (
        <HomePage signedIn />
      ) : route === 'collection-detail' ? (
        <CollectionDetailPage
          gameId={path.split('/').filter(Boolean)[1] ?? 1} />
      ) : route === 'collection-record-form' ? (
        <CollectionRecordForm />
      ) : route === 'shelf-form' ? (
        <ShelfForm />
      ) : route === 'shelf-detail' ? (
        <ShelfDetailPage shelfId={Number(path.split('/')[2]) || 1} />
      ) : route === 'shelves' ? (
        <ShelvesPage onSelectShelf={(id) => navigateTo(`/shelf-detail/${id}`)} />
      ) : route === 'collections' ? (
        <CollectionPage onSelectGame={(id) => navigateTo(`/collections/${id}`)} />
      ) : route === 'sessions' ? (
        <SessionsPage member={member} />
      ) : route === 'lending' ? (
        selectedBox ? (
          <BoxDetailPage box={selectedBox} />
        ) : (
          <LendingListPage />
        )
      ) : route === 'wishlists' ? (
        <WishlistPage />
      ) : route === 'wishlist-detail' ? (
        <WishlistDetailsPage />
      ) : route === 'trade-offer-form' ? (
        <TradeOfferFormPage />
      ) : route === 'trade-offers' ? (
        <TradeOffersPage />
      ) : (
        <MockPage page={currentPage ?? 'collections'} member={member} />
      )}
    </AppShell>
  )
}

export default App

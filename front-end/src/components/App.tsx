import { useCallback, useEffect, useState } from 'react'
import AppShell, { type PageId } from './AppShell.tsx'
import { SessionsPage } from '../features/sessions/SessionsPage'
import { MockPage } from './MockPages.tsx'
import { demoMember } from '../data/sessions'
import BoxDetailPage from '../pages/BoxDetailPage'
import LendingListPage from '../features/lending/LendingListPage.tsx'
import { lendingBoxes } from '../data/lendingBoxes'
import WishlistPage from '../features/wishlist/WishlistPage.tsx'
import WishlistDetailsPage from '../features/wishlist/WishlistDetailsPage.tsx'
import TradeOfferFormPage from '../features/trading/TradeOfferFormPage.tsx'
import TradeOffersPage from '../features/trading/TradeOffersPage.tsx'
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
    case 'catalogue':
    case 'collections':
    case 'lending':
    case 'sessions':
    case 'wishlists':
    case 'profile':
      return segment
    default:
      return 'collections'
  }
}

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const route = pathToRoute(path)
  const boxId = path.match(/^\/lending\/boxes\/([^/]+)\/?$/)?.[1]
  const selectedBox = lendingBoxes.find((box) => box.id === boxId)

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

  const currentPage: PageId =
    route === 'collection-detail' || route === 'collection-record-form' ? 'collections'
      : route === 'shelf-form' || route === 'shelf-detail' ? 'shelves'
      : route === 'wishlist-detail' || route === 'trade-offer-form' || route === 'trade-offers' ? 'wishlists'
      : route

  return (
    <AppShell currentPage={currentPage}>
      {route === 'collection-detail' ? (
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
        <SessionsPage />
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
        <MockPage page={currentPage} member={demoMember} />
      )}
    </AppShell>
  )
}

export default App

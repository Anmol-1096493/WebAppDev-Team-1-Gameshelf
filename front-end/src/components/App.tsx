import AppShell from './AppShell.tsx'
import BoxDetailPage from '../pages/BoxDetailPage'
import LendingListPage from '../pages/LendingListPage'
import { lendingBoxes } from '../data/lendingBoxes'

function App() {
  const boxId = window.location.pathname.match(/^\/lending\/boxes\/([^/]+)\/?$/)?.[1]
  const selectedBox = lendingBoxes.find((box) => box.id === boxId)

  return (
    <AppShell currentPage="lending">
      {selectedBox ? <BoxDetailPage box={selectedBox} /> : <LendingListPage />}
    </AppShell>
  )
}

export default App

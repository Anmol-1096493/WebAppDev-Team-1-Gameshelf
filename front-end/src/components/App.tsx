import AppShell from './AppShell.tsx'
import './App.css'

function App() {
  return (
    <AppShell currentPage="collections">
      <section aria-labelledby="page-title">
        <p className="eyebrow">Your games</p>
        <h1 id="page-title">Collections</h1>
        <p className="text-muted">
          Manage your board games, shelves and play statistics.
        </p>

        <div className="page-placeholder card">
          <div className="card__body">
            <h2>Page content</h2>
            <p>
              Replace this block with the content for the current module. The shared
              header, navigation and footer stay the same on every page.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  )
}

export default App

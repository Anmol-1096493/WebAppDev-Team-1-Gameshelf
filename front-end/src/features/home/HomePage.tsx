import './HomePage.css'

// Startpagina: eerst kennismaken met de club, daarna bewust naar het inloggen.
export function HomePage({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <section className="home-page" aria-labelledby="page-title">
      <h1 id="page-title">Welcome to GameShelf</h1>
      <p className="home-intro">
        The place for our board game club. Keep track of your games,
        share your collection and arrange a game night with other members.
      </p>
      <a className="button button--primary" href={signedIn ? '/sessions' : '/login'}>
        {signedIn ? 'View sessions' : 'Sign in to GameShelf'}
      </a>
      <div className="home-about">
        <h2>Play together</h2>
        <p>
          Members can host a session, choose a time and place, and invite others to join.
          If a table is full, you can join the waiting list.
        </p>
      </div>
    </section>
  )
}

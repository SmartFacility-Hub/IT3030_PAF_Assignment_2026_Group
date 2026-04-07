import { Link, Outlet } from 'react-router-dom';
import '../styles/bookings.css';

/**
 * Layout wrapper for Module B routes; applies orange theme scope and local nav.
 */
export default function BookingsShell() {
  return (
    <div className="bookings-module">
      <header className="bookings-nav">
        <Link to="/bookings/my" className="bookings-nav-brand">
          Bookings — Smart Campus
        </Link>
        <nav aria-label="Booking module">
          <ul className="bookings-nav-links">
            <li>
              <Link to="/bookings/new">New request</Link>
            </li>
            <li>
              <Link to="/bookings/my">My bookings</Link>
            </li>
            <li>
              <Link to="/bookings/admin">Admin</Link>
            </li>
            <li>
              <Link to="/">Hub home</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="bookings-main">
        <Outlet />
      </main>
    </div>
  );
}

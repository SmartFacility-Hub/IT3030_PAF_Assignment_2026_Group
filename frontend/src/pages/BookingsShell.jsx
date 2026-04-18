import { NavLink, Outlet } from 'react-router-dom';
import '../styles/bookings.css';

/**
 * Layout wrapper for Module B routes; applies orange theme scope and local nav.
 */
export default function BookingsShell() {
  return (
    <div className="bookings-module">
      <header className="bookings-nav">
        <NavLink to="/bookings/my" className="bookings-nav-brand">
          Bookings — Smart Campus
        </NavLink>
        <nav aria-label="Booking module">
          <ul className="bookings-nav-links">
            <li>
              <NavLink to="/bookings/my" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
                My Bookings
              </NavLink>
            </li>
            <li>
              <NavLink to="/bookings/new" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
                New Booking
              </NavLink>
            </li>
            <li>
              <NavLink to="/bookings/admin" className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
                Admin
              </NavLink>
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

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BookingsShell from './pages/BookingsShell';
import BookingFormPage from './pages/BookingFormPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bookings" element={<BookingsShell />}>
          <Route index element={<Navigate to="my" replace />} />
          <Route path="new" element={<BookingFormPage />} />
          <Route path="my" element={<MyBookingsPage />} />
          <Route path="admin" element={<AdminBookingsPage />} />
          <Route path=":id" element={<BookingDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

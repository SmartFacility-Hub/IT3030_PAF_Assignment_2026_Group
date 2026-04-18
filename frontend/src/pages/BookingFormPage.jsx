import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../services/bookingService';
import { BOOKING_RESOURCE_OPTIONS } from '../config/bookingResourceOptions';

function timeToMinutes(t) {
  if (!t || typeof t !== 'string') return NaN;
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
}

function extractMessage(err) {
  const data = err?.response?.data;
  if (typeof data === 'string') return data;
  if (data?.message) return Array.isArray(data.message) ? data.message.join(' ') : data.message;
  return err?.message || 'Something went wrong.';
}

export default function BookingFormPage() {
  const navigate = useNavigate();
  const [resourceId, setResourceId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [conflictMessage, setConflictMessage] = useState('');

  const selectedResourceName = useMemo(() => {
    const rid = Number(resourceId);
    const match = BOOKING_RESOURCE_OPTIONS.find((r) => Number(r.id) === rid);
    return match?.name || '';
  }, [resourceId]);

  function extractValidationErrors(err) {
    const d = err?.response?.data;
    if (!d || typeof d !== 'object') return null;
    if (d.errors && typeof d.errors === 'object') return d.errors;
    if (d.fieldErrors && typeof d.fieldErrors === 'object') return d.fieldErrors;
    if (Array.isArray(d.violations)) {
      const out = {};
      d.violations.forEach((v) => {
        if (v?.field && v?.message && !out[v.field]) out[v.field] = v.message;
      });
      return Object.keys(out).length ? out : null;
    }
    return null;
  }

  useEffect(() => {
    setLoading(false);
  }, []);

  const validate = () => {
    const errors = {};
    if (!resourceId) errors.resourceId = 'Resource is required.';
    if (!bookingDate) errors.bookingDate = 'Date is required.';
    if (!startTime) errors.startTime = 'Start time is required.';
    if (!endTime) errors.endTime = 'End time is required.';
    if (!purpose?.trim()) errors.purpose = 'Purpose is required.';
    if (expectedAttendees === '' || expectedAttendees === null) {
      errors.expectedAttendees = 'Expected attendees is required.';
    } else if (Number(expectedAttendees) < 1) {
      errors.expectedAttendees = 'Enter at least 1 attendee.';
    }
    const sm = timeToMinutes(startTime);
    const em = timeToMinutes(endTime);
    if (!errors.startTime && !errors.endTime && !Number.isNaN(sm) && !Number.isNaN(em) && em <= sm) {
      errors.endTime = 'End time must be after start time.';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitSuccess('');
    setConflictMessage('');
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      resourceId: Number(resourceId),
      resourceName: selectedResourceName,
      bookingDate,
      startTime,
      endTime,
      purpose: purpose.trim(),
      expectedAttendees: Number(expectedAttendees),
    };

    setLoading(true);
    try {
      // BACKEND: POST /api/bookings — creates booking, expects 201 Created
      await createBooking(payload);
      setSubmitSuccess('Booking created successfully. Redirecting to My Bookings…');
      navigate('/bookings/my', { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        setConflictMessage(
          'This resource is already booked for the selected time. Please choose a different time.',
        );
      } else if (status === 400) {
        const validationErrors = extractValidationErrors(err);
        if (validationErrors) setFieldErrors(validationErrors);
        setError(extractMessage(err));
      } else {
        setError(extractMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="bookings-page-title">New booking request</h1>
      <p className="bookings-page-sub">
        Submit a request for campus resources. Administrators review pending requests before approval.
      </p>

      {submitSuccess && <div className="bookings-alert bookings-alert--success">{submitSuccess}</div>}
      {error && <div className="bookings-alert bookings-alert--error">{error}</div>}
      {conflictMessage && <div className="bookings-alert bookings-alert--conflict">{conflictMessage}</div>}

      <form className="bookings-form" onSubmit={handleSubmit} noValidate>
        <div className="bookings-form-row">
          <label htmlFor="resourceId">Resource</label>
          <select
            id="resourceId"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            required
            aria-invalid={!!fieldErrors.resourceId}
          >
            <option value="">Select a resource…</option>
            {BOOKING_RESOURCE_OPTIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          {fieldErrors.resourceId && <div className="bookings-field-error">{fieldErrors.resourceId}</div>}
        </div>

        <div className="bookings-form-row">
          <label htmlFor="bookingDate">Date</label>
          <input
            id="bookingDate"
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            required
            aria-invalid={!!fieldErrors.bookingDate}
          />
          {fieldErrors.bookingDate && <div className="bookings-field-error">{fieldErrors.bookingDate}</div>}
        </div>

        <div className="bookings-form-row">
          <label htmlFor="startTime">Start time</label>
          <input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            aria-invalid={!!fieldErrors.startTime}
          />
          {fieldErrors.startTime && <div className="bookings-field-error">{fieldErrors.startTime}</div>}
        </div>

        <div className="bookings-form-row">
          <label htmlFor="endTime">End time</label>
          <input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            aria-invalid={!!fieldErrors.endTime}
          />
          {fieldErrors.endTime && <div className="bookings-field-error">{fieldErrors.endTime}</div>}
        </div>

        <div className="bookings-form-row">
          <label htmlFor="purpose">Purpose</label>
          <textarea
            id="purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
            placeholder="Describe how the space will be used."
            aria-invalid={!!fieldErrors.purpose}
          />
          {fieldErrors.purpose && <div className="bookings-field-error">{fieldErrors.purpose}</div>}
        </div>

        <div className="bookings-form-row">
          <label htmlFor="expectedAttendees">Expected attendees</label>
          <input
            id="expectedAttendees"
            type="number"
            min={1}
            step={1}
            value={expectedAttendees}
            onChange={(e) => setExpectedAttendees(e.target.value)}
            required
            aria-invalid={!!fieldErrors.expectedAttendees}
          />
          {fieldErrors.expectedAttendees && (
            <div className="bookings-field-error">{fieldErrors.expectedAttendees}</div>
          )}
        </div>

        <button type="submit" className="bookings-btn bookings-btn--primary" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit booking'}
        </button>
      </form>
    </div>
  );
}

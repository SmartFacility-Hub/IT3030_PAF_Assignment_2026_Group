import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../services/bookingService';
import { getAllFacilities } from '../services/facilityService';

const styles = `
  .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; gap: 16px; }
  .page-label {
    font-family: var(--font-mono); font-size: 10px; font-weight: 500;
    color: var(--accent); letter-spacing: 0.15em; text-transform: uppercase;
    margin-bottom: 6px; display: flex; align-items: center; gap: 8px;
  }
  .page-label::before { content: ''; display: block; width: 18px; height: 1px; background: var(--accent); }
  .page-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.025em; line-height: 1.1; }
  .page-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 6px; }
  
  .card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; padding: 24px; max-width: 700px; }
  
  .form-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 16px; }
  .form-label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
  .form-input, .form-select, .form-textarea {
    background: var(--bg-elevated); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 9px 12px;
    font-family: var(--font-body); font-size: 13px; color: var(--text-primary);
    transition: border-color 0.2s; width: 100%; outline: none;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--accent-border); }
  .form-textarea { resize: vertical; min-height: 72px; }
  .form-select option { background: var(--bg-surface); }

  .btn-primary {
    padding: 9px 18px; border: none; border-radius: var(--radius-sm);
    background: var(--accent); color: var(--accent-fg);
    font-family: var(--font-body); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; justify-content: center; width: 100%;
  }
  .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }

  .bookings-field-error { color: var(--status-red); font-size: 12px; margin-top: 4px; }
  .bookings-alert { padding: 12px 16px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 16px; }
  .bookings-alert--success { background: var(--status-green-bg); color: var(--status-green); border: 1px solid var(--status-green); }
  .bookings-alert--error { background: var(--status-red-bg); color: var(--status-red); border: 1px solid var(--status-red); }
  .bookings-alert--conflict { background: var(--status-amber-bg); color: var(--status-amber); border: 1px solid var(--status-amber); }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeInUp 0.5s ease both; }
`;

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
  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState(null);
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

  const computedSelectedFacility = useMemo(() => {
    const rid = Number(resourceId);
    if (!rid) return null;
    return facilities.find((f) => Number(f.id) === rid) || null;
  }, [facilities, resourceId]);

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
    const loadFacilities = async () => {
      try {
        setFacilitiesLoading(true);
        const response = await getAllFacilities();
        const data = Array.isArray(response?.data) ? response.data : [];
        const active = data.filter((f) => {
          const s = (f?.status ?? '').toString().toUpperCase();
          return s === 'ACTIVE';
        });
        setFacilities(active);
      } catch (err) {
        console.error('Failed to load facilities', err);
        setFacilities([]);
      } finally {
        setFacilitiesLoading(false);
        setLoading(false);
      }
    };
    loadFacilities();
  }, []);

  useEffect(() => {
    setSelectedFacility(computedSelectedFacility);
  }, [computedSelectedFacility]);

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

    if (selectedFacility && Number(expectedAttendees) > selectedFacility.capacity) {
      setError(
        `Expected attendees (${expectedAttendees}) exceeds the capacity of ${selectedFacility.name} (max: ${selectedFacility.capacity} people). Please reduce attendees or choose a larger facility.`
      );
      return;
    }

    const payload = {
      resourceId: Number(resourceId),
      resourceName: computedSelectedFacility?.name || '',
      bookingDate,
      startTime,
      endTime,
      purpose: purpose.trim(),
      expectedAttendees: Number(expectedAttendees),
    };

    setLoading(true);
    try {
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
    <div style={{ padding: "32px", minHeight: "calc(100vh - 60px)", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      <div className="card fade-in" style={{ width: "100%" }}>
        <div className="page-header">
          <div>
            <div className="page-title">New booking request</div>
            <div className="page-subtitle">Submit a request for campus resources. Administrators review pending requests before approval.</div>
          </div>
        </div>

        {submitSuccess && <div className="bookings-alert bookings-alert--success">{submitSuccess}</div>}
        {error && <div className="bookings-alert bookings-alert--error">{error}</div>}
        {conflictMessage && <div className="bookings-alert bookings-alert--conflict">{conflictMessage}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="form-label" htmlFor="resourceId">Resource *</label>
            {facilitiesLoading ? (
              <div style={{fontSize: "13px", color: "var(--text-muted)"}}>Loading available facilities...</div>
            ) : facilities.length === 0 ? (
              <div style={{fontSize: "13px", color: "var(--status-red)"}}>No facilities available. Please contact admin.</div>
            ) : (
              <select
                className="form-select"
                id="resourceId"
                name="resourceId"
                value={resourceId}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  const facility = facilities.find((f) => Number(f.id) === selectedId) || null;
                  setResourceId(e.target.value);
                  setSelectedFacility(facility);
                }}
                required
              >
                <option value="">Select a facility...</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name} — {facility.type} (Capacity: {facility.capacity} | {facility.location})
                  </option>
                ))}
              </select>
            )}
            {fieldErrors.resourceId && <div className="bookings-field-error">{fieldErrors.resourceId}</div>}
            
            {selectedFacility && (
              <div style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', padding: '12px', marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <p style={{marginBottom: 4}}><strong>Type:</strong> {selectedFacility.type}</p>
                <p style={{marginBottom: 4}}><strong>Capacity:</strong> {selectedFacility.capacity} people</p>
                <p style={{marginBottom: 4}}><strong>Location:</strong> {selectedFacility.location}</p>
                {selectedFacility.description && <p style={{marginBottom: 4}}><strong>Description:</strong> {selectedFacility.description}</p>}
                {(selectedFacility.availability_start || selectedFacility.availabilityStart) && (
                  <p><strong>Available:</strong> {selectedFacility.availability_start || selectedFacility.availabilityStart} — {selectedFacility.availability_end || selectedFacility.availabilityEnd}</p>
                )}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="bookingDate">Date *</label>
              <input
                className="form-input"
                id="bookingDate"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                required
              />
              {fieldErrors.bookingDate && <div className="bookings-field-error">{fieldErrors.bookingDate}</div>}
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="expectedAttendees">Expected attendees *</label>
              <input
                className="form-input"
                id="expectedAttendees"
                type="number"
                min={1}
                step={1}
                placeholder="e.g. 20"
                value={expectedAttendees}
                onChange={(e) => setExpectedAttendees(e.target.value)}
                required
              />
              {selectedFacility && expectedAttendees && Number(expectedAttendees) > selectedFacility.capacity && (
                <p style={{color: 'var(--status-red)', fontSize: '11px', marginTop: '4px'}}>
                  ⚠️ Exceeds max capacity of {selectedFacility.capacity}
                </p>
              )}
              {fieldErrors.expectedAttendees && <div className="bookings-field-error">{fieldErrors.expectedAttendees}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="startTime">Start time *</label>
              <input
                className="form-input"
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
              {fieldErrors.startTime && <div className="bookings-field-error">{fieldErrors.startTime}</div>}
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="endTime">End time *</label>
              <input
                className="form-input"
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
              {fieldErrors.endTime && <div className="bookings-field-error">{fieldErrors.endTime}</div>}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="purpose">Purpose *</label>
            <textarea
              className="form-textarea"
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
              placeholder="Describe how the space will be used..."
            />
            {fieldErrors.purpose && <div className="bookings-field-error">{fieldErrors.purpose}</div>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{marginTop: 16}}>
            {loading ? 'Submitting…' : 'Submit Booking Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

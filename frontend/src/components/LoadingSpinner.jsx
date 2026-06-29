export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-wrapper" style={{ flexDirection: 'column', gap: '1rem' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>{message}</p>
    </div>
  );
}

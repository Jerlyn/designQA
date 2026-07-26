'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h2>Something went wrong</h2>
          <button
            onClick={reset}
            style={{
              marginTop: '1rem',
              padding: '8px 16px',
              backgroundColor: '#36069A',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

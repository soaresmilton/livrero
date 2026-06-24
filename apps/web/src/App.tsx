function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '24px',
        padding: '48px',
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: '48px',
          height: '48px',
          backgroundColor: 'var(--color-primary)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 19.5A2.5 2.5 0 016.5 17H20"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Headline */}
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: 'Source Serif 4, Georgia, serif',
            fontSize: '48px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: '56px',
            color: 'var(--color-on-surface)',
            marginBottom: '12px',
          }}
        >
          Livrero
        </h1>
        <p
          style={{
            fontFamily: 'Hanken Grotesk, system-ui, sans-serif',
            fontSize: '18px',
            fontWeight: 400,
            lineHeight: '28px',
            color: 'var(--color-on-surface-variant)',
            maxWidth: '400px',
          }}
        >
          Your personal reading sanctuary is being built.
        </p>
      </div>

      {/* Status badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          backgroundColor: 'var(--color-surface-container)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: '9999px',
        }}
      >
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
          }}
        />
        <span
          style={{
            fontFamily: 'Hanken Grotesk, system-ui, sans-serif',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--color-on-surface-variant)',
            letterSpacing: '0.01em',
          }}
        >
          Milestone 0 — Foundation
        </span>
      </div>
    </div>
  )
}

export default App

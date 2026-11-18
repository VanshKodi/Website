export function WisprFlowAltsPage() {
  const publicUrl = `${import.meta.env.BASE_URL}wisprflowAlts.html`;
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#0B0B0B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}
    >
      <iframe
        src={publicUrl}
        style={{
          width: 'min(96vw, 1200px)',
          height: 'min(90vh, 800px)',
          border: 'none',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
        title="Wispr Flow Alternatives"
      />
    </div>
  );
}

export default function FlightSkeleton({ theme }) {
  const isLight = theme === 'light'
  const bg  = isLight ? 'rgba(14,165,233,0.06)' : 'rgba(255,255,255,0.05)'
  const bg2 = isLight ? 'rgba(14,165,233,0.10)' : 'rgba(255,255,255,0.08)'

  const Pulse = ({ w, h = '12px', style = {} }) => (
    <div style={{
      width: w, height: h, borderRadius: '6px',
      background: bg2, animation: 'pulse 1.5s ease-in-out infinite',
      ...style
    }} />
  )

  return (
    <div style={{
      background: isLight ? 'rgba(255,255,255,0.80)' : 'rgba(20,30,53,0.60)',
      border: `1px solid ${isLight ? 'rgba(14,165,233,0.12)' : 'rgba(56,189,248,0.08)'}`,
      borderRadius: '16px', padding: '16px 20px', marginBottom: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <Pulse w="120px" h="14px" />
        <Pulse w="80px" h="14px" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div>
          <Pulse w="48px" h="20px" style={{ marginBottom: '4px' }} />
          <Pulse w="64px" h="10px" />
        </div>
        <Pulse w="60px" h="10px" style={{ flex: 1 }} />
        <div style={{ textAlign: 'right' }}>
          <Pulse w="48px" h="20px" style={{ marginBottom: '4px', marginLeft: 'auto' }} />
          <Pulse w="64px" h="10px" style={{ marginLeft: 'auto' }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Pulse w="100px" h="10px" />
        <Pulse w="80px" h="24px" style={{ borderRadius: '8px' }} />
      </div>
    </div>
  )
}
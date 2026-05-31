import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#060b14', color: '#f1f5f9', padding: '24px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✈️</div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            Что-то пошло не так
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: '24px', textAlign: 'center' }}>
            Произошла неожиданная ошибка. Попробуйте перезагрузить страницу.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#0ea5e9', color: '#fff', border: 'none',
              padding: '10px 24px', borderRadius: '12px',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer'
            }}>
            Перезагрузить
          </button>
          {import.meta.env.DEV && (
            <pre style={{
              marginTop: '24px', padding: '16px', background: 'rgba(248,81,73,0.1)',
              border: '1px solid rgba(248,81,73,0.25)', borderRadius: '8px',
              fontSize: '12px', color: '#f87171', maxWidth: '600px', overflow: 'auto'
            }}>
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
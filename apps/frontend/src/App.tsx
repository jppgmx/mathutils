import { useEffect, useState } from 'react'
import { checkHealth } from './health'
import './App.css'

type Connection =
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; message: string }

function App() {
  const [connection, setConnection] = useState<Connection>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let disposed = false
    const timeout = setTimeout(() => controller.abort(), 10_000)

    async function verifyConnection() {
      try {
        await checkHealth(controller.signal)
        if (!disposed) setConnection({ status: 'success' })
      } catch (error) {
        if (disposed) return
        const message = controller.signal.aborted
          ? 'A API demorou para responder. Tente novamente.'
          : error instanceof TypeError
            ? 'Não foi possível conectar à API. Tente novamente.'
            : error instanceof Error
              ? error.message
              : 'Não foi possível verificar a conexão.'
        setConnection({ status: 'error', message })
      } finally {
        clearTimeout(timeout)
      }
    }

    void verifyConnection()
    return () => {
      disposed = true
      clearTimeout(timeout)
      controller.abort()
    }
  }, [attempt])

  function retry() {
    setConnection({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  return (
    <main className="app">
      <header>
        <p className="eyebrow">Utilitários matemáticos</p>
        <h1>mathutils</h1>
        <p>Ferramentas para estudar, visualizar e explorar a matemática.</p>
      </header>

      <section className="connection" aria-labelledby="connection-title">
        <h2 id="connection-title">Conexão com a API</h2>
        <div role="status" aria-live="polite" aria-atomic="true">
          {connection.status === 'loading' && <p>Verificando conexão…</p>}
          {connection.status === 'success' && (
            <p className="success">Conexão estabelecida. A API está disponível.</p>
          )}
          {connection.status === 'error' && (
            <p className="error">{connection.message}</p>
          )}
        </div>
        <button onClick={retry} disabled={connection.status === 'loading'}>
          {connection.status === 'loading' ? 'Aguarde…' : 'Verificar novamente'}
        </button>
      </section>
    </main>
  )
}

export default App

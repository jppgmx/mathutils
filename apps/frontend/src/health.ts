export async function checkHealth(
  signal: AbortSignal,
  request: typeof fetch = fetch,
): Promise<void> {
  const response = await request('/api/health', {
    signal,
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`A API respondeu com erro HTTP ${response.status}.`)
  }
  if (!response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('A API não retornou uma resposta JSON.')
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error('A API retornou um JSON inválido.')
  }

  if (
    response.status !== 200 ||
    typeof payload !== 'object' ||
    payload === null ||
    !('status' in payload) ||
    payload.status !== 'ok'
  ) {
    throw new Error('A API retornou um resultado inesperado.')
  }
}

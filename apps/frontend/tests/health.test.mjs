import assert from 'node:assert/strict'
import test from 'node:test'
import { checkHealth } from '../src/health.ts'

const jsonHeaders = { 'content-type': 'application/json' }

test('consulta a mesma origem e aceita o contrato do health check', async () => {
  const controller = new AbortController()
  await checkHealth(controller.signal, async (url, options) => {
    assert.equal(url, '/api/health')
    assert.equal(options.signal, controller.signal)
    assert.equal(options.cache, 'no-store')
    return new Response('{"status":"ok"}', { headers: jsonHeaders })
  })
})

for (const [name, response, error] of [
  ['erro HTTP', () => new Response('', { status: 503 }), /HTTP 503/],
  ['fallback HTML', () => new Response('<html></html>', {
    headers: { 'content-type': 'text/html' },
  }), /não retornou uma resposta JSON/],
  ['JSON inválido', () => new Response('{', { headers: jsonHeaders }), /JSON inválido/],
  ['status inesperado', () => new Response('{"status":"down"}', {
    headers: jsonHeaders,
  }), /resultado inesperado/],
  ['JSON nulo', () => new Response('null', { headers: jsonHeaders }), /resultado inesperado/],
]) {
  test(`rejeita ${name}`, async () => {
    await assert.rejects(
      checkHealth(new AbortController().signal, async () => response()),
      error,
    )
  })
}

test('propaga falha de rede para a interface', async () => {
  await assert.rejects(
    checkHealth(new AbortController().signal, async () => {
      throw new TypeError('Network failure')
    }),
    TypeError,
  )
})

import { describe, expect, it, vi } from 'vitest'
import { createOpenMeteoProvider } from '../src/weather/open-meteo'

function responseFor(codes: number[]): Response {
  return new Response(JSON.stringify({
    current: { temperature_2m: 24, weather_code: codes[0] },
    daily: {
      time: codes.map((_, index) => `2026-07-${String(index + 1).padStart(2, '0')}`),
      weather_code: codes,
      temperature_2m_max: codes.map(() => 28),
      temperature_2m_min: codes.map(() => 20),
    },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}

describe('Open-Meteo weather intensity mapping', () => {
  it('keeps drizzle, rain, heavy rain and thunderstorms distinct', async () => {
    const codes = [51, 61, 63, 65, 82, 95]
    const fetchImpl = vi.fn(async () => responseFor(codes)) as unknown as typeof fetch
    const provider = createOpenMeteoProvider({ latitude: 30.57, longitude: 104.06, fetchImpl })

    const snapshot = await provider.getSnapshot()

    expect(snapshot.daily.map(item => item.kind)).toEqual([
      'drizzle',
      'rain',
      'rain',
      'heavy-rain',
      'heavy-rain',
      'storm',
    ])
  })
})

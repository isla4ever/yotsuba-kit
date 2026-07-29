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
    hourly: {
      time: codes.map((_, index) => `2026-07-01T${String(index + 8).padStart(2, '0')}:00`),
      weather_code: codes,
      temperature_2m: codes.map((_, index) => 22 + index),
    },
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}

describe('Open-Meteo weather intensity mapping', () => {
  it('keeps drizzle, rain, heavy rain and thunderstorms distinct', async () => {
    const codes = [51, 61, 63, 65, 82, 95]
    const fetchMock = vi.fn(async (_input: Parameters<typeof fetch>[0]) => responseFor(codes))
    const fetchImpl = fetchMock as unknown as typeof fetch
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
    expect(snapshot.hourly?.map(item => item.kind)).toEqual([
      'drizzle',
      'rain',
      'rain',
      'heavy-rain',
      'heavy-rain',
      'storm',
    ])
    expect(snapshot.hourly?.[0]).toMatchObject({
      time: '2026-07-01T08:00',
      temperatureC: 22,
    })
    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]))
    expect(requestUrl.searchParams.get('hourly')).toBe('temperature_2m,weather_code')
  })
})

import type { DailyWeather, WeatherKind, WeatherProvider, WeatherSnapshot } from '../types'

/**
 * open-meteo.com 参考实现（免费、无 key）。
 * 独立入口按需导入，不用则完全 tree-shake 掉；组件库核心绝不主动发网络请求。
 */
export interface OpenMeteoOptions {
  latitude: number
  longitude: number
  /** 缓存毫秒数，默认 30 分钟 */
  cacheMs?: number
  fetchImpl?: typeof fetch
}

function kindOf(code: number): WeatherKind {
  if (code === 0) return 'clear'
  if (code <= 2) return 'cloudy'
  if (code === 3) return 'overcast'
  if (code <= 48) return 'fog'
  if (code <= 55) return 'drizzle'
  if (code <= 67) return 'rain'
  if (code <= 77) return 'snow'
  if (code <= 82) return 'rain'
  if (code <= 86) return 'snow'
  return 'storm'
}

export function createOpenMeteoProvider(options: OpenMeteoOptions): WeatherProvider {
  const { latitude, longitude, cacheMs = 30 * 60_000, fetchImpl = fetch } = options
  let cached: WeatherSnapshot | null = null

  return {
    async getSnapshot(): Promise<WeatherSnapshot> {
      if (cached && Date.now() - cached.updatedAt < cacheMs) {
        return cached
      }
      const url = new URL('https://api.open-meteo.com/v1/forecast')
      url.searchParams.set('latitude', String(latitude))
      url.searchParams.set('longitude', String(longitude))
      url.searchParams.set('current', 'temperature_2m,weather_code')
      url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min')
      url.searchParams.set('timezone', 'auto')
      url.searchParams.set('forecast_days', '7')

      const response = await fetchImpl(url)
      if (!response.ok) {
        throw new Error(`open-meteo request failed: ${response.status}`)
      }
      const data = await response.json() as {
        current?: { temperature_2m?: number, weather_code?: number }
        daily?: { time?: string[], weather_code?: number[], temperature_2m_max?: number[], temperature_2m_min?: number[] }
      }

      const daily: DailyWeather[] = (data.daily?.time ?? []).map((date, index) => ({
        date,
        kind: kindOf(data.daily?.weather_code?.[index] ?? 0),
        highC: data.daily?.temperature_2m_max?.[index],
        lowC: data.daily?.temperature_2m_min?.[index],
      }))

      cached = {
        current: data.current
          ? { kind: kindOf(data.current.weather_code ?? 0), temperatureC: data.current.temperature_2m }
          : undefined,
        daily,
        updatedAt: Date.now(),
      }
      return cached
    },
  }
}

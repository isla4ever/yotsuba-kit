import vue from '@vitejs/plugin-vue'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue(), cssInjectedByJs()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', '@iyotsuba/schedule-core'],
    },
  },
  test: {
    environment: 'jsdom',
  },
})

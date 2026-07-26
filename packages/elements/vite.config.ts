import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue({ customElement: true })],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'YotsubaSchedule',
      formats: ['es', 'iife'],
      fileName: format => format === 'iife' ? 'schedule-elements.iife.js' : 'schedule-elements.js',
    },
  },
})

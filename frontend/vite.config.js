import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The Amplify login library is big (~800 kB). That is fine for a demo,
  // so we raise the warning limit instead of splitting the code.
  build: { chunkSizeWarningLimit: 1000 },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { quality: 80 },
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Figma-to-code asset aliases (used in Hero & DealerSection)
      'figma:asset/f8dc7777327b42afd15eb4819ba6c3a3eab8abc9.png': path.resolve(__dirname, './src/assets/f8dc7777327b42afd15eb4819ba6c3a3eab8abc9.png'),
      'figma:asset/e23b0e4a5d033dfb8ed6611f9e7eb8086d0179ca.png': path.resolve(__dirname, './src/assets/e23b0e4a5d033dfb8ed6611f9e7eb8086d0179ca.png'),
      'figma:asset/cf97d32c2fc387c6addf7f4fae6f30eb5bd24553.png': path.resolve(__dirname, './src/assets/cf97d32c2fc387c6addf7f4fae6f30eb5bd24553.png'),
      'figma:asset/a8374bfb8280ce30b87f15764a9aaf76bf6338dc.png': path.resolve(__dirname, './src/assets/a8374bfb8280ce30b87f15764a9aaf76bf6338dc.png'),
      'figma:asset/65b443d7a3bf7b902c52cc36db6945d79d4d1f1a.png': path.resolve(__dirname, './src/assets/65b443d7a3bf7b902c52cc36db6945d79d4d1f1a.png'),
      'figma:asset/6510649f53fe69f45ad70939a1f203e84b49a615.png': path.resolve(__dirname, './src/assets/6510649f53fe69f45ad70939a1f203e84b49a615.png'),
      'figma:asset/63c9d5a6a2098633b091967e690527819dc1c029.png': path.resolve(__dirname, './src/assets/63c9d5a6a2098633b091967e690527819dc1c029.png'),
      'figma:asset/50d2d3ced0e2dd397b40f90fe14b51495f2b7940.png': path.resolve(__dirname, './src/assets/50d2d3ced0e2dd397b40f90fe14b51495f2b7940.png'),
      'figma:asset/40ddce25e816838294d1702c319704a8686dc645.png': path.resolve(__dirname, './src/assets/40ddce25e816838294d1702c319704a8686dc645.png'),
      'figma:asset/3c2b8795a92c4b2b191c058220691332d0c5f5de.png': path.resolve(__dirname, './src/assets/3c2b8795a92c4b2b191c058220691332d0c5f5de.png'),
      'figma:asset/390f92a85bda9c4472f78caeb066537cb2e19721.png': path.resolve(__dirname, './src/assets/390f92a85bda9c4472f78caeb066537cb2e19721.png'),
      'figma:asset/356ed74642390f964957f56c9c7e341b840be530.png': path.resolve(__dirname, './src/assets/356ed74642390f964957f56c9c7e341b840be530.png'),
      'figma:asset/0c9155e42b382419879c00270bf1f4e926f38d64.png': path.resolve(__dirname, './src/assets/0c9155e42b382419879c00270bf1f4e926f38d64.png'),
      'figma:asset/09ad94a08f80ddcd0bdc4edd5e14bd84ec860674.png': path.resolve(__dirname, './src/assets/09ad94a08f80ddcd0bdc4edd5e14bd84ec860674.png'),
      'figma:asset/07f1147c0f25ede9aa338ba9c51e437a4cac912f.png': path.resolve(__dirname, './src/assets/07f1147c0f25ede9aa338ba9c51e437a4cac912f.png'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
  },
  server: {
    port: 3000,
    open: true,
  },
});

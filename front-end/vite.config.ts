import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
/* import { viteStaticCopy } from 'vite-plugin-static-copy' */

export default defineConfig({
  server:
  {
    port:3000,
  },
  plugins: [
    react(),
    tailwindcss(),
    /* viteStaticCopy({
      targets: [
        {
          src: 'src/assets/*',  // Source directory
          dest: 'src/assets'         // Destination directory in dist/
        }
      ]
    }) */
  ]
})

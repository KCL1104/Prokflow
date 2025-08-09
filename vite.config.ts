import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
<<<<<<< HEAD
=======
import { resolve } from 'path'
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
=======
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    // Production build optimizations
    target: 'es2022',
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'chartjs-adapter-date-fns'],
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', '@dnd-kit/modifiers'],
          
          // Feature chunks
          'auth-features': [
            './src/components/auth/LoginForm',
            './src/components/auth/SignupForm',
            './src/components/auth/ResetPasswordForm',
            './src/hooks/useAuth',
            './src/services/authService'
          ],
          'project-features': [
            './src/components/projects/ProjectForm',
            './src/services/projectService'
          ],
          'board-features': [
            './src/components/board/KanbanBoard',
            './src/components/board/ScrumBoard',
            './src/components/board/BoardCard',
            './src/hooks/useBoardDragDrop'
          ],
          'chart-features': [
            './src/components/charts/BurndownChart',
            './src/components/charts/GanttChart',
            './src/components/charts/VelocityChart',
            './src/hooks/useGanttData'
          ]
        },
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            if (facadeModuleId) {
              return `assets/[name]-[hash].js`
            }
          return 'assets/[name]-[hash].js'
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Increase chunk size warning limit for better optimization
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'chart.js',
      'react-chartjs-2',
      '@dnd-kit/core',
      '@dnd-kit/sortable'
    ]
  },
  // Environment variable handling
  define: {
    // Ensure environment variables are properly handled in production
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
>>>>>>> 490e7fc (Enhance frontend and fix all other errors)
})

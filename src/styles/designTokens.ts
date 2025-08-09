// Modern Tech-Focused Design System
// Color palette inspired by modern project management tools

export const designTokens = {
  colors: {
    // Primary colors - Clean Tech Blue
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    
    // Neutral grays - Clean and minimal
    gray: {
      25: '#fcfcfd',
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    // Warm background colors - Light yellow and cream tones
    warm: {
      25: '#fffef7',   // Very light cream
      50: '#fffbeb',   // Light yellow
      100: '#fef3c7',  // Cream
      200: '#fde68a',  // Light warm yellow
      300: '#fcd34d',  // Warm yellow
      400: '#f59e0b',  // Golden yellow
      500: '#d97706',  // Amber
      600: '#b45309',  // Dark amber
    },
    
    // Enhanced border colors - More visible borders
    border: {
      light: '#e5e7eb',     // Light gray border
      default: '#d1d5db',   // Default border (stronger)
      medium: '#9ca3af',    // Medium border
      strong: '#6b7280',    // Strong border
      accent: '#fcd34d',    // Warm accent border
    },
    
    // Status colors - Clean and purposeful
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
  },
  
  // Typography scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  
  // Spacing and sizing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  
  // Border radius for modern look
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  
  // Shadows for depth
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
    lg: '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
    none: 'none',
    // Subtle colored shadows for primary actions only
    'primary-sm': '0 2px 8px rgba(14, 165, 233, 0.1)'
  }
};

// CSS Custom Properties for clean tech minimalism
export const cssCustomProperties = `
  :root {
    /* Primary Colors */
    --primary-50: ${designTokens.colors.primary[50]};
    --primary-100: ${designTokens.colors.primary[100]};
    --primary-200: ${designTokens.colors.primary[200]};
    --primary-500: ${designTokens.colors.primary[500]};
    --primary-600: ${designTokens.colors.primary[600]};
    --primary-700: ${designTokens.colors.primary[700]};
    
    /* Neutral Grays */
    --gray-25: ${designTokens.colors.gray[25]};
    --gray-50: ${designTokens.colors.gray[50]};
    --gray-100: ${designTokens.colors.gray[100]};
    --gray-200: ${designTokens.colors.gray[200]};
    --gray-300: ${designTokens.colors.gray[300]};
    --gray-400: ${designTokens.colors.gray[400]};
    --gray-500: ${designTokens.colors.gray[500]};
    --gray-600: ${designTokens.colors.gray[600]};
    --gray-700: ${designTokens.colors.gray[700]};
    --gray-900: ${designTokens.colors.gray[900]};
    
    /* Warm Background Colors */
    --warm-25: ${designTokens.colors.warm[25]};
    --warm-50: ${designTokens.colors.warm[50]};
    --warm-100: ${designTokens.colors.warm[100]};
    --warm-200: ${designTokens.colors.warm[200]};
    --warm-300: ${designTokens.colors.warm[300]};
    --warm-400: ${designTokens.colors.warm[400]};
    --warm-500: ${designTokens.colors.warm[500]};
    --warm-600: ${designTokens.colors.warm[600]};
    
    /* Enhanced Border Colors */
    --border-light: ${designTokens.colors.border.light};
    --border-default: ${designTokens.colors.border.default};
    --border-medium: ${designTokens.colors.border.medium};
    --border-strong: ${designTokens.colors.border.strong};
    --border-accent: ${designTokens.colors.border.accent};
    
    /* Accent Colors */
    --success: ${designTokens.colors.success[500]};
    --warning: ${designTokens.colors.warning[500]};
    --error: ${designTokens.colors.error[500]};
    --info: ${designTokens.colors.info[500]};
    
    /* Typography */
    --font-family-sans: ${designTokens.typography.fontFamily.sans};
    --font-family-mono: ${designTokens.typography.fontFamily.mono};
    
    --text-xs: ${designTokens.typography.fontSize.xs};
    --text-sm: ${designTokens.typography.fontSize.sm};
    --text-base: ${designTokens.typography.fontSize.base};
    --text-lg: ${designTokens.typography.fontSize.lg};
    --text-xl: ${designTokens.typography.fontSize.xl};
    --text-2xl: ${designTokens.typography.fontSize['2xl']};
    --text-3xl: ${designTokens.typography.fontSize['3xl']};
    --text-4xl: ${designTokens.typography.fontSize['4xl']};
    
    --font-normal: ${designTokens.typography.fontWeight.normal};
    --font-medium: ${designTokens.typography.fontWeight.medium};
    --font-semibold: ${designTokens.typography.fontWeight.semibold};
    --font-bold: ${designTokens.typography.fontWeight.bold};
    
    /* Spacing System (4px base) */
    --space-1: ${designTokens.spacing.xs};
    --space-2: ${designTokens.spacing.sm};
    --space-3: 0.75rem;
    --space-4: ${designTokens.spacing.md};
    --space-5: 1.25rem;
    --space-6: ${designTokens.spacing.lg};
    --space-8: ${designTokens.spacing.xl};
    --space-10: 2.5rem;
    --space-12: ${designTokens.spacing['2xl']};
    --space-16: 4rem;
    
    /* Border Radius */
    --border-radius-sm: ${designTokens.borderRadius.sm};
    --border-radius-md: ${designTokens.borderRadius.md};
    --border-radius-lg: ${designTokens.borderRadius.lg};
    
    /* Clean Shadows */
    --shadow-xs: ${designTokens.shadows.xs};
    --shadow-sm: ${designTokens.shadows.sm};
    --shadow-md: ${designTokens.shadows.md};
    --shadow-primary-sm: ${designTokens.shadows['primary-sm']};
  }
`;
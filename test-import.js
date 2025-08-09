// Simple test to check if the module exports work
try {
  const module = require('./src/hooks/useResponsive.ts');
  console.log('Module exports:', Object.keys(module));
  console.log('useResponsive:', typeof module.useResponsive);
  console.log('useResponsiveValue:', typeof module.useResponsiveValue);
  console.log('useTouchDevice:', typeof module.useTouchDevice);
  console.log('useOrientation:', typeof module.useOrientation);
} catch (error) {
  console.error('Import error:', error.message);
}
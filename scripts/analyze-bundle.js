#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the production build bundle and provides optimization recommendations
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const BUNDLE_SIZE_LIMITS = {
  // Size limits in KB
  TOTAL_JS: 1000,
  TOTAL_CSS: 200,
  CHUNK_WARNING: 250,
  CHUNK_ERROR: 500
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundleSize() {
  console.log('🔍 Analyzing bundle size...\n');
  
  const distPath = join(process.cwd(), 'dist');
  
  if (!existsSync(distPath)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  try {
    // Get file sizes
    const output = execSync('dir /s /-c dist', { encoding: 'utf8' });
    const lines = output.split('\n');
    
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    const chunks = [];

    lines.forEach(line => {
      if (line.includes('.js') && !line.includes('<DIR>')) {
        const match = line.match(/(\d+)\s+.*\.js$/);
        if (match) {
          const size = parseInt(match[1]);
          jsSize += size;
          totalSize += size;
          chunks.push({ name: line.trim().split(' ').pop(), size, type: 'js' });
        }
      } else if (line.includes('.css') && !line.includes('<DIR>')) {
        const match = line.match(/(\d+)\s+.*\.css$/);
        if (match) {
          const size = parseInt(match[1]);
          cssSize += size;
          totalSize += size;
          chunks.push({ name: line.trim().split(' ').pop(), size, type: 'css' });
        }
      }
    });

    // Sort chunks by size
    chunks.sort((a, b) => b.size - a.size);

    console.log('📊 Bundle Analysis Results:');
    console.log('═'.repeat(50));
    console.log(`Total Bundle Size: ${formatBytes(totalSize)}`);
    console.log(`JavaScript: ${formatBytes(jsSize)}`);
    console.log(`CSS: ${formatBytes(cssSize)}`);
    console.log('');

    // Check against limits
    const jsKB = jsSize / 1024;
    const cssKB = cssSize / 1024;

    if (jsKB > BUNDLE_SIZE_LIMITS.TOTAL_JS) {
      console.log(`⚠️  JavaScript bundle exceeds recommended size (${BUNDLE_SIZE_LIMITS.TOTAL_JS}KB)`);
    } else {
      console.log(`✅ JavaScript bundle size is within limits`);
    }

    if (cssKB > BUNDLE_SIZE_LIMITS.TOTAL_CSS) {
      console.log(`⚠️  CSS bundle exceeds recommended size (${BUNDLE_SIZE_LIMITS.TOTAL_CSS}KB)`);
    } else {
      console.log(`✅ CSS bundle size is within limits`);
    }

    console.log('\n📦 Largest Chunks:');
    console.log('─'.repeat(50));
    
    chunks.slice(0, 10).forEach((chunk, index) => {
      const sizeKB = chunk.size / 1024;
      const status = sizeKB > BUNDLE_SIZE_LIMITS.CHUNK_ERROR ? '🔴' : 
                    sizeKB > BUNDLE_SIZE_LIMITS.CHUNK_WARNING ? '🟡' : '🟢';
      
      console.log(`${index + 1}. ${status} ${chunk.name} - ${formatBytes(chunk.size)}`);
    });

    console.log('\n💡 Optimization Recommendations:');
    console.log('─'.repeat(50));
    
    const recommendations = [];
    
    if (jsKB > BUNDLE_SIZE_LIMITS.TOTAL_JS) {
      recommendations.push('• Consider implementing more aggressive code splitting');
      recommendations.push('• Review and remove unused dependencies');
      recommendations.push('• Implement tree shaking for large libraries');
    }
    
    if (chunks.some(chunk => chunk.size / 1024 > BUNDLE_SIZE_LIMITS.CHUNK_ERROR)) {
      recommendations.push('• Large chunks detected - consider splitting them further');
      recommendations.push('• Review manual chunk configuration in vite.config.ts');
    }
    
    if (recommendations.length === 0) {
      console.log('✅ Bundle size looks good! No immediate optimizations needed.');
    } else {
      recommendations.forEach(rec => console.log(rec));
    }

  } catch (error) {
    console.error('❌ Error analyzing bundle:', error.message);
    process.exit(1);
  }
}

function checkDependencies() {
  console.log('\n🔍 Analyzing Dependencies...\n');
  
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const heavyDeps = [
      '@dnd-kit/core', '@dnd-kit/sortable', 'chart.js', 'react-chartjs-2'
    ];
    
    console.log('📚 Heavy Dependencies Analysis:');
    console.log('─'.repeat(50));
    
    heavyDeps.forEach(dep => {
      if (deps[dep]) {
        console.log(`📦 ${dep} - ${deps[dep]}`);
      }
    });
    
    console.log('\n💡 Dependency Recommendations:');
    console.log('─'.repeat(50));
    console.log('• Consider lazy loading chart components');
    console.log('• Implement dynamic imports for drag-and-drop features');
    console.log('• Use React.memo() for expensive components');
    console.log('• Consider using lighter alternatives for non-critical features');
    
  } catch (error) {
    console.error('❌ Error analyzing dependencies:', error.message);
  }
}

// Main execution
console.log('🚀 Production Build Analysis\n');
analyzeBundleSize();
checkDependencies();

console.log('\n✨ Analysis complete!');
console.log('Run "npm run build" to generate a fresh build for analysis.');
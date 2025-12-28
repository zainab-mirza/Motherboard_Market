#!/usr/bin/env node

// Deployment verification script
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying deployment readiness...\n');

const checks = [
  {
    name: 'package.json exists',
    check: () => fs.existsSync('package.json'),
    fix: 'Create package.json with npm init'
  },
  {
    name: 'vercel.json configuration',
    check: () => fs.existsSync('vercel.json'),
    fix: 'vercel.json file is missing'
  },
  {
    name: 'API entry point exists',
    check: () => fs.existsSync('api/index.ts'),
    fix: 'api/index.ts file is missing'
  },
  {
    name: 'Server file exists',
    check: () => fs.existsSync('src/server.ts'),
    fix: 'src/server.ts file is missing'
  },
  {
    name: 'Public directory exists',
    check: () => fs.existsSync('public') && fs.existsSync('public/index.html'),
    fix: 'public/index.html file is missing'
  },
  {
    name: 'All engine files exist',
    check: () => {
      const engines = [
        'src/engines/HardwareSourcingEngine.ts',
        'src/engines/ComponentParser.ts',
        'src/engines/FirstCopyHeuristic.ts',
        'src/engines/ComponentBridge.ts',
        'src/engines/JugaadDetector.ts',
        'src/engines/NegotiationDelta.ts',
        'src/engines/GrayMarketAnalyzer.ts'
      ];
      return engines.every(engine => fs.existsSync(engine));
    },
    fix: 'One or more engine files are missing'
  },
  {
    name: 'TypeScript configuration',
    check: () => fs.existsSync('tsconfig.json'),
    fix: 'tsconfig.json file is missing'
  },
  {
    name: '.vercelignore exists',
    check: () => fs.existsSync('.vercelignore'),
    fix: '.vercelignore file is missing'
  }
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${check.name}`);
  
  if (!passed) {
    console.log(`   Fix: ${check.fix}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 All checks passed! Ready for Vercel deployment.');
  console.log('\n📋 Next steps:');
  console.log('1. git add .');
  console.log('2. git commit -m "Ready for Vercel deployment"');
  console.log('3. git push origin main');
  console.log('4. Deploy on vercel.com or run: vercel --prod');
  console.log('\n🌐 Your app will be available at: https://your-project.vercel.app');
} else {
  console.log('❌ Some checks failed. Please fix the issues above before deploying.');
  process.exit(1);
}

console.log('\n🚀 Lamington Road Market - Ready for the cloud!');
import StyleDictionary from 'style-dictionary';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ─── Read prefix from ds.config.json ───────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const dsConfig = JSON.parse(
  readFileSync(resolve(__dirname, '../../ds.config.json'), 'utf-8')
);
const PREFIX = dsConfig.prefix || 'vcds';

console.log(`  Prefix: --${PREFIX}-*\n`);

// ─── Custom Transforms ─────────────────────────────────────────────
StyleDictionary.registerTransform({
  name: 'name/ds-kebab',
  type: 'name',
  transform: (token) => {
    return `${PREFIX}-${token.path.join('-')}`;
  },
});

// ─── Web Platform ──────────────────────────────────────────────────
const webConfig = {
  source: [
    'src/primitives/**/*.json',
    'src/semantic/light.json',
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      transforms: ['name/ds-kebab'],
      buildPath: 'platforms/web/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: { outputReferences: true },
        },
      ],
    },
    scss: {
      transformGroup: 'scss',
      transforms: ['name/ds-kebab'],
      buildPath: 'platforms/web/',
      files: [
        {
          destination: '_tokens.scss',
          format: 'scss/variables',
          options: { outputReferences: true },
        },
      ],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'platforms/web/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
        },
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
        },
      ],
    },
  },
};

// ─── Dark Theme (CSS override) ─────────────────────────────────────
const darkConfig = {
  source: [
    'src/primitives/**/*.json',
    'src/semantic/dark.json',
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      transforms: ['name/ds-kebab'],
      buildPath: 'platforms/web/',
      files: [
        {
          destination: 'tokens-dark.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
            selector: '[data-theme="dark"]',
          },
        },
      ],
    },
  },
};

// ─── High Contrast Theme ───────────────────────────────────────────
const highContrastConfig = {
  source: [
    'src/primitives/**/*.json',
    'src/semantic/high-contrast.json',
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      transforms: ['name/ds-kebab'],
      buildPath: 'platforms/web/',
      files: [
        {
          destination: 'tokens-high-contrast.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
            selector: '[data-theme="high-contrast"]',
          },
        },
      ],
    },
  },
};

// ─── iOS Platform ──────────────────────────────────────────────────
const iosConfig = {
  source: [
    'src/primitives/**/*.json',
    'src/semantic/light.json',
  ],
  platforms: {
    ios: {
      transformGroup: 'ios-swift',
      buildPath: 'platforms/ios/',
      files: [
        {
          destination: 'DesignTokens.swift',
          format: 'ios-swift/enum.swift',
          className: 'DesignTokens',
          filter: (token) => !token.path.includes('elevation'),
        },
      ],
    },
    'ios-colors': {
      transformGroup: 'ios-swift',
      buildPath: 'platforms/ios/',
      files: [
        {
          destination: 'ColorTokens.swift',
          format: 'ios-swift/enum.swift',
          className: 'ColorTokens',
          filter: (token) => token.attributes?.category === 'color',
        },
      ],
    },
  },
};

// ─── Android Platform ──────────────────────────────────────────────
const androidConfig = {
  source: [
    'src/primitives/**/*.json',
    'src/semantic/light.json',
  ],
  platforms: {
    android: {
      transformGroup: 'android',
      buildPath: 'platforms/android/',
      files: [
        {
          destination: 'tokens.xml',
          format: 'android/resources',
        },
        {
          destination: 'colors.xml',
          format: 'android/colors',
          filter: (token) => token.attributes?.category === 'color',
        },
        {
          destination: 'dimens.xml',
          format: 'android/dimens',
          filter: (token) =>
            token.attributes?.category === 'spacing' ||
            token.attributes?.category === 'font-size',
        },
      ],
    },
  },
};

// ─── Build All ─────────────────────────────────────────────────────
async function build() {
  console.log('🎨 Building design tokens...\n');

  const configs = [
    { name: 'Web (light)', config: webConfig },
    { name: 'Web (dark)', config: darkConfig },
    { name: 'Web (high-contrast)', config: highContrastConfig },
    { name: 'iOS', config: iosConfig },
    { name: 'Android', config: androidConfig },
  ];

  for (const { name, config } of configs) {
    console.log(`  → ${name}`);
    const sd = new StyleDictionary(config);
    await sd.buildAllPlatforms();
  }

  console.log('\n✅ All tokens built successfully!');
}

build().catch(console.error);

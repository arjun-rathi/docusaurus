/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {fileURLToPath} from 'url';

process.env.TZ = 'UTC';

const ignorePatterns = [
  '/node_modules/',
  '__fixtures__',
  '/testUtils.ts',
  '/packages/docusaurus/lib',
  '/packages/docusaurus-utils/lib',
  '/packages/docusaurus-utils-validation/lib',
  '/packages/docusaurus-plugin-content-blog/lib',
  '/packages/docusaurus-plugin-content-docs/lib',
  '/packages/docusaurus-plugin-content-pages/lib',
  '/packages/docusaurus-theme-classic/lib',
  '/packages/docusaurus-theme-classic/lib-next',
  '/packages/docusaurus-migrate/lib',
];

export default {
  rootDir: fileURLToPath(new URL('.', import.meta.url)),
  verbose: true,
  testURL: 'https://docusaurus.io/',
  testEnvironment: 'node',
  testPathIgnorePatterns: ignorePatterns,
  coveragePathIgnorePatterns: ignorePatterns,
  transform: {
    '^.+\\.[jt]sx?$': '@swc/jest',
  },
  errorOnDeprecated: true,
  moduleNameMapper: {
    // Jest can't resolve CSS or asset imports
    '^.+\\.(css|jpe?g|png|svg|webp)$': '<rootDir>/jest/emptyModule.ts',

    // Using src instead of lib, so we always get fresh source
    '@docusaurus/(browserContext|BrowserOnly|ComponentCreator|constants|docusaurusContext|ExecutionEnvironment|Head|Interpolate|isInternalUrl|Link|Noop|renderRoutes|router|Translate|use.*)':
      '@docusaurus/core/src/client/exports/$1',
    // Maybe point to a fixture?
    '@generated/.*': '<rootDir>/jest/emptyModule.ts',
    // TODO use "projects" + multiple configs if we work on another theme?
    '@theme/(.*)': '@docusaurus/theme-classic/src/theme/$1',
    '@site/(.*)': 'website/$1',

    // Using src instead of lib, so we always get fresh source
    '@docusaurus/plugin-content-docs/client':
      '@docusaurus/plugin-content-docs/src/client/index.ts',
  },
  snapshotSerializers: ['<rootDir>/jest/snapshotPathNormalizer.ts'],
  snapshotFormat: {
    printBasicPrototype: false,
  },
};

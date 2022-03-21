/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  mergeTranslations,
  updateTranslationFileMessages,
  getPluginI18nPath,
} from '../i18nUtils';

describe('mergeTranslations', () => {
  it('works', () => {
    expect(
      mergeTranslations([
        {
          T1: {message: 'T1 message', description: 'T1 desc'},
          T2: {message: 'T2 message', description: 'T2 desc'},
          T3: {message: 'T3 message', description: 'T3 desc'},
        },
        {
          T4: {message: 'T4 message', description: 'T4 desc'},
        },
        {T2: {message: 'T2 message 2', description: 'T2 desc 2'}},
      ]),
    ).toEqual({
      T1: {message: 'T1 message', description: 'T1 desc'},
      T2: {message: 'T2 message 2', description: 'T2 desc 2'},
      T3: {message: 'T3 message', description: 'T3 desc'},
      T4: {message: 'T4 message', description: 'T4 desc'},
    });
  });
});

describe('updateTranslationFileMessages', () => {
  it('works', () => {
    expect(
      updateTranslationFileMessages(
        {
          path: 'abc',
          content: {
            t1: {message: 't1 message', description: 't1 desc'},
            t2: {message: 't2 message', description: 't2 desc'},
            t3: {message: 't3 message', description: 't3 desc'},
          },
        },
        (message) => `prefix ${message} suffix`,
      ),
    ).toEqual({
      path: 'abc',
      content: {
        t1: {message: 'prefix t1 message suffix', description: 't1 desc'},
        t2: {message: 'prefix t2 message suffix', description: 't2 desc'},
        t3: {message: 'prefix t3 message suffix', description: 't3 desc'},
      },
    });
  });
});

describe('getPluginI18nPath', () => {
  it('gets correct path', () => {
    expect(
      getPluginI18nPath({
        siteDir: __dirname,
        locale: 'zh-Hans',
        pluginName: 'plugin-content-docs',
        pluginId: 'community',
        subPaths: ['foo'],
      }),
    ).toMatchInlineSnapshot(
      `"<PROJECT_ROOT>/packages/docusaurus-utils/src/__tests__/i18n/zh-Hans/plugin-content-docs-community/foo"`,
    );
  });
  it('gets correct path for default plugin', () => {
    expect(
      getPluginI18nPath({
        siteDir: __dirname,
        locale: 'zh-Hans',
        pluginName: 'plugin-content-docs',
        subPaths: ['foo'],
      }).replace(__dirname, ''),
    ).toMatchInlineSnapshot(`"/i18n/zh-Hans/plugin-content-docs/foo"`);
  });
  it('gets correct path when no sub-paths', () => {
    expect(
      getPluginI18nPath({
        siteDir: __dirname,
        locale: 'zh-Hans',
        pluginName: 'plugin-content-docs',
      }).replace(__dirname, ''),
    ).toMatchInlineSnapshot(`"/i18n/zh-Hans/plugin-content-docs"`);
  });
});

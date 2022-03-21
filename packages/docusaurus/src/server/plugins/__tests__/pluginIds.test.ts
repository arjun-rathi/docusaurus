/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {InitializedPlugin} from '@docusaurus/types';
import {ensureUniquePluginInstanceIds} from '../pluginIds';

function createTestPlugin(name: string, id?: string): InitializedPlugin {
  // @ts-expect-error: good enough for tests
  return {
    name,
    options: {id},
  };
}

describe('ensureUniquePluginInstanceIds', () => {
  it('accept single instance plugins', async () => {
    ensureUniquePluginInstanceIds([
      createTestPlugin('plugin-docs'),
      createTestPlugin('plugin-blog'),
      createTestPlugin('plugin-pages'),
    ]);
  });

  it('accept single instance plugins, all with sameId', async () => {
    ensureUniquePluginInstanceIds([
      createTestPlugin('plugin-docs', 'sameId'),
      createTestPlugin('plugin-blog', 'sameId'),
      createTestPlugin('plugin-pages', 'sameId'),
    ]);
  });

  it('accept multi instance plugins without id', async () => {
    ensureUniquePluginInstanceIds([
      createTestPlugin('plugin-docs', 'ios'),
      createTestPlugin('plugin-docs', 'android'),
      createTestPlugin('plugin-pages', 'pages'),
    ]);
  });

  it('reject multi instance plugins without id', async () => {
    expect(() =>
      ensureUniquePluginInstanceIds([
        createTestPlugin('plugin-docs'),
        createTestPlugin('plugin-docs'),
      ]),
    ).toThrowErrorMatchingSnapshot();
  });

  it('reject multi instance plugins with same id', async () => {
    expect(() =>
      ensureUniquePluginInstanceIds([
        createTestPlugin('plugin-docs', 'sameId'),
        createTestPlugin('plugin-docs', 'sameId'),
      ]),
    ).toThrowErrorMatchingSnapshot();
  });

  it('reject multi instance plugins with some without id', async () => {
    expect(() =>
      ensureUniquePluginInstanceIds([
        createTestPlugin('plugin-docs'),
        createTestPlugin('plugin-docs', 'ios'),
        createTestPlugin('plugin-docs'),
        createTestPlugin('plugin-pages'),
        createTestPlugin('plugin-pages', 'pages2'),
      ]),
    ).toThrowErrorMatchingSnapshot();
  });
});

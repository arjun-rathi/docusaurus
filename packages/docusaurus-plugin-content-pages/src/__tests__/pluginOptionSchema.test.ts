/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {PluginOptionSchema, DEFAULT_OPTIONS} from '../pluginOptionSchema';
import type {PluginOptions} from '@docusaurus/plugin-content-pages';

function normalizePluginOptions(
  options: Partial<PluginOptions>,
): PluginOptions {
  const {value, error} = PluginOptionSchema.validate(options, {
    convert: false,
  });
  if (error) {
    throw error;
  } else {
    return value;
  }
}

describe('normalizePagesPluginOptions', () => {
  it('returns default options for undefined user options', () => {
    const value = normalizePluginOptions({});
    expect(value).toEqual(DEFAULT_OPTIONS);
  });

  it('fills in default options for partially defined user options', () => {
    const value = normalizePluginOptions({path: 'src/pages'});
    expect(value).toEqual(DEFAULT_OPTIONS);
  });

  it('accepts correctly defined user options', () => {
    const userOptions = {
      path: 'src/my-pages',
      routeBasePath: 'my-pages',
      include: ['**/*.{js,jsx,ts,tsx}'],
      exclude: ['**/$*/'],
    };
    const value = normalizePluginOptions(userOptions);
    expect(value).toEqual({...DEFAULT_OPTIONS, ...userOptions});
  });

  it('rejects bad path inputs', () => {
    expect(() => {
      normalizePluginOptions({
        // @ts-expect-error: bad attribute
        path: 42,
      });
    }).toThrowErrorMatchingInlineSnapshot(`"\\"path\\" must be a string"`);
  });
});

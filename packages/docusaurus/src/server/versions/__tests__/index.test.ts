/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {getPluginVersion} from '..';
import path from 'path';

describe('getPluginVersion', () => {
  it('detects external packages plugins versions', async () => {
    await expect(
      getPluginVersion(
        path.join(__dirname, '__fixtures__/dummy-plugin.js'),
        // Make the plugin appear external.
        path.join(__dirname, '..', '..', '..', '..', '..', '..', 'website'),
      ),
    ).resolves.toEqual({type: 'package', version: 'random-version'});
  });

  it('detects project plugins versions', async () => {
    await expect(
      getPluginVersion(
        path.join(__dirname, '__fixtures__/dummy-plugin.js'),
        // Make the plugin appear project local.
        path.join(__dirname, '__fixtures__'),
      ),
    ).resolves.toEqual({type: 'project'});
  });

  it('detect local packages versions', async () => {
    await expect(getPluginVersion('/', '/')).resolves.toEqual({type: 'local'});
  });
});

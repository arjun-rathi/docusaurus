/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';
import Vibrant from 'node-vibrant';
import type {Palette} from 'node-vibrant/lib/color';

import {toPalette, toBase64} from '../utils';

describe('toBase64', () => {
  it('returns a properly formatted Base64 image string', () => {
    const mockedMimeType = 'image/jpeg';
    const mockedBase64Data = Buffer.from('hello world');
    expect(toBase64(mockedMimeType, mockedBase64Data)).toBe(
      'data:image/jpeg;base64,aGVsbG8gd29ybGQ=',
    );
  });
});

describe('toPalette', () => {
  let correctTestSwatch: Palette = {};
  let testSwatchWithNull: Palette & {Vibrant?: null} = {};

  beforeAll(() => {
    const imgPath = path.join(__dirname, '__fixtures__/endi.jpg');
    const vibrant = new Vibrant(imgPath, {});

    return vibrant.getPalette().then((palette) => {
      correctTestSwatch = {...palette};
      testSwatchWithNull = {...palette, Vibrant: null};
    });
  });

  it('returns 6 hex colours sorted by popularity', () => {
    expect(toPalette(correctTestSwatch)).toHaveLength(6);
  });

  it('returns 5 hex colours with no errors if a palette was incomplete', () => {
    expect(toPalette(testSwatchWithNull)).toHaveLength(5);
  });
});

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {jest} from '@jest/globals';
import path from 'path';
import {loadSidebars, DisabledSidebars} from '../index';
import type {SidebarProcessorParams} from '../types';
import {DefaultSidebarItemsGenerator} from '../generator';

describe('loadSidebars', () => {
  const fixtureDir = path.join(__dirname, '__fixtures__', 'sidebars');
  const params: SidebarProcessorParams = {
    sidebarItemsGenerator: DefaultSidebarItemsGenerator,
    numberPrefixParser: (filename) => ({filename}),
    docs: [
      {
        source: '@site/docs/foo/bar.md',
        sourceDirName: 'foo',
        id: 'bar',
        frontMatter: {},
      },
    ],
    version: {
      contentPath: path.join(fixtureDir, 'docs'),
      contentPathLocalized: path.join(fixtureDir, 'docs'),
    },
    categoryLabelSlugger: null,
    sidebarOptions: {sidebarCollapsed: true, sidebarCollapsible: true},
  };
  it('sidebars with known sidebar item type', async () => {
    const sidebarPath = path.join(fixtureDir, 'sidebars.json');
    const result = await loadSidebars(sidebarPath, params);
    expect(result).toMatchSnapshot();
  });

  it('sidebars with deep level of category', async () => {
    const sidebarPath = path.join(fixtureDir, 'sidebars-category.js');
    const result = await loadSidebars(sidebarPath, params);
    expect(result).toMatchSnapshot();
  });

  it('sidebars shorthand and longhand lead to exact same sidebar', async () => {
    const sidebarPath1 = path.join(fixtureDir, 'sidebars-category.js');
    const sidebarPath2 = path.join(
      fixtureDir,
      'sidebars-category-shorthand.js',
    );
    const sidebar1 = await loadSidebars(sidebarPath1, params);
    const sidebar2 = await loadSidebars(sidebarPath2, params);
    expect(sidebar1).toEqual(sidebar2);
  });

  it('sidebars with category but category.items is not an array', async () => {
    const sidebarPath = path.join(
      fixtureDir,
      'sidebars-category-wrong-items.json',
    );
    await expect(() =>
      loadSidebars(sidebarPath, params),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Invalid sidebar items collection [36m\`\\"doc1\\"\`[39m in [36m\`items\`[39m of the category [34m[1mCategory Label[22m[39m: it must either be an array of sidebar items or a shorthand notation (which doesn't contain a [36m\`type\`[39m property). See [36m[4mhttps://docusaurus.io/docs/sidebar/items[24m[39m for all valid syntaxes."`,
    );
  });

  it('sidebars with first level not a category', async () => {
    const sidebarPath = path.join(
      fixtureDir,
      'sidebars-first-level-not-category.js',
    );
    const result = await loadSidebars(sidebarPath, params);
    expect(result).toMatchSnapshot();
  });

  it('sidebars link', async () => {
    const sidebarPath = path.join(fixtureDir, 'sidebars-link.json');
    const result = await loadSidebars(sidebarPath, params);
    expect(result).toMatchSnapshot();
  });

  it('nonexistent path', async () => {
    await expect(loadSidebars('bad/path', params)).resolves.toEqual(
      DisabledSidebars,
    );
  });

  it('undefined path', async () => {
    await expect(loadSidebars(undefined, params)).resolves.toMatchSnapshot();
  });

  it('literal false path', async () => {
    await expect(loadSidebars(false, params)).resolves.toEqual(
      DisabledSidebars,
    );
  });

  it('sidebars with category.collapsed property', async () => {
    const sidebarPath = path.join(fixtureDir, 'sidebars-collapsed.json');
    const result = await loadSidebars(sidebarPath, params);
    expect(result).toMatchSnapshot();
  });

  it('sidebars with category.collapsed property at first level', async () => {
    const sidebarPath = path.join(
      fixtureDir,
      'sidebars-collapsed-first-level.json',
    );
    const result = await loadSidebars(sidebarPath, params);
    expect(result).toMatchSnapshot();
  });

  it('duplicate category metadata files', async () => {
    const sidebarPath = path.join(
      fixtureDir,
      'sidebars-collapsed-first-level.json',
    );
    const consoleWarnMock = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const consoleErrorMock = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    await expect(() =>
      loadSidebars(sidebarPath, {
        ...params,
        version: {
          contentPath: path.join(fixtureDir, 'invalid-docs'),
          contentPathLocalized: path.join(fixtureDir, 'invalid-docs'),
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`"\\"foo\\" is not allowed"`);
    expect(consoleWarnMock).toBeCalledWith(
      expect.stringMatching(
        /.*\[WARNING\].* There are more than one category metadata files for .*foo.*: foo\/_category_.json, foo\/_category_.yml. The behavior is undetermined./,
      ),
    );
    expect(consoleErrorMock).toBeCalledWith(
      expect.stringMatching(
        /.*\[ERROR\].* The docs sidebar category metadata file .*foo\/_category_.json.* looks invalid!/,
      ),
    );
  });
});

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger from '@docusaurus/logger';
import fs from 'fs-extra';
import path from 'path';
import _ from 'lodash';
import {Globby, posixPath, THEME_PATH} from '@docusaurus/utils';
import type {SwizzleAction, SwizzleComponentConfig} from '@docusaurus/types';
import type {SwizzleOptions} from './common';
import {askSwizzleAction} from './prompts';

export const SwizzleActions: SwizzleAction[] = ['wrap', 'eject'];

export async function getAction(
  componentConfig: SwizzleComponentConfig,
  options: Pick<SwizzleOptions, 'wrap' | 'eject'>,
): Promise<SwizzleAction> {
  if (options.wrap) {
    return 'wrap';
  }
  if (options.eject) {
    return 'eject';
  }
  return askSwizzleAction(componentConfig);
}

export type ActionParams = {
  siteDir: string;
  themePath: string;
  componentName: string;
};

export type ActionResult = {
  createdFiles: string[];
};

async function isDir(dirPath: string): Promise<boolean> {
  return (
    (await fs.pathExists(dirPath)) && (await fs.stat(dirPath)).isDirectory()
  );
}

export async function eject({
  siteDir,
  themePath,
  componentName,
}: ActionParams): Promise<ActionResult> {
  const fromPath = path.join(themePath, componentName);
  const isDirectory = await isDir(fromPath);
  const globPattern = isDirectory
    ? // do we really want to copy all components?
      path.join(fromPath, '*')
    : `${fromPath}.*`;

  const globPatternPosix = posixPath(globPattern);

  const filesToCopy = await Globby(globPatternPosix, {
    ignore: ['**/*.{story,stories,test,tests}.{js,jsx,ts,tsx}'],
  });

  if (filesToCopy.length === 0) {
    // This should never happen
    throw new Error(
      logger.interpolate`No files to copy from path=${fromPath} with glob code=${globPatternPosix}`,
    );
  }

  const toPath = isDirectory
    ? path.join(siteDir, THEME_PATH, componentName)
    : path.join(siteDir, THEME_PATH);

  await fs.ensureDir(toPath);

  const createdFiles = await Promise.all(
    filesToCopy.map(async (sourceFile: string) => {
      const fileName = path.basename(sourceFile);
      const targetFile = path.join(toPath, fileName);
      try {
        await fs.copy(sourceFile, targetFile, {overwrite: true});
      } catch (err) {
        throw new Error(
          logger.interpolate`Could not copy file from ${sourceFile} to ${targetFile}`,
        );
      }
      return targetFile;
    }),
  );
  return {createdFiles};
}

export async function wrap({
  siteDir,
  themePath,
  componentName: themeComponentName,
  typescript,
  importType = 'original',
}: ActionParams & {
  typescript: boolean;
  importType?: 'original' | 'init';
}): Promise<ActionResult> {
  const isDirectory = await isDir(path.join(themePath, themeComponentName));

  // Top/Parent/ComponentName => ComponentName
  const componentName = _.last(themeComponentName.split('/'));
  const wrapperComponentName = `${componentName}Wrapper`;

  const wrapperFileName = `${themeComponentName}${isDirectory ? '/index' : ''}${
    typescript ? '.tsx' : '.js'
  }`;

  await fs.ensureDir(path.resolve(siteDir, THEME_PATH));

  const toPath = path.resolve(siteDir, THEME_PATH, wrapperFileName);

  const content = typescript
    ? `import React, {ComponentProps} from 'react';
import type ${componentName}Type from '@theme/${themeComponentName}';
import ${componentName} from '@theme-${importType}/${themeComponentName}';

type Props = ComponentProps<typeof ${componentName}Type>

export default function ${wrapperComponentName}(props: Props): JSX.Element {
  return (
    <>
      <${componentName} {...props} />
    </>
  );
}
`
    : `import React from 'react';
import ${componentName} from '@theme-${importType}/${themeComponentName}';

export default function ${wrapperComponentName}(props) {
  return (
    <>
      <${componentName} {...props} />
    </>
  );
}
`;

  await fs.outputFile(toPath, content);

  return {createdFiles: [toPath]};
}

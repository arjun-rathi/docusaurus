/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * This feature was heavily inspired by create-react-app and
 * uses many of the same utility functions to implement it.
 */

import {execSync} from 'child_process';
import detect from 'detect-port';
import isRoot from 'is-root';
import logger from '@docusaurus/logger';
import prompts from 'prompts';

const isInteractive = process.stdout.isTTY;

const execOptions: Record<string, unknown> = {
  encoding: 'utf8',
  stdio: [
    'pipe', // stdin (default)
    'pipe', // stdout (default)
    'ignore', // stderr
  ],
};

// Clears console
function clearConsole(): void {
  process.stdout.write(
    process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H',
  );
}

// Gets process id of what is on port
function getProcessIdOnPort(port: number): string {
  return execSync(`lsof -i:${port} -P -t -sTCP:LISTEN`, execOptions)
    .toString()
    .split('\n')[0]!
    .trim();
}

// Gets process command
function getProcessCommand(processId: string): string {
  const command: Buffer = execSync(
    `ps -o command -p ${processId} | sed -n 2p`,
    execOptions,
  );

  return command.toString().replace(/\n$/, '');
}

// Gets directory of a process from its process id
function getDirectoryOfProcessById(processId: string): string {
  return execSync(
    `lsof -p ${processId} | awk '$4=="cwd" {for (i=9; i<=NF; i++) printf "%s ", $i}'`,
    execOptions,
  )
    .toString()
    .trim();
}

// Gets process on port
function getProcessForPort(port: number): string | null {
  try {
    const processId = getProcessIdOnPort(port);
    const directory = getDirectoryOfProcessById(processId);
    const command = getProcessCommand(processId);
    return logger.interpolate`code=${command} subdue=${`(pid ${processId})`} in path=${directory}`;
  } catch {
    return null;
  }
}

/**
 * Detects if program is running on port and prompts user
 * to choose another if port is already being used
 */
export default async function choosePort(
  host: string,
  defaultPort: number,
): Promise<number | null> {
  try {
    const port = await detect({port: defaultPort, hostname: host});
    if (port === defaultPort) {
      return port;
    }
    const message =
      process.platform !== 'win32' && defaultPort < 1024 && !isRoot()
        ? `Admin permissions are required to run a server on a port below 1024.`
        : `Something is already running on port ${defaultPort}.`;
    if (!isInteractive) {
      logger.error(message);
      return null;
    }
    clearConsole();
    const existingProcess = getProcessForPort(defaultPort);
    const {shouldChangePort} = await prompts({
      type: 'confirm',
      name: 'shouldChangePort',
      message: logger.yellow(`${logger.bold('[WARNING]')} ${message}${
        existingProcess ? ` Probably:\n  ${existingProcess}` : ''
      }

Would you like to run the app on another port instead?`),
      initial: true,
    });
    return shouldChangePort ? port : null;
  } catch (err) {
    logger.error`Could not find an open port at ${host}.`;
    throw err;
  }
}

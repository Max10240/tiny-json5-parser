import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function getDirName(metaUrl: string) {
  return dirname(fileURLToPath(metaUrl));
}

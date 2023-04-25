import { dirname } from 'path';
import { fileURLToPath } from 'url';

export function getDirName(metaUrl: string) {
  return dirname(fileURLToPath(metaUrl));
}

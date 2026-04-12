import type { BuiltDataMessageFiles } from '../types.js';

import DataMessageFile from './DataMessageFile.js';

class DataMessageFiles {
  private readonly files: BuiltDataMessageFiles['dmFile'] = [];

  addFile(file: DataMessageFile): void {
    if (!(file instanceof DataMessageFile)) {
      throw new Error('Invalid file type');
    }

    this.files.push(file.build());
  }

  build(): BuiltDataMessageFiles {
    return {
      dmFile: [...this.files],
    };
  }
}

export default DataMessageFiles;

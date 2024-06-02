import DataMessageFile from './DataMessageFile.js';

class DataMessageFiles {
  constructor() {
    this.files = [];
  }

  addFile(file) {
    if (file instanceof DataMessageFile) {
      this.files.push(file.build());
    } else {
      throw new Error('Invalid file type');
    }
  }

  build() {
    return {
      dmFile: this.files,
    };
  }
}

export default DataMessageFiles;

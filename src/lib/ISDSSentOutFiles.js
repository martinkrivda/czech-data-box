import fs from 'fs';
import DataMessageFile from '../models/DataMessageFile.js';
import DataMessageFiles from '../models/DataMessageFiles.js';

class ISDSSentOutFiles {
  constructor() {
    this.dataMessageFiles = new DataMessageFiles();
  }

  addFile(
    encodedContent,
    mimeType,
    fileMetaType,
    fileDescr,
    fileGuid = null,
    upFileGuid = null,
    format = null,
  ) {
    const file = new DataMessageFile();
    file.setDmEncodedContent(encodedContent);
    file.setDmMimeType(mimeType);
    file.setDmFileMetaType(fileMetaType);
    file.setDmFileDescr(fileDescr);
    file.setDmFileGuid(fileGuid);
    file.setDmUpFileGuid(upFileGuid);
    file.setDmFormat(format);

    this.dataMessageFiles.addFile(file);
  }

  async addFileFromMemory(
    encodedContent,
    mimeType,
    fileMetaType,
    fileDescr,
    fileGuid = null,
    upFileGuid = null,
    format = null,
  ) {
    this.addFile(
      encodedContent,
      mimeType,
      fileMetaType,
      fileDescr,
      fileGuid,
      upFileGuid,
      format,
    );
  }

  async addFileFromFilePath(
    filePath,
    mimeType,
    fileMetaType,
    fileDescr,
    fileGuid = null,
    upFileGuid = null,
    format = null,
  ) {
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return false;
    }
    const fileContent = await fs.promises.readFile(filePath, {
      encoding: 'base64',
    });
    this.addFile(
      fileContent,
      mimeType,
      fileMetaType,
      fileDescr,
      fileGuid,
      upFileGuid,
      format,
    );
    return true;
  }

  build() {
    return this.dataMessageFiles.build();
  }
}

export default ISDSSentOutFiles;

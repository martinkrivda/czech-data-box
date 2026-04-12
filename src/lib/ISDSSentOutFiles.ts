import * as fs from 'node:fs';

import type { BuiltDataMessageFiles, OutgoingFileCommon } from '../types.js';

import DataMessageFile from '../models/DataMessageFile.js';
import DataMessageFiles from '../models/DataMessageFiles.js';

class ISDSSentOutFiles {
  readonly dataMessageFiles = new DataMessageFiles();

  addFile(
    encodedContent: string,
    mimeType: string,
    fileMetaType: string,
    fileDescr: string,
    fileGuid: string | null = null,
    upFileGuid: string | null = null,
    format: string | null = null,
  ): void {
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

  addFileFromMemory(
    encodedContent: string,
    mimeType: string,
    fileMetaType: string,
    fileDescr: string,
    fileGuid: string | null = null,
    upFileGuid: string | null = null,
    format: string | null = null,
  ): void {
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
    filePath: string,
    mimeType: string,
    fileMetaType: string,
    fileDescr: string,
    fileGuid: string | null = null,
    upFileGuid: string | null = null,
    format: string | null = null,
  ): Promise<boolean> {
    try {
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
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        console.error('File not found:', filePath);
        return false;
      }

      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  addOutgoingFile(file: OutgoingFileCommon & { dmEncodedContent: string }): void {
    this.addFile(
      file.dmEncodedContent,
      file.dmMimeType,
      file.dmFileMetaType,
      file.dmFileDescr,
      file.dmFileGuid ?? null,
      file.dmUpFileGuid ?? null,
      file.dmFormat ?? null,
    );
  }

  build(): BuiltDataMessageFiles {
    return this.dataMessageFiles.build();
  }
}

export default ISDSSentOutFiles;

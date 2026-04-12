import type { BuiltDataMessageFile, DataMessageFileAttributes } from '../types.js';

class DataMessageFile {
  private dmEncodedContent: string | null = null;
  private dmXMLContent: string | null = null;
  private dmMimeType: string | null = null;
  private dmFileMetaType: string | null = null;
  private dmFileDescr: string | null = null;
  private dmFileGuid: string | null = null;
  private dmUpFileGuid: string | null = null;
  private dmFormat: string | null = null;

  setDmEncodedContent(value: string | null): void {
    this.dmEncodedContent = value;
  }

  setDmXMLContent(value: string | null): void {
    this.dmXMLContent = value;
  }

  setDmMimeType(value: string | null): void {
    this.dmMimeType = value;
  }

  setDmFileMetaType(value: string | null): void {
    this.dmFileMetaType = value;
  }

  setDmFileDescr(value: string | null): void {
    this.dmFileDescr = value;
  }

  setDmFileGuid(value: string | null): void {
    this.dmFileGuid = value;
  }

  setDmUpFileGuid(value: string | null): void {
    this.dmUpFileGuid = value;
  }

  setDmFormat(value: string | null): void {
    this.dmFormat = value;
  }

  build(): BuiltDataMessageFile {
    const attributes: DataMessageFileAttributes = {
      dmMimeType: this.dmMimeType ?? '',
      dmFileMetaType: this.dmFileMetaType ?? '',
      dmFileDescr: this.dmFileDescr ?? '',
      dmFileGuid: this.dmFileGuid ?? '',
      dmUpFileGuid: this.dmUpFileGuid ?? '',
      dmFormat: this.dmFormat ?? '',
    };

    const fileObject: BuiltDataMessageFile = { attributes };

    if (this.dmEncodedContent) {
      fileObject.dmEncodedContent = this.dmEncodedContent;
    } else if (this.dmXMLContent) {
      fileObject.dmXMLContent = this.dmXMLContent;
    }

    return fileObject;
  }
}

export default DataMessageFile;

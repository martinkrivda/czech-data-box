class DataMessageFile {
  constructor() {
    this.dmEncodedContent = null;
    this.dmXMLContent = null;
    this.dmMimeType = null;
    this.dmFileMetaType = null;
    this.dmFileDescr = null;
    this.dmFileGuid = null;
    this.dmUpFileGuid = null;
    this.dmFormat = null;
  }

  setDmEncodedContent(value) {
    this.dmEncodedContent = value;
  }

  setDmXMLContent(value) {
    this.dmXMLContent = value;
  }

  setDmMimeType(value) {
    this.dmMimeType = value;
  }

  setDmFileMetaType(value) {
    this.dmFileMetaType = value;
  }

  setDmFileDescr(value) {
    this.dmFileDescr = value;
  }

  setDmFileGuid(value) {
    this.dmFileGuid = value;
  }

  setDmUpFileGuid(value) {
    this.dmUpFileGuid = value;
  }

  setDmFormat(value) {
    this.dmFormat = value;
  }

  build() {
    const attributes = {
      dmMimeType: this.dmMimeType || '',
      dmFileMetaType: this.dmFileMetaType || '',
      dmFileDescr: this.dmFileDescr || '',
      dmFileGuid: this.dmFileGuid || '',
      dmUpFileGuid: this.dmUpFileGuid || '',
      dmFormat: this.dmFormat || '',
    };

    const fileObject = {
      attributes: attributes,
    };

    if (this.dmEncodedContent) {
      fileObject.dmEncodedContent = this.dmEncodedContent;
    } else if (this.dmXMLContent) {
      fileObject.dmXMLContent = this.dmXMLContent;
    }

    return fileObject;
  }
}

export default DataMessageFile;

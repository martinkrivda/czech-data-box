import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import ISDSSentOutFiles from '../src/lib/ISDSSentOutFiles.js';
import DataMessageFile from '../src/models/DataMessageFile.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('ISDSSentOutFiles', function () {
  let sentOutFiles;
  let readFileStub;
  let existsSyncStub;

  beforeEach(function () {
    sentOutFiles = new ISDSSentOutFiles();
    readFileStub = sinon.stub(fs.promises, 'readFile');
    existsSyncStub = sinon.stub(fs, 'existsSync');
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should add file from memory', function () {
    const fileContent = Buffer.from('file content').toString('base64');
    sentOutFiles.addFileFromMemory(
      fileContent,
      'application/pdf',
      'main',
      'description',
    );

    const builtFiles = sentOutFiles.build();
    expect(builtFiles.dmFile).to.have.lengthOf(1);
    expect(builtFiles.dmFile[0]).to.deep.include({
      attributes: {
        dmMimeType: 'application/pdf',
        dmFileMetaType: 'main',
        dmFileDescr: 'description',
        dmFileGuid: '',
        dmUpFileGuid: '',
        dmFormat: '',
      },
      dmEncodedContent: fileContent,
    });
  });

  it('should add file from file system', async function () {
    const testFilePath = path.join(__dirname, 'testfile.txt');
    const fileContent = Buffer.from('file content').toString('base64');

    existsSyncStub.withArgs(testFilePath).returns(true);
    readFileStub
      .withArgs(testFilePath, { encoding: 'base64' })
      .resolves(fileContent);

    const result = await sentOutFiles.addFileFromFilePath(
      testFilePath,
      'application/pdf',
      'main',
      'description',
    );

    expect(result).to.be.true;
    const builtFiles = sentOutFiles.build();
    expect(builtFiles.dmFile).to.have.lengthOf(1);
    expect(builtFiles.dmFile[0]).to.deep.include({
      attributes: {
        dmMimeType: 'application/pdf',
        dmFileMetaType: 'main',
        dmFileDescr: 'description',
        dmFileGuid: '',
        dmUpFileGuid: '',
        dmFormat: '',
      },
      dmEncodedContent: fileContent,
    });
  });

  it('should handle file not found error', async function () {
    const testFilePath = path.join(__dirname, 'nonexistentfile.txt');

    existsSyncStub.withArgs(testFilePath).returns(false);

    const result = await sentOutFiles.addFileFromFilePath(
      testFilePath,
      'application/pdf',
      'main',
      'description',
    );

    expect(result).to.be.false;
    const builtFiles = sentOutFiles.build();
    expect(builtFiles.dmFile).to.be.empty;
  });

  it('should build files correctly', function () {
    const file = new DataMessageFile();
    file.setDmEncodedContent('encodedContent');
    file.setDmMimeType('application/pdf');
    file.setDmFileMetaType('main');
    file.setDmFileDescr('description');

    sentOutFiles.dataMessageFiles.addFile(file);

    const builtFiles = sentOutFiles.build();
    expect(builtFiles.dmFile).to.have.lengthOf(1);
    expect(builtFiles.dmFile[0]).to.deep.include({
      attributes: {
        dmMimeType: 'application/pdf',
        dmFileMetaType: 'main',
        dmFileDescr: 'description',
        dmFileGuid: '',
        dmUpFileGuid: '',
        dmFormat: '',
      },
      dmEncodedContent: 'encodedContent',
    });
  });
});

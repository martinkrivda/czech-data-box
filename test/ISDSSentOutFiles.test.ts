import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it, vi } from 'vitest';

import ISDSSentOutFiles from '../src/lib/ISDSSentOutFiles.js';
import DataMessageFile from '../src/models/DataMessageFile.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

describe('ISDSSentOutFiles', () => {
  it('adds a file from memory', () => {
    const sentOutFiles = new ISDSSentOutFiles();
    const fileContent = Buffer.from('file content').toString('base64');

    sentOutFiles.addFileFromMemory(fileContent, 'application/pdf', 'main', 'description');

    expect(sentOutFiles.build().dmFile).toEqual([
      {
        attributes: {
          dmMimeType: 'application/pdf',
          dmFileMetaType: 'main',
          dmFileDescr: 'description',
          dmFileGuid: '',
          dmUpFileGuid: '',
          dmFormat: '',
        },
        dmEncodedContent: fileContent,
      },
    ]);
  });

  it('adds a file from the filesystem', async () => {
    const sentOutFiles = new ISDSSentOutFiles();
    const testFilePath = path.join(currentDirectory, 'testfile.txt');
    const fileContent = Buffer.from('file content').toString('base64');

    await fs.promises.writeFile(testFilePath, 'file content');

    try {
      const result = await sentOutFiles.addFileFromFilePath(
        testFilePath,
        'application/pdf',
        'main',
        'description',
      );

      expect(result).toBe(true);
      expect(sentOutFiles.build().dmFile).toEqual([
        {
          attributes: {
            dmMimeType: 'application/pdf',
            dmFileMetaType: 'main',
            dmFileDescr: 'description',
            dmFileGuid: '',
            dmUpFileGuid: '',
            dmFormat: '',
          },
          dmEncodedContent: fileContent,
        },
      ]);
    } finally {
      await fs.promises.rm(testFilePath, { force: true });
    }
  });

  it('returns false when the file does not exist', async () => {
    const sentOutFiles = new ISDSSentOutFiles();
    const testFilePath = path.join(currentDirectory, 'nonexistentfile.txt');
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const result = await sentOutFiles.addFileFromFilePath(
      testFilePath,
      'application/pdf',
      'main',
      'description',
    );

    expect(result).toBe(false);
    expect(sentOutFiles.build().dmFile).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith('File not found:', testFilePath);
  });

  it('builds files correctly', () => {
    const sentOutFiles = new ISDSSentOutFiles();
    const file = new DataMessageFile();

    file.setDmEncodedContent('encodedContent');
    file.setDmMimeType('application/pdf');
    file.setDmFileMetaType('main');
    file.setDmFileDescr('description');

    sentOutFiles.dataMessageFiles.addFile(file);

    expect(sentOutFiles.build().dmFile).toEqual([
      {
        attributes: {
          dmMimeType: 'application/pdf',
          dmFileMetaType: 'main',
          dmFileDescr: 'description',
          dmFileGuid: '',
          dmUpFileGuid: '',
          dmFormat: '',
        },
        dmEncodedContent: 'encodedContent',
      },
    ]);
  });
});

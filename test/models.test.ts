import { describe, expect, it } from 'vitest';

import DataBox from '../src/models/DataBox.js';
import DataMessage from '../src/models/DataMessage.js';
import DataMessageFile from '../src/models/DataMessageFile.js';
import DataMessageFiles from '../src/models/DataMessageFiles.js';

describe('model builders', () => {
  it.each([
    ['setDbId', 'dbID', 'abc123'],
    ['setDbType', 'dbType', 'PO'],
    ['setIc', 'ic', '12345678'],
    ['setPnFirstName', 'pnFirstName', 'Jan'],
    ['setPnMiddleName', 'pnMiddleName', 'Josef'],
    ['setPnLastName', 'pnLastName', 'Novak'],
    ['setPnLastNameAtBirth', 'pnLastNameAtBirth', 'Novotny'],
    ['setFirmName', 'firmName', 'ACME'],
    ['setBiDate', 'biDate', '2000-01-01'],
    ['setBiCity', 'biCity', 'Praha'],
    ['setBiCounty', 'biCounty', 'Praha'],
    ['setBiState', 'biState', 'CZ'],
    ['setAdCity', 'adCity', 'Praha'],
    ['setAdStreet', 'adStreet', 'Main'],
    ['setAdNumberInStreet', 'adNumberInStreet', '1'],
    ['setAdNumberInMunicipality', 'adNumberInMunicipality', '2'],
    ['setAdZipCode', 'adZipCode', '11000'],
    ['setAdState', 'adState', 'CZ'],
    ['setNationality', 'nationality', 'CZ'],
    ['setEmail', 'email', 'john@example.com'],
    ['setTelNumber', 'telNumber', '+420123456789'],
    ['setIdentifier', 'identifier', 'id-1'],
    ['setRegistryCode', 'registryCode', 'reg-1'],
    ['setDbState', 'dbState', 'ACTIVE'],
    ['setDbEffectiveOVM', 'dbEffectiveOVM', 'true'],
    ['setDbOpenAddressing', 'dbOpenAddressing', 'false'],
  ] as const)('applies DataBox.%s', (methodName, expectedKey, value) => {
    const dataBox = new DataBox();
    const result = dataBox[methodName](value);

    expect(result).toBe(dataBox);
    expect(dataBox.build()).toEqual({
      dbOwnerInfo: {
        [expectedKey]: value,
      },
    });
  });

  it('builds DataBox payloads through fluent setters', () => {
    const payload = new DataBox()
      .setDbId('abc123')
      .setDbType('PO')
      .setFirmName('Test Company')
      .setAdCity('Praha')
      .build();

    expect(payload).toEqual({
      dbOwnerInfo: {
        dbID: 'abc123',
        dbType: 'PO',
        firmName: 'Test Company',
        adCity: 'Praha',
      },
    });
  });

  it('builds DataMessage payloads with defaults and overrides', () => {
    const payload = new DataMessage()
      .setDbIDRecipient('abc123')
      .setDmAnnotation('Test message')
      .setDmToHands('Podatelna')
      .setDmPersonalDelivery(true)
      .build();

    expect(payload).toEqual({
      dmSenderOrgUnit: null,
      dmSenderOrgUnitNum: null,
      dbIDRecipient: 'abc123',
      dmRecipientOrgUnit: null,
      dmRecipientOrgUnitNum: null,
      dmToHands: 'Podatelna',
      dmAnnotation: 'Test message',
      dmRecipientRefNumber: null,
      dmSenderRefNumber: null,
      dmRecipientIdent: null,
      dmSenderIdent: null,
      dmLegalTitleLaw: null,
      dmLegalTitleYear: null,
      dmLegalTitleSect: null,
      dmLegalTitlePar: null,
      dmLegalTitlePoint: null,
      dmPersonalDelivery: true,
      dmAllowSubstDelivery: false,
      dmOVM: false,
      dmPublishOwnID: false,
    });
  });

  it.each([
    ['setDmSenderOrgUnit', 'dmSenderOrgUnit', 'dept'],
    ['setDmSenderOrgUnitNum', 'dmSenderOrgUnitNum', '10'],
    ['setDbIDRecipient', 'dbIDRecipient', 'abc123'],
    ['setDmRecipientOrgUnit', 'dmRecipientOrgUnit', 'registry'],
    ['setDmRecipientOrgUnitNum', 'dmRecipientOrgUnitNum', '20'],
    ['setDmToHands', 'dmToHands', 'Podatelna'],
    ['setDmAnnotation', 'dmAnnotation', 'Hello'],
    ['setDmRecipientRefNumber', 'dmRecipientRefNumber', 'R-1'],
    ['setDmSenderRefNumber', 'dmSenderRefNumber', 'S-1'],
    ['setDmRecipientIdent', 'dmRecipientIdent', 'RID'],
    ['setDmSenderIdent', 'dmSenderIdent', 'SID'],
    ['setDmLegalTitleLaw', 'dmLegalTitleLaw', '300'],
    ['setDmLegalTitleYear', 'dmLegalTitleYear', '2025'],
    ['setDmLegalTitleSect', 'dmLegalTitleSect', '10'],
    ['setDmLegalTitlePar', 'dmLegalTitlePar', '2'],
    ['setDmLegalTitlePoint', 'dmLegalTitlePoint', 'a'],
    ['setDmPersonalDelivery', 'dmPersonalDelivery', true],
    ['setDmAllowSubstDelivery', 'dmAllowSubstDelivery', true],
    ['setDmOVM', 'dmOVM', true],
    ['setDmPublishOwnID', 'dmPublishOwnID', true],
  ] as const)('applies DataMessage.%s', (methodName, expectedKey, value) => {
    const message = new DataMessage();
    const method = message[methodName] as (value: string | boolean) => DataMessage;
    const result = method.call(message, value);

    expect(result).toBe(message);
    expect(message.build()[expectedKey]).toBe(value);
  });

  it('builds DataMessageFile payloads for XML or encoded content', () => {
    const xmlFile = new DataMessageFile();
    xmlFile.setDmXMLContent('<xml />');
    xmlFile.setDmMimeType('text/xml');

    const encodedFile = new DataMessageFile();
    encodedFile.setDmEncodedContent('base64-content');
    encodedFile.setDmMimeType('application/pdf');
    encodedFile.setDmFileMetaType('main');
    encodedFile.setDmFileDescr('document.pdf');

    expect(xmlFile.build()).toEqual({
      attributes: {
        dmMimeType: 'text/xml',
        dmFileMetaType: '',
        dmFileDescr: '',
        dmFileGuid: '',
        dmUpFileGuid: '',
        dmFormat: '',
      },
      dmXMLContent: '<xml />',
    });

    expect(encodedFile.build()).toEqual({
      attributes: {
        dmMimeType: 'application/pdf',
        dmFileMetaType: 'main',
        dmFileDescr: 'document.pdf',
        dmFileGuid: '',
        dmUpFileGuid: '',
        dmFormat: '',
      },
      dmEncodedContent: 'base64-content',
    });
  });

  it('applies all DataMessageFile setters', () => {
    const file = new DataMessageFile();

    file.setDmEncodedContent('base64');
    file.setDmMimeType('application/pdf');
    file.setDmFileMetaType('main');
    file.setDmFileDescr('document.pdf');
    file.setDmFileGuid('guid-1');
    file.setDmUpFileGuid('parent-guid');
    file.setDmFormat('pdf');

    expect(file.build()).toEqual({
      attributes: {
        dmMimeType: 'application/pdf',
        dmFileMetaType: 'main',
        dmFileDescr: 'document.pdf',
        dmFileGuid: 'guid-1',
        dmUpFileGuid: 'parent-guid',
        dmFormat: 'pdf',
      },
      dmEncodedContent: 'base64',
    });
  });

  it('builds DataMessageFiles collections and rejects invalid inputs', () => {
    const collection = new DataMessageFiles();
    const file = new DataMessageFile();
    file.setDmEncodedContent('base64-content');

    collection.addFile(file);

    expect(collection.build()).toEqual({
      dmFile: [
        {
          attributes: {
            dmMimeType: '',
            dmFileMetaType: '',
            dmFileDescr: '',
            dmFileGuid: '',
            dmUpFileGuid: '',
            dmFormat: '',
          },
          dmEncodedContent: 'base64-content',
        },
      ],
    });

    expect(() => collection.addFile({} as unknown as DataMessageFile)).toThrow(
      'Invalid file type',
    );
  });
});

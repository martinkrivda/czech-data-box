import { afterEach, describe, expect, it, vi } from 'vitest';

import ISDSBox from '../src/lib/ISDSBox.js';
import ISDSSoapClient from '../src/lib/ISDSSoapClient.js';
import DataBox from '../src/models/DataBox.js';
import type {
  ArchiveIsdsDocumentResult,
  CreateMessageResult,
  CreateMultipleMessageResult,
  FindDataBoxResult,
  MessageListResult,
  OwnerInfoResult,
  SentMessageEnvelopeResult,
  SuspiciousMessageReportResult,
} from '../src/types.js';

describe('ISDSBox', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('reconfigures connection and runtime modes through fluent helpers', () => {
    const initClientsSpy = vi
      .spyOn(ISDSBox.prototype, 'initClients')
      .mockImplementation(() => undefined);

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');

    expect(isdsBox.setConnectionMode('certds')).toBe(isdsBox);
    expect(isdsBox.setProductionMode()).toBe(isdsBox);
    expect(isdsBox.setTestMode()).toBe(isdsBox);
    expect(isdsBox.setDebugMode()).toBe(isdsBox);
    expect(isdsBox.setPublicKey('public')).toBe(isdsBox);
    expect(isdsBox.setPrivateKey('private')).toBe(isdsBox);
    expect(isdsBox.setPassPhrase('secret')).toBe(isdsBox);

    expect(initClientsSpy).toHaveBeenCalled();
  });

  it.each([
    [
      'loginWithUsernameAndPassword',
      (client: ISDSBox) => client.loginWithUsernameAndPassword('user', 'pass', false),
    ],
    [
      'loginWithPkcs12Certificate',
      (client: ISDSBox) =>
        client.loginWithPkcs12Certificate('base64-p12', 'secret', false),
    ],
    [
      'loginWithUsernamePasswordAndCertificate',
      (client: ISDSBox) =>
        client.loginWithUsernamePasswordAndCertificate(
          'user',
          'pass',
          'base64-p12',
          'secret',
          false,
        ),
    ],
    [
      'loginWithHostedSpisServiceCertificate',
      (client: ISDSBox) =>
        client.loginWithHostedSpisServiceCertificate(
          'abc123',
          'base64-p12',
          'secret',
          false,
        ),
    ],
  ] as const)('supports %s', (_name, invoke) => {
    const initClientsSpy = vi
      .spyOn(ISDSBox.prototype, 'initClients')
      .mockImplementation(() => undefined);
    const setPkcs12CertificateSpy = vi
      .spyOn(ISDSBox.prototype, 'setPkcs12Certificate')
      .mockImplementation(function mockSetPkcs12Certificate(this: ISDSBox): ISDSBox {
        return this;
      });

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');
    const result = invoke(isdsBox);

    expect(result).toBe(isdsBox);
    expect(initClientsSpy).toHaveBeenCalled();

    if (_name === 'loginWithUsernameAndPassword') {
      expect(setPkcs12CertificateSpy).not.toHaveBeenCalled();
    } else {
      expect(setPkcs12CertificateSpy).toHaveBeenCalled();
    }
  });

  it('creates a message', async () => {
    const requestSpy = vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      dmID: 'messageID',
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    } satisfies CreateMessageResult);

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');

    const dataMessageFiles = [
      {
        dmFilePath: './test/communication_test.pdf',
        dmMimeType: 'application/pdf',
        dmFileMetaType: 'main',
        dmFileDescr: 'file1.pdf',
      },
    ] as const;

    const params = {
      dmSenderOrgUnit: null,
      dmSenderOrgUnitNum: null,
      dbIDRecipient: 'fdjklz2',
      dmRecipientOrgUnit: null,
      dmRecipientOrgUnitNum: null,
      dmToHands: 'MK',
      dmAnnotation: 'MK Communication test (ignore)',
      dmRecipientRefNumber: null,
      dmSenderRefNumber: null,
      dmRecipientIdent: '',
      dmSenderIdent: '',
      dmLegalTitleLaw: '',
      dmLegalTitleYear: '',
      dmLegalTitleSect: 'f',
      dmLegalTitlePar: '',
      dmLegalTitlePoint: '',
      dmPersonalDelivery: true,
      dmAllowSubstDelivery: true,
      dmOVM: false,
      dmPublishOwnID: false,
    } as const;

    const result = await isdsBox.createMessage(params, dataMessageFiles);

    expect(result.dmID).toBe('messageID');
    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(requestSpy.mock.calls[0]?.[0]).toBe('CreateMessage');
    expect(requestSpy.mock.calls[0]?.[1]).toMatchObject({
      dmEnvelope: {
        dbIDRecipient: 'fdjklz2',
        dmAnnotation: 'MK Communication test (ignore)',
      },
    });
  });

  it('finds a data box based on the provided input', async () => {
    vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      dbStatus: { dbStatusCode: '0000', dbStatusMessage: 'OK' },
      dbResults: [{ dbID: 'e26gfgu', dbType: 'FO' }],
    } satisfies FindDataBoxResult);

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');
    const dataBox = new DataBox().setDbId('e26gfgu').setDbType('FO');

    const result = await isdsBox.findDataBox(dataBox);

    expect(result).toEqual({
      dbStatus: { dbStatusCode: '0000', dbStatusMessage: 'OK' },
      dbResults: [{ dbID: 'e26gfgu', dbType: 'FO' }],
    });
  });

  it('creates a multiple message for more recipients', async () => {
    const requestSpy = vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      dmMultipleStatus: {
        dmSingleStatus: [
          {
            dmID: 'message-1',
            dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
          },
        ],
      },
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    } satisfies CreateMultipleMessageResult);

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');

    const result = await isdsBox.createMultipleMessage(
      {
        dmAnnotation: 'Obeznik',
        dmPersonalDelivery: true,
      },
      [
        {
          dbIDRecipient: 'abc123',
          dmToHands: 'Podatelna',
        },
      ],
      [
        {
          dmFilePath: './test/communication_test.pdf',
          dmMimeType: 'application/pdf',
          dmFileMetaType: 'main',
          dmFileDescr: 'circular.pdf',
        },
      ],
    );

    expect(result.dmStatus?.dmStatusCode).toBe('0000');
    expect(requestSpy.mock.calls[0]?.[0]).toBe('CreateMultipleMessage');
    expect(requestSpy.mock.calls[0]?.[1]).toMatchObject({
      dmRecipients: {
        dmRecipient: [
          {
            dbIDRecipient: 'abc123',
            dmToHands: 'Podatelna',
          },
        ],
      },
      dmEnvelope: {
        dmAnnotation: 'Obeznik',
      },
    });
  });

  it('rethrows SOAP failures when finding a data box', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    vi.spyOn(ISDSSoapClient.prototype, 'request').mockRejectedValue(
      new Error('SOAP request failed'),
    );

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');
    const dataBox = new DataBox().setDbId('e26gfgu').setDbType('FO');

    await expect(isdsBox.findDataBox(dataBox)).rejects.toThrow('SOAP request failed');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error in findDataBox:',
      'SOAP request failed',
    );
  });

  it('gets owner info from login', async () => {
    vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      dbStatus: { dbStatusCode: '0000', dbStatusMessage: 'OK' },
      ownerInfo: { ownerId: 'owner123', ownerName: 'Owner Name' },
    } satisfies OwnerInfoResult);

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');
    const result = await isdsBox.getOwnerInfoFromLogin();

    expect(result).toEqual({
      dbStatus: { dbStatusCode: '0000', dbStatusMessage: 'OK' },
      ownerInfo: { ownerId: 'owner123', ownerName: 'Owner Name' },
    });
  });

  it('gets a data box address', async () => {
    vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      adCity: 'Praha',
      adFullAddress1: 'Praha 1',
      adZipCode: '11000',
    });

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');
    const result = await isdsBox.getDataBoxAddress('abc123');

    expect(result).toEqual({
      adCity: 'Praha',
      adFullAddress1: 'Praha 1',
      adZipCode: '11000',
    });
  });

  it('gets a sent message envelope', async () => {
    vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      dmReturnedMessageEnvelope: { dmID: '123' },
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    } satisfies SentMessageEnvelopeResult);

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');
    const result = await isdsBox.getSentMessageEnvelope('123');

    expect(result).toEqual({
      dmReturnedMessageEnvelope: { dmID: '123' },
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    });
  });

  it.each([
    {
      name: 'gets password info',
      invoke: (client: ISDSBox) => client.getPasswordInfo(),
      expectedMethod: 'GetPasswordInfo',
      expectedArgs: { dbDummy: '' },
      response: { dbStatus: { dbStatusCode: '0000', dbStatusMessage: 'OK' } },
    },
    {
      name: 'verifies a message',
      invoke: (client: ISDSBox) => client.verifyMessage('123'),
      expectedMethod: 'VerifyMessage',
      expectedArgs: { dmID: '123' },
      response: { dmHash: { value: 'hash' } },
    },
    {
      name: 'gets delivery info',
      invoke: (client: ISDSBox) => client.getDeliveryInfo('123'),
      expectedMethod: 'GetDeliveryInfo',
      expectedArgs: { dmID: '123' },
      response: { dmDelivery: { dmMessageStatus: 3 } },
    },
    {
      name: 'gets signed delivery info',
      invoke: (client: ISDSBox) => client.getSignedDeliveryInfo('123'),
      expectedMethod: 'GetSignedDeliveryInfo',
      expectedArgs: { dmID: '123' },
      response: { dmSignature: 'signed-delivery' },
    },
    {
      name: 'downloads a message',
      invoke: (client: ISDSBox) => client.downloadMessage('123'),
      expectedMethod: 'MessageDownload',
      expectedArgs: { dmID: '123' },
      response: { dmReturnedMessage: { dmDm: { dmID: '123' } } },
    },
    {
      name: 'downloads a message envelope',
      invoke: (client: ISDSBox) => client.downloadMessageEnvelope('123'),
      expectedMethod: 'MessageEnvelopeDownload',
      expectedArgs: { dmID: '123' },
      response: { dmReturnedMessageEnvelope: { dmID: '123' } },
    },
    {
      name: 'downloads a signed message',
      invoke: (client: ISDSBox) => client.downloadSignedMessage('123'),
      expectedMethod: 'SignedMessageDownload',
      expectedArgs: { dmID: '123' },
      response: { dmSignature: 'signed-message' },
    },
    {
      name: 'marks a message as downloaded',
      invoke: (client: ISDSBox) => client.markMessageAsDownloaded('123'),
      expectedMethod: 'MarkMessageAsDownloaded',
      expectedArgs: { dmID: '123' },
      response: { dmStatus: { dmStatusCode: '0000' } },
    },
    {
      name: 'downloads a signed sent message',
      invoke: (client: ISDSBox) => client.downloadSignedSentMessage('123'),
      expectedMethod: 'SignedSentMessageDownload',
      expectedArgs: { dmID: '123' },
      response: { dmSignature: 'signed-sent-message' },
    },
    {
      name: 'gets message author',
      invoke: (client: ISDSBox) => client.getMessageAuthor('123'),
      expectedMethod: 'GetMessageAuthor',
      expectedArgs: { dmID: '123' },
      response: { authorName: 'ISDS Author' },
    },
    {
      name: 'gets message author details',
      invoke: (client: ISDSBox) => client.getMessageAuthorDetails('123'),
      expectedMethod: 'GetMessageAuthor2',
      expectedArgs: { dmID: '123' },
      response: { dmMessageAuthor: { maItem: [{ key: 'name', value: 'ISDS Author' }] } },
    },
    {
      name: 'erases a message',
      invoke: (client: ISDSBox) => client.eraseMessage({ dmID: '123', dmIncoming: true }),
      expectedMethod: 'EraseMessage',
      expectedArgs: { dmID: '123', dmIncoming: true },
      response: { dmStatus: { dmStatusCode: '0000' } },
    },
    {
      name: 'picks up async response',
      invoke: (client: ISDSBox) =>
        client.pickUpAsyncResponse({
          asyncID: 'async-1',
          asyncReqType: 'ERASED_MESSAGES',
        }),
      expectedMethod: 'PickUpAsyncResponse',
      expectedArgs: {
        asyncID: 'async-1',
        asyncReqType: 'ERASED_MESSAGES',
      },
      response: { asyncReqType: 'ERASED_MESSAGES', asyncResponse: 'payload' },
    },
    {
      name: 'registers for notifications',
      invoke: (client: ISDSBox) => client.registerForNotifications(1),
      expectedMethod: 'RegisterForNotifications',
      expectedArgs: { action: 1 },
      response: { dmStatus: { dmStatusCode: '0000' } },
    },
    {
      name: 'authenticates a message',
      invoke: (client: ISDSBox) => client.authenticateMessage('signed-base64'),
      expectedMethod: 'AuthenticateMessage',
      expectedArgs: { dmMessage: 'signed-base64' },
      response: { dmAuthResult: true },
    },
    {
      name: 're-signs an ISDS document',
      invoke: (client: ISDSBox) => client.reSignIsdsDocument('document-base64'),
      expectedMethod: 'Re-signISDSDocument',
      expectedArgs: { dmDoc: 'document-base64' },
      response: { dmResultDoc: 'restamped-base64' },
    },
    {
      name: 'calls dummy operation',
      invoke: (client: ISDSBox) => client.dummyOperation('ping'),
      expectedMethod: 'DummyOperation',
      expectedArgs: { DummyOperation: 'ping' },
      response: { dmStatus: { dmStatusCode: '0000' } },
    },
    {
      name: 'downloads an attachment',
      invoke: (client: ISDSBox) => client.downloadAttachment({ dmID: '123', attNum: 2 }),
      expectedMethod: 'DownloadAttachment',
      expectedArgs: { dmID: '123', attNum: 2 },
      response: { dmFile: { dmFileDescr: 'attachment.pdf' } },
    },
    {
      name: 'authenticates a big message',
      invoke: (client: ISDSBox) => client.authenticateBigMessage('big-base64'),
      expectedMethod: 'AuthenticateBigMessage',
      expectedArgs: { dmMessage: 'big-base64' },
      response: { dmAuthResult: true },
    },
    {
      name: 'downloads a signed big message',
      invoke: (client: ISDSBox) => client.downloadSignedBigMessage('123'),
      expectedMethod: 'SignedBigMessageDownload',
      expectedArgs: { dmID: '123' },
      response: { dmSignature: 'signed-big-message' },
    },
    {
      name: 'downloads a signed sent big message',
      invoke: (client: ISDSBox) => client.downloadSignedSentBigMessage('123'),
      expectedMethod: 'SignedSentBigMessageDownload',
      expectedArgs: { dmID: '123' },
      response: { dmSignature: 'signed-sent-big-message' },
    },
    {
      name: 'downloads a big message',
      invoke: (client: ISDSBox) => client.downloadBigMessage('123'),
      expectedMethod: 'BigMessageDownload',
      expectedArgs: { dmID: '123' },
      response: { dmReturnedMessage: { dmDm: { dmID: '123' } } },
    },
  ])('$name', async ({ invoke, expectedMethod, expectedArgs, response }) => {
    const requestSpy = vi
      .spyOn(ISDSSoapClient.prototype, 'request')
      .mockResolvedValue(response);

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');
    const result = await invoke(isdsBox);

    expect(result).toEqual(response);
    expect(requestSpy.mock.calls[0]?.[0]).toBe(expectedMethod);
    expect(requestSpy.mock.calls[0]?.[1]).toEqual(expectedArgs);
  });

  it('lists sent messages with normalized filters', async () => {
    const requestSpy = vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      dmRecords: { dmRecord: [] },
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    } satisfies MessageListResult);

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');

    await isdsBox.listSentMessages({
      dmFromTime: new Date('2026-04-12T07:00:00.000Z'),
      dmToTime: new Date('2026-04-12T08:00:00.000Z'),
      dmSenderOrgUnitNum: 42,
      dmStatusFilter: 'DELIVERED',
      dmOffset: 5,
      dmLimit: 50,
    });

    expect(requestSpy.mock.calls[0]?.[0]).toBe('GetListOfSentMessages');
    expect(requestSpy.mock.calls[0]?.[1]).toEqual({
      dmFromTime: '2026-04-12T07:00:00.000Z',
      dmToTime: '2026-04-12T08:00:00.000Z',
      dmSenderOrgUnitNum: 42,
      dmStatusFilter: 'DELIVERED',
      dmOffset: 5,
      dmLimit: 50,
    });
  });

  it('lists received messages with normalized filters', async () => {
    const requestSpy = vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      dmRecords: { dmRecord: [] },
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    } satisfies MessageListResult);

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');

    await isdsBox.listReceivedMessages({
      dmFromTime: new Date('2026-04-12T07:00:00.000Z'),
      dmLimit: 50,
    });

    expect(requestSpy.mock.calls[0]?.[0]).toBe('GetListOfReceivedMessages');
    expect(requestSpy.mock.calls[0]?.[1]).toEqual({
      dmFromTime: '2026-04-12T07:00:00.000Z',
      dmToTime: null,
      dmRecipientOrgUnitNum: null,
      dmStatusFilter: '',
      dmOffset: null,
      dmLimit: 50,
    });
  });

  it('gets message state changes with normalized dates', async () => {
    const requestSpy = vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      dmRecords: { dmRecord: [] },
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    });

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');

    await isdsBox.getMessageStateChanges({
      dmFromTime: new Date('2026-04-12T07:00:00.000Z'),
      dmToTime: new Date('2026-04-12T08:00:00.000Z'),
    });

    expect(requestSpy.mock.calls[0]?.[0]).toBe('GetMessageStateChanges');
    expect(requestSpy.mock.calls[0]?.[1]).toEqual({
      dmFromTime: '2026-04-12T07:00:00.000Z',
      dmToTime: '2026-04-12T08:00:00.000Z',
    });
  });

  it('lists notifications with normalized dates', async () => {
    const requestSpy = vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      ntfRecords: { ntfRecord: [] },
      ntfListContinues: false,
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    });

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');

    await isdsBox.listNotifications({
      ntfFromTime: new Date('2026-04-12T07:00:00.000Z'),
      ntfScope: 'ALL',
    });

    expect(requestSpy.mock.calls[0]?.[0]).toBe('GetListForNotifications');
    expect(requestSpy.mock.calls[0]?.[1]).toEqual({
      ntfFromTime: '2026-04-12T07:00:00.000Z',
      ntfScope: 'ALL',
    });
  });

  it('gets erased messages for an explicit date range', async () => {
    const requestSpy = vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      asyncID: 'async-1',
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    });

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');

    await isdsBox.getErasedMessages({
      dmFromDate: new Date('2026-04-01T00:00:00.000Z'),
      dmToDate: new Date('2026-04-30T00:00:00.000Z'),
      dmMessageType: 'RECEIVED',
      dmOutFormat: 'XML',
    });

    expect(requestSpy.mock.calls[0]?.[0]).toBe('GetListOfErasedMessages');
    expect(requestSpy.mock.calls[0]?.[1]).toEqual({
      dmFromDate: '2026-04-01',
      dmToDate: '2026-04-30',
      dmMessageType: 'RECEIVED',
      dmOutFormat: 'XML',
    });
  });

  it('gets erased messages for a year and month selection', async () => {
    const requestSpy = vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      asyncID: 'async-2',
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    });

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');

    await isdsBox.getErasedMessages({
      dmYear: 2026,
      dmMonth: 4,
      dmMessageType: 'SENT',
      dmOutFormat: 'CSV',
    });

    expect(requestSpy.mock.calls[0]?.[0]).toBe('GetListOfErasedMessages');
    expect(requestSpy.mock.calls[0]?.[1]).toEqual({
      dmYear: 2026,
      dmMonth: 4,
      dmMessageType: 'SENT',
      dmOutFormat: 'CSV',
    });
  });

  it('uploads an attachment with the expected SOAP payload shape', async () => {
    const requestSpy = vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      dmAttID: 'att-1',
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    });

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');

    await isdsBox.uploadAttachment({
      dmEncodedContent: 'encoded-attachment',
      dmMimeType: 'application/pdf',
      dmFileDescr: 'document.pdf',
    });

    expect(requestSpy.mock.calls[0]?.[0]).toBe('UploadAttachment');
    expect(requestSpy.mock.calls[0]?.[1]).toEqual({
      dmFile: {
        dmEncodedContent: 'encoded-attachment',
        attributes: {
          dmMimeType: 'application/pdf',
          dmFileDescr: 'document.pdf',
        },
      },
    });
  });

  it('creates a big message with inline and external attachments', async () => {
    const requestSpy = vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      dmID: 'big-message-1',
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    });

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');

    await isdsBox.createBigMessage({
      dmEnvelope: {
        dbIDRecipient: 'abc123',
        dmAnnotation: 'Large payload',
        dmSenderOrgUnit: null,
        dmSenderOrgUnitNum: null,
        dmRecipientOrgUnit: null,
        dmRecipientOrgUnitNum: null,
        dmToHands: null,
        dmRecipientRefNumber: null,
        dmSenderRefNumber: null,
        dmRecipientIdent: null,
        dmSenderIdent: null,
        dmLegalTitleLaw: null,
        dmLegalTitleYear: null,
        dmLegalTitleSect: null,
        dmLegalTitlePar: null,
        dmLegalTitlePoint: null,
        dmPersonalDelivery: false,
        dmAllowSubstDelivery: false,
        dmOVM: false,
        dmPublishOwnID: false,
      },
      dmFiles: {
        dmExtFile: [
          {
            dmFileMetaType: 'main',
            dmAttID: 'att-1',
            dmAttHash1: 'hash-1',
            dmAttHash1Alg: 'SHA256',
            dmAttHash2: 'hash-2',
            dmAttHash2Alg: 'SHA512',
            dmFileGuid: 'guid-1',
          },
        ],
        dmFile: [
          {
            dmEncodedContent: 'inline-base64',
            dmMimeType: 'text/xml',
            dmFileMetaType: 'meta',
            dmFileDescr: 'meta.xml',
          },
        ],
      },
    });

    expect(requestSpy.mock.calls[0]?.[0]).toBe('CreateBigMessage');
    expect(requestSpy.mock.calls[0]?.[1]).toMatchObject({
      dmEnvelope: {
        dbIDRecipient: 'abc123',
        dmAnnotation: 'Large payload',
      },
      dmFiles: {
        dmExtFile: [
          {
            attributes: {
              dmFileMetaType: 'main',
              dmAttID: 'att-1',
              dmAttHash1: 'hash-1',
              dmAttHash1Alg: 'SHA256',
              dmAttHash2: 'hash-2',
              dmAttHash2Alg: 'SHA512',
              dmFileGuid: 'guid-1',
            },
          },
        ],
        dmFile: [
          {
            dmEncodedContent: 'inline-base64',
            attributes: {
              dmFileMetaType: 'meta',
              dmFileDescr: 'meta.xml',
              dmMimeType: 'text/xml',
            },
          },
        ],
      },
    });
  });

  it('throws when required message fields are missing', async () => {
    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');

    await expect(isdsBox.createMessage({}, [])).rejects.toThrow(
      'Missing required field: dbIDRecipient',
    );
    await expect(
      isdsBox.createMessage(
        {
          dbIDRecipient: 'abc123',
        },
        [],
      ),
    ).rejects.toThrow('Missing required field: dmAnnotation');
  });

  it('polls inbox messages and downloads big messages when the record is VODZ', async () => {
    const requestSpy = vi
      .spyOn(ISDSSoapClient.prototype, 'request')
      .mockResolvedValueOnce({
        dmRecords: {
          dmRecord: [
            {
              dmID: '123',
              dmVODZ: true,
            },
          ],
        },
        dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
      } satisfies MessageListResult)
      .mockResolvedValueOnce({
        dmReturnedMessage: { dmDm: { dmAnnotation: 'VoDZ message' } },
        dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
      })
      .mockResolvedValueOnce({
        dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
      });

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');
    const result = await isdsBox.pollReceivedMessages({
      includeMessage: true,
      markAsDownloaded: true,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      record: { dmID: '123', dmVODZ: true },
      message: { dmDm: { dmAnnotation: 'VoDZ message' } },
      markedAsDownloaded: true,
    });
    expect(requestSpy.mock.calls.map(([method]) => method)).toEqual([
      'GetListOfReceivedMessages',
      'BigMessageDownload',
      'MarkMessageAsDownloaded',
    ]);
  });

  it('reports a suspicious message', async () => {
    const requestSpy = vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    } satisfies SuspiciousMessageReportResult);

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');
    const result = await isdsBox.reportSuspiciousMessage({
      dmID: '123',
      allowComplete: true,
      note: 'phishing',
    });

    expect(result).toEqual({
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    });
    expect(requestSpy.mock.calls[0]?.[0]).toBe('SuspMessageReport');
    expect(requestSpy.mock.calls[0]?.[1]).toEqual({
      dmID: '123',
      repName: null,
      repMail: null,
      repTel: null,
      allowComplete: true,
      note: 'phishing',
    });
  });

  it('archives a downloaded ISDS document through the ws2 SOAP service', async () => {
    const requestSpy = vi.spyOn(ISDSSoapClient.prototype, 'request').mockResolvedValue({
      dmResultDoc: 'archived-document-base64',
      nextStampTo: '2027-04-12',
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    } satisfies ArchiveIsdsDocumentResult);

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');
    const result = await isdsBox.archiveIsdsDocument('signed-message-base64');

    expect(result.nextStampTo).toBe('2027-04-12');
    expect(requestSpy.mock.calls[0]?.[0]).toBe('ArchiveISDSDocument');
    expect(requestSpy.mock.calls[0]?.[1]).toEqual({
      dmMessage: 'signed-message-base64',
    });
  });

  it('waits until a new message is available in the inbox', async () => {
    vi.useFakeTimers();

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');
    const pollSpy = vi
      .spyOn(isdsBox, 'pollReceivedMessages')
      .mockResolvedValueOnce({
        list: {
          dmRecords: { dmRecord: [] },
          dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
        },
        items: [],
      })
      .mockResolvedValueOnce({
        list: {
          dmRecords: { dmRecord: [{ dmID: '123' }] },
          dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
        },
        items: [{ record: { dmID: '123' } }],
      });

    const waitPromise = isdsBox.waitForNewMessages({
      intervalMs: 1_000,
      timeoutMs: 5_000,
    });

    await vi.advanceTimersByTimeAsync(1_000);
    const result = await waitPromise;

    expect(result.items).toEqual([{ record: { dmID: '123' } }]);
    expect(pollSpy).toHaveBeenCalledTimes(2);
  });

  it('watches inbox changes and uses notifications as a polling trigger', async () => {
    vi.useFakeTimers();

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');
    const notificationSpy = vi
      .spyOn(isdsBox, 'listNotifications')
      .mockResolvedValueOnce({
        ntfRecords: { ntfRecord: [] },
        ntfListContinues: false,
        dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
      })
      .mockResolvedValueOnce({
        ntfRecords: { ntfRecord: [{ dmID: '456' }] },
        ntfListContinues: false,
        dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
      });
    const pollSpy = vi
      .spyOn(isdsBox, 'pollReceivedMessages')
      .mockResolvedValueOnce({
        list: {
          dmRecords: { dmRecord: [] },
          dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
        },
        items: [],
      })
      .mockResolvedValueOnce({
        list: {
          dmRecords: { dmRecord: [{ dmID: '456' }, { dmID: '456' }] },
          dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
        },
        items: [{ record: { dmID: '456' } }, { record: { dmID: '456' } }],
      });

    const iterator = isdsBox.watchReceivedMessages({
      intervalMs: 1_000,
      notifications: {
        scope: 'ALL',
      },
    });

    const nextBatchPromise = iterator.next();
    await vi.advanceTimersByTimeAsync(1_000);
    const nextBatch = await nextBatchPromise;

    expect(nextBatch.done).toBe(false);
    expect(nextBatch.value?.items).toEqual([{ record: { dmID: '456' } }]);
    expect(notificationSpy).toHaveBeenCalledTimes(2);
    expect(pollSpy).toHaveBeenCalledTimes(2);

    await iterator.return(undefined);
  });

  it('aborts inbox watching through AbortSignal', async () => {
    vi.useFakeTimers();

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');
    vi.spyOn(isdsBox, 'pollReceivedMessages').mockResolvedValue({
      list: {
        dmRecords: { dmRecord: [] },
        dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
      },
      items: [],
    });

    const controller = new AbortController();
    const iterator = isdsBox.watchReceivedMessages({
      intervalMs: 1_000,
      signal: controller.signal,
    });

    const nextPromise = iterator.next();
    controller.abort();

    await expect(nextPromise).rejects.toMatchObject({
      name: 'AbortError',
      message: 'Operation aborted',
    });
  });

  it('rethrows SOAP failures when getting owner info', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    vi.spyOn(ISDSSoapClient.prototype, 'request').mockRejectedValue(
      new Error('SOAP request failed'),
    );

    const isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');

    await expect(isdsBox.getOwnerInfoFromLogin()).rejects.toThrow('SOAP request failed');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error in getOwnerInfoFromLogin:',
      'SOAP request failed',
    );
  });
});

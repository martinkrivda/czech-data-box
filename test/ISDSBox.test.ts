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

import forge from 'node-forge';

import type {
  ArchiveIsdsDocumentResult,
  AuthenticateMessageResult,
  CreateBigMessageInput,
  CreateBigMessageResult,
  CreateMessageResult,
  CreateMultipleMessageResult,
  DataBoxAddressResult,
  DataMessageParams,
  DeliveryInfoResult,
  DownloadAttachmentInput,
  DownloadAttachmentResult,
  EraseMessageInput,
  ErasedMessagesListInput,
  ErasedMessagesResult,
  FindDataBoxResult,
  MessageAuthorDetailsResult,
  MessageAuthorResult,
  MessageDownloadResult,
  MessageEnvelopeResult,
  MessageListInput,
  MessageListResult,
  MessageRecord,
  MessageStateChangesInput,
  MessageStateChangesResult,
  MultipleMessageEnvelopeParams,
  MultipleMessageRecipient,
  NotificationListInput,
  NotificationRecord,
  NotificationWatchOptions,
  NotificationListResult,
  OutgoingFileParams,
  OwnerInfoResult,
  PasswordInfoResult,
  PickUpAsyncResponseInput,
  PickUpAsyncResponseResult,
  PollReceivedMessagesOptions,
  PollReceivedMessagesResult,
  ReceivedMessageListInput,
  RegisterForNotificationsResult,
  ReSignIsdsDocumentResult,
  SentMessageListInput,
  ServiceConnectionMode,
  ServiceType,
  SentMessageEnvelopeResult,
  SignedBinaryResult,
  SoapDateInput,
  SoapDateTimeInput,
  SoapRequestArguments,
  SuspiciousMessageReportInput,
  SuspiciousMessageReportResult,
  UploadedAttachmentInput,
  UploadAttachmentResult,
  VerifyMessageResult,
  WaitForNewMessagesOptions,
  WatchReceivedMessagesOptions,
} from '../types.js';

import type DataBox from '../models/DataBox.js';
import DataMessage from '../models/DataMessage.js';

import {
  DEBUG,
  getConnectionModeFromLegacyLoginType,
  getServiceSoapVersion,
  getServiceURL,
  getServiceWSDL,
} from './config.js';
import ISDSSentOutFiles from './ISDSSentOutFiles.js';
import ISDSSoapClient from './ISDSSoapClient.js';

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function createAbortError(): Error {
  const error = new Error('Operation aborted');
  error.name = 'AbortError';
  return error;
}

class ISDSBox {
  private productionMode: boolean;
  private connectionMode: ServiceConnectionMode;
  private loginName: string;
  private password: string;
  private certfilename: string;
  private privateKey: string;
  private publicKey: string;
  private passPhrase: string;
  private pkcs12Certificate: string;
  private debug: boolean;

  private operationsWS!: ISDSSoapClient;
  private infoWS!: ISDSSoapClient;
  private manipulationsWS!: ISDSSoapClient;
  private accessWS!: ISDSSoapClient;
  private searchWS!: ISDSSoapClient;
  private archiveWS!: ISDSSoapClient;
  private vodzWS!: ISDSSoapClient;

  constructor(
    loginTypeOrConnectionMode: number | ServiceConnectionMode = 0,
    loginName = '',
    password = '',
    certfilename = '',
    privateKey = '',
    publicKey = '',
    passPhrase = '',
    pkcs12Certificate = '',
    production = true,
    debug = DEBUG,
  ) {
    this.productionMode = production;
    this.connectionMode =
      typeof loginTypeOrConnectionMode === 'string'
        ? loginTypeOrConnectionMode
        : getConnectionModeFromLegacyLoginType(loginTypeOrConnectionMode);
    this.loginName = loginName;
    this.password = password;
    this.certfilename = certfilename;
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.passPhrase = passPhrase;
    this.pkcs12Certificate = pkcs12Certificate;
    this.debug = debug;

    this.initClients();
  }

  private logDebug(message: string, ...payload: unknown[]): void {
    if (this.debug) {
      console.log(message, ...payload);
    }
  }

  private createClient(serviceType: ServiceType): ISDSSoapClient {
    return new ISDSSoapClient(getServiceWSDL(serviceType), {
      login: this.loginName,
      password: this.password,
      location: getServiceURL(serviceType, this.connectionMode, this.productionMode),
      connectionMode: this.connectionMode,
      soapVersion: getServiceSoapVersion(serviceType),
      privateKey: this.privateKey,
      publicKey: this.publicKey,
      passPhrase: this.passPhrase,
      debug: this.debug,
    });
  }

  private normalizeDateTime(value?: SoapDateTimeInput): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    return value instanceof Date ? value.toISOString() : value;
  }

  private normalizeDate(value?: SoapDateInput): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }

    return value;
  }

  private normalizeMessageListInput(
    input: MessageListInput,
    orgUnitNum: number | null | undefined,
    recipientOrSenderKey: 'dmRecipientOrgUnitNum' | 'dmSenderOrgUnitNum',
  ): Record<string, unknown> {
    return {
      dmFromTime: this.normalizeDateTime(input.dmFromTime),
      dmToTime: this.normalizeDateTime(input.dmToTime),
      [recipientOrSenderKey]: orgUnitNum ?? null,
      dmStatusFilter: input.dmStatusFilter ?? '',
      dmOffset: input.dmOffset ?? null,
      dmLimit: input.dmLimit ?? null,
    };
  }

  private async buildOutgoingFiles(
    outFilesParams: readonly OutgoingFileParams[],
  ): Promise<ReturnType<ISDSSentOutFiles['build']>> {
    const files = new ISDSSentOutFiles();

    for (const file of outFilesParams) {
      if ('dmFilePath' in file) {
        const success = await files.addFileFromFilePath(
          file.dmFilePath,
          file.dmMimeType,
          file.dmFileMetaType,
          file.dmFileDescr,
          file.dmFileGuid ?? null,
          file.dmUpFileGuid ?? null,
          file.dmFormat ?? null,
        );

        if (!success) {
          throw new Error(`Failed to add file from path: ${file.dmFilePath}`);
        }

        continue;
      }

      files.addFileFromMemory(
        file.dmEncodedContent,
        file.dmMimeType,
        file.dmFileMetaType,
        file.dmFileDescr,
        file.dmFileGuid ?? null,
        file.dmUpFileGuid ?? null,
        file.dmFormat ?? null,
      );
    }

    return files.build();
  }

  private buildMessageEnvelope(
    dataMessageParams: DataMessage | DataMessageParams,
  ): ReturnType<DataMessage['build']> {
    return (
      dataMessageParams instanceof DataMessage
        ? dataMessageParams
        : new DataMessage(dataMessageParams)
    ).build();
  }

  private extractMessageId(record: MessageRecord): string {
    if (typeof record.dmID === 'string' && record.dmID.trim()) {
      return record.dmID;
    }

    throw new Error('Message record does not contain a valid dmID');
  }

  private getMessageId(record: MessageRecord): string | null {
    return typeof record.dmID === 'string' && record.dmID.trim() ? record.dmID : null;
  }

  private extractNotificationRecords(
    result: NotificationListResult,
  ): NotificationRecord[] {
    const records = result.ntfRecords?.ntfRecord;

    if (!records) {
      return [];
    }

    return Array.isArray(records) ? records : [records];
  }

  private assertNotAborted(signal?: AbortSignal): void {
    if (signal?.aborted) {
      throw createAbortError();
    }
  }

  private async sleep(ms: number, signal?: AbortSignal): Promise<void> {
    this.assertNotAborted(signal);

    if (ms <= 0) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        signal?.removeEventListener('abort', onAbort);
        resolve();
      }, ms);

      const onAbort = () => {
        clearTimeout(timeout);
        signal?.removeEventListener('abort', onAbort);
        reject(createAbortError());
      };

      signal?.addEventListener('abort', onAbort, { once: true });
    });
  }

  private initializeNotificationCursor(
    notifications?: NotificationWatchOptions | null,
  ): string | null {
    if (!notifications) {
      return null;
    }

    return this.normalizeDateTime(notifications.fromTime) ?? new Date().toISOString();
  }

  private async shouldPollInboxFromNotifications(
    notifications: NotificationWatchOptions | null | undefined,
    notificationCursor: string | null,
  ): Promise<{ shouldPollInbox: boolean; nextCursor: string | null }> {
    if (!notifications || !notificationCursor) {
      return {
        shouldPollInbox: false,
        nextCursor: notificationCursor,
      };
    }

    const notificationResult = await this.listNotifications({
      ntfFromTime: notificationCursor,
      ntfScope: notifications.scope,
    });
    const records = this.extractNotificationRecords(notificationResult);

    return {
      shouldPollInbox: records.length > 0 || notificationResult.ntfListContinues === true,
      nextCursor: new Date().toISOString(),
    };
  }

  private filterSeenItems(
    items: PollReceivedMessagesResult['items'],
    seenMessageIds: Set<string>,
    seenMessageOrder: string[],
    maxSeenMessageIds: number,
  ): PollReceivedMessagesResult['items'] {
    return items.filter((item) => {
      const dmID = this.getMessageId(item.record);

      if (!dmID) {
        return true;
      }

      if (seenMessageIds.has(dmID)) {
        return false;
      }

      seenMessageIds.add(dmID);
      seenMessageOrder.push(dmID);

      while (seenMessageOrder.length > maxSeenMessageIds) {
        const oldest = seenMessageOrder.shift();
        if (oldest) {
          seenMessageIds.delete(oldest);
        }
      }

      return true;
    });
  }

  private isVodzMessage(record: MessageRecord): boolean {
    if (typeof record.dmVODZ === 'boolean') {
      return record.dmVODZ;
    }

    const attributesCandidates = [record.attributes, record.$attributes, record.$attr];

    for (const candidate of attributesCandidates) {
      if (!isRecord(candidate)) {
        continue;
      }

      const rawValue = candidate.dmVODZ;

      if (typeof rawValue === 'boolean') {
        return rawValue;
      }

      if (typeof rawValue === 'string') {
        return rawValue === 'true' || rawValue === '1';
      }
    }

    return false;
  }

  private async requestOn<TResponse>(
    client: ISDSSoapClient,
    context: string,
    method: string,
    args: SoapRequestArguments,
  ): Promise<TResponse> {
    try {
      return await client.request<TResponse>(method, args);
    } catch (error: unknown) {
      const normalizedError = toError(error);
      console.error(`Error in ${context}:`, normalizedError.message);
      throw normalizedError;
    }
  }

  setConnectionMode(connectionMode: ServiceConnectionMode): this {
    this.connectionMode = connectionMode;
    this.initClients();
    return this;
  }

  setProductionMode(): this {
    this.productionMode = true;
    this.initClients();
    return this;
  }

  setTestMode(): this {
    this.productionMode = false;
    this.initClients();
    return this;
  }

  setDebugMode(): this {
    this.debug = true;
    this.initClients();
    return this;
  }

  setPublicKey(cert: string): this {
    this.publicKey = cert;
    return this;
  }

  setPrivateKey(privateKey: string): this {
    this.privateKey = privateKey;
    return this;
  }

  setPassPhrase(passPhrase: string): this {
    this.passPhrase = passPhrase;
    return this;
  }

  setPkcs12Certificate(pkcs12Certificate: string, passPhrase: string): this {
    const p12Der = forge.util.decode64(pkcs12Certificate);
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passPhrase);

    let cert: string | undefined;
    let key: string | undefined;

    for (const safeContents of p12.safeContents) {
      for (const safeBag of safeContents.safeBags) {
        if (safeBag.type === forge.pki.oids.certBag && safeBag.cert) {
          cert = forge.pki.certificateToPem(safeBag.cert);
        } else if (safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag && safeBag.key) {
          key = forge.pki.privateKeyToPem(safeBag.key);
        }
      }
    }

    if (!cert || !key) {
      throw new Error('Invalid PKCS12 certificate bundle');
    }

    this.pkcs12Certificate = pkcs12Certificate;
    this.setPublicKey(cert).setPrivateKey(key).setPassPhrase(passPhrase);
    return this;
  }

  loginWithUsernameAndPassword(
    loginName: string,
    password: string,
    productionMode = true,
  ): this {
    this.productionMode = productionMode;
    this.connectionMode = 'basic';
    this.loginName = loginName;
    this.password = password;
    this.initClients();
    return this;
  }

  loginWithPkcs12Certificate(
    certFile: string,
    passPhrase: string,
    productionMode = true,
  ): this {
    this.productionMode = productionMode;
    this.connectionMode = 'cert';
    this.loginName = '';
    this.password = '';
    this.setPkcs12Certificate(certFile, passPhrase);
    this.initClients();
    return this;
  }

  loginWithUsernamePasswordAndCertificate(
    loginName: string,
    password: string,
    certFile: string,
    passPhrase: string,
    productionMode = true,
  ): this {
    this.productionMode = productionMode;
    this.connectionMode = 'certds';
    this.loginName = loginName;
    this.password = password;
    this.setPkcs12Certificate(certFile, passPhrase);
    this.initClients();
    return this;
  }

  loginWithHostedSpisServiceCertificate(
    dataBoxId: string,
    certFile: string,
    passPhrase: string,
    productionMode = true,
  ): this {
    this.productionMode = productionMode;
    this.connectionMode = 'hspis';
    this.loginName = dataBoxId;
    this.password = '';
    this.setPkcs12Certificate(certFile, passPhrase);
    this.initClients();
    return this;
  }

  initClients(): void {
    const clients: [string, ServiceType][] = [
      ['Operations Service URL', 0],
      ['Info Service URL', 1],
      ['Manipulations Service URL', 2],
      ['Access Service URL', 3],
      ['Search Service URL', 4],
      ['Archive Service URL', 5],
      ['VoDZ Service URL', 6],
    ];

    this.logDebug('Service URLs:');
    for (const [label, serviceType] of clients) {
      this.logDebug(
        `${label}:`,
        getServiceURL(serviceType, this.connectionMode, this.productionMode),
      );
    }

    this.operationsWS = this.createClient(0);
    this.infoWS = this.createClient(1);
    this.manipulationsWS = this.createClient(2);
    this.accessWS = this.createClient(3);
    this.searchWS = this.createClient(4);
    this.archiveWS = this.createClient(5);
    this.vodzWS = this.createClient(6);
  }

  extractMessageRecords(result: MessageListResult): MessageRecord[] {
    const records = result.dmRecords?.dmRecord;

    if (!records) {
      return [];
    }

    return Array.isArray(records) ? records : [records];
  }

  async createMessage(
    dataMessageParams: DataMessage | DataMessageParams,
    outFilesParams: readonly OutgoingFileParams[],
  ): Promise<CreateMessageResult> {
    const message = this.buildMessageEnvelope(dataMessageParams);

    if (!message.dbIDRecipient?.trim()) {
      throw new Error('Missing required field: dbIDRecipient');
    }

    if (!message.dmAnnotation?.trim()) {
      throw new Error('Missing required field: dmAnnotation');
    }

    const input = {
      dmEnvelope: message,
      dmFiles: await this.buildOutgoingFiles(outFilesParams),
    };

    this.logDebug('Final SOAP request body:', JSON.stringify(input, null, 2));

    return this.requestOn<CreateMessageResult>(
      this.operationsWS,
      'createMessage',
      'CreateMessage',
      input,
    );
  }

  async createMultipleMessage(
    envelopeParams: MultipleMessageEnvelopeParams,
    recipients: readonly MultipleMessageRecipient[],
    outFilesParams: readonly OutgoingFileParams[],
  ): Promise<CreateMultipleMessageResult> {
    if (recipients.length === 0) {
      throw new Error('At least one recipient is required for createMultipleMessage');
    }

    const builtEnvelope = this.buildMessageEnvelope(envelopeParams);

    if (!builtEnvelope.dmAnnotation?.trim()) {
      throw new Error('Missing required field: dmAnnotation');
    }

    const multipleEnvelope = Object.fromEntries(
      Object.entries(builtEnvelope).filter(
        ([key]) =>
          ![
            'dbIDRecipient',
            'dmRecipientOrgUnit',
            'dmRecipientOrgUnitNum',
            'dmToHands',
          ].includes(key),
      ),
    );

    return this.requestOn<CreateMultipleMessageResult>(
      this.operationsWS,
      'createMultipleMessage',
      'CreateMultipleMessage',
      {
        dmRecipients: {
          dmRecipient: recipients.map((recipient) => ({
            dbIDRecipient: recipient.dbIDRecipient,
            dmRecipientOrgUnit: recipient.dmRecipientOrgUnit ?? null,
            dmRecipientOrgUnitNum: recipient.dmRecipientOrgUnitNum ?? null,
            dmToHands: recipient.dmToHands ?? null,
          })),
        },
        dmEnvelope: multipleEnvelope,
        dmFiles: await this.buildOutgoingFiles(outFilesParams),
      },
    );
  }

  async findDataBox(dbOwnerInfo: DataBox): Promise<FindDataBoxResult> {
    return this.requestOn<FindDataBoxResult>(
      this.searchWS,
      'findDataBox',
      'FindDataBox',
      dbOwnerInfo.build(),
    );
  }

  async getDataBoxAddress(dbID: string): Promise<DataBoxAddressResult> {
    return this.requestOn<DataBoxAddressResult>(
      this.searchWS,
      'getDataBoxAddress',
      'GetDataBoxAddress',
      { dbID },
    );
  }

  async getOwnerInfoFromLogin(): Promise<OwnerInfoResult> {
    return this.requestOn<OwnerInfoResult>(
      this.accessWS,
      'getOwnerInfoFromLogin',
      'GetOwnerInfoFromLogin',
      { dbDummy: '' },
    );
  }

  async getPasswordInfo(): Promise<PasswordInfoResult> {
    return this.requestOn<PasswordInfoResult>(
      this.accessWS,
      'getPasswordInfo',
      'GetPasswordInfo',
      { dbDummy: '' },
    );
  }

  async verifyMessage(dmID: string): Promise<VerifyMessageResult> {
    return this.requestOn<VerifyMessageResult>(
      this.infoWS,
      'verifyMessage',
      'VerifyMessage',
      { dmID },
    );
  }

  async getDeliveryInfo(dmID: string): Promise<DeliveryInfoResult> {
    return this.requestOn<DeliveryInfoResult>(
      this.infoWS,
      'getDeliveryInfo',
      'GetDeliveryInfo',
      { dmID },
    );
  }

  async getSignedDeliveryInfo(dmID: string): Promise<SignedBinaryResult> {
    return this.requestOn<SignedBinaryResult>(
      this.infoWS,
      'getSignedDeliveryInfo',
      'GetSignedDeliveryInfo',
      { dmID },
    );
  }

  async listSentMessages(input: SentMessageListInput = {}): Promise<MessageListResult> {
    return this.requestOn<MessageListResult>(
      this.infoWS,
      'listSentMessages',
      'GetListOfSentMessages',
      this.normalizeMessageListInput(
        input,
        input.dmSenderOrgUnitNum,
        'dmSenderOrgUnitNum',
      ),
    );
  }

  async listReceivedMessages(
    input: ReceivedMessageListInput = {},
  ): Promise<MessageListResult> {
    return this.requestOn<MessageListResult>(
      this.infoWS,
      'listReceivedMessages',
      'GetListOfReceivedMessages',
      this.normalizeMessageListInput(
        input,
        input.dmRecipientOrgUnitNum,
        'dmRecipientOrgUnitNum',
      ),
    );
  }

  async downloadMessage(dmID: string): Promise<MessageDownloadResult> {
    return this.requestOn<MessageDownloadResult>(
      this.operationsWS,
      'downloadMessage',
      'MessageDownload',
      { dmID },
    );
  }

  async downloadMessageEnvelope(dmID: string): Promise<MessageEnvelopeResult> {
    return this.requestOn<MessageEnvelopeResult>(
      this.infoWS,
      'downloadMessageEnvelope',
      'MessageEnvelopeDownload',
      { dmID },
    );
  }

  async downloadSignedMessage(dmID: string): Promise<SignedBinaryResult> {
    return this.requestOn<SignedBinaryResult>(
      this.operationsWS,
      'downloadSignedMessage',
      'SignedMessageDownload',
      { dmID },
    );
  }

  async markMessageAsDownloaded(dmID: string): Promise<RegisterForNotificationsResult> {
    return this.requestOn<RegisterForNotificationsResult>(
      this.infoWS,
      'markMessageAsDownloaded',
      'MarkMessageAsDownloaded',
      { dmID },
    );
  }

  async downloadSignedSentMessage(dmID: string): Promise<SignedBinaryResult> {
    return this.requestOn<SignedBinaryResult>(
      this.operationsWS,
      'downloadSignedSentMessage',
      'SignedSentMessageDownload',
      { dmID },
    );
  }

  async getMessageStateChanges(
    input: MessageStateChangesInput = {},
  ): Promise<MessageStateChangesResult> {
    return this.requestOn<MessageStateChangesResult>(
      this.infoWS,
      'getMessageStateChanges',
      'GetMessageStateChanges',
      {
        dmFromTime: this.normalizeDateTime(input.dmFromTime),
        dmToTime: this.normalizeDateTime(input.dmToTime),
      },
    );
  }

  async getMessageAuthor(dmID: string): Promise<MessageAuthorResult> {
    return this.requestOn<MessageAuthorResult>(
      this.infoWS,
      'getMessageAuthor',
      'GetMessageAuthor',
      { dmID },
    );
  }

  async getMessageAuthorDetails(dmID: string): Promise<MessageAuthorDetailsResult> {
    return this.requestOn<MessageAuthorDetailsResult>(
      this.infoWS,
      'getMessageAuthorDetails',
      'GetMessageAuthor2',
      { dmID },
    );
  }

  async eraseMessage(input: EraseMessageInput): Promise<RegisterForNotificationsResult> {
    return this.requestOn<RegisterForNotificationsResult>(
      this.infoWS,
      'eraseMessage',
      'EraseMessage',
      input,
    );
  }

  async getErasedMessages(input: ErasedMessagesListInput): Promise<ErasedMessagesResult> {
    const payload =
      'dmFromDate' in input
        ? {
            dmFromDate: this.normalizeDate(input.dmFromDate),
            dmToDate: this.normalizeDate(input.dmToDate),
            dmMessageType: input.dmMessageType,
            dmOutFormat: input.dmOutFormat,
          }
        : {
            dmYear: input.dmYear,
            dmMonth: input.dmMonth ?? null,
            dmMessageType: input.dmMessageType,
            dmOutFormat: input.dmOutFormat,
          };

    return this.requestOn<ErasedMessagesResult>(
      this.infoWS,
      'getErasedMessages',
      'GetListOfErasedMessages',
      payload,
    );
  }

  async pickUpAsyncResponse(
    input: PickUpAsyncResponseInput,
  ): Promise<PickUpAsyncResponseResult> {
    return this.requestOn<PickUpAsyncResponseResult>(
      this.infoWS,
      'pickUpAsyncResponse',
      'PickUpAsyncResponse',
      input,
    );
  }

  async listNotifications(input: NotificationListInput): Promise<NotificationListResult> {
    return this.requestOn<NotificationListResult>(
      this.infoWS,
      'listNotifications',
      'GetListForNotifications',
      {
        ntfFromTime: this.normalizeDateTime(input.ntfFromTime),
        ntfScope: input.ntfScope,
      },
    );
  }

  async registerForNotifications(
    action: number,
  ): Promise<RegisterForNotificationsResult> {
    return this.requestOn<RegisterForNotificationsResult>(
      this.infoWS,
      'registerForNotifications',
      'RegisterForNotifications',
      { action },
    );
  }

  async getSentMessageEnvelope(dmID: string): Promise<SentMessageEnvelopeResult> {
    return this.requestOn<SentMessageEnvelopeResult>(
      this.infoWS,
      'getSentMessageEnvelope',
      'SentMessageEnvelopeDownload',
      { dmID },
    );
  }

  async reportSuspiciousMessage(
    input: SuspiciousMessageReportInput,
  ): Promise<SuspiciousMessageReportResult> {
    return this.requestOn<SuspiciousMessageReportResult>(
      this.infoWS,
      'reportSuspiciousMessage',
      'SuspMessageReport',
      {
        dmID: input.dmID,
        repName: input.repName ?? null,
        repMail: input.repMail ?? null,
        repTel: input.repTel ?? null,
        allowComplete: input.allowComplete,
        note: input.note ?? null,
      },
    );
  }

  async authenticateMessage(dmMessage: string): Promise<AuthenticateMessageResult> {
    return this.requestOn<AuthenticateMessageResult>(
      this.operationsWS,
      'authenticateMessage',
      'AuthenticateMessage',
      { dmMessage },
    );
  }

  async reSignIsdsDocument(dmDoc: string): Promise<ReSignIsdsDocumentResult> {
    return this.requestOn<ReSignIsdsDocumentResult>(
      this.operationsWS,
      'reSignIsdsDocument',
      'Re-signISDSDocument',
      { dmDoc },
    );
  }

  async dummyOperation(value = ''): Promise<RegisterForNotificationsResult> {
    return this.requestOn<RegisterForNotificationsResult>(
      this.operationsWS,
      'dummyOperation',
      'DummyOperation',
      { DummyOperation: value },
    );
  }

  async uploadAttachment(
    input: UploadedAttachmentInput,
  ): Promise<UploadAttachmentResult> {
    return this.requestOn<UploadAttachmentResult>(
      this.vodzWS,
      'uploadAttachment',
      'UploadAttachment',
      {
        dmFile: {
          dmEncodedContent: input.dmEncodedContent,
          attributes: {
            dmMimeType: input.dmMimeType,
            dmFileDescr: input.dmFileDescr,
          },
        },
      },
    );
  }

  async downloadAttachment(
    input: DownloadAttachmentInput,
  ): Promise<DownloadAttachmentResult> {
    return this.requestOn<DownloadAttachmentResult>(
      this.vodzWS,
      'downloadAttachment',
      'DownloadAttachment',
      input,
    );
  }

  async createBigMessage(input: CreateBigMessageInput): Promise<CreateBigMessageResult> {
    const dmExtFile = input.dmFiles.dmExtFile?.map((file) => ({
      attributes: {
        dmFileMetaType: file.dmFileMetaType,
        dmAttID: file.dmAttID,
        dmAttHash1: file.dmAttHash1,
        dmAttHash1Alg: file.dmAttHash1Alg,
        dmAttHash2: file.dmAttHash2,
        dmAttHash2Alg: file.dmAttHash2Alg,
        ...(file.dmFileGuid ? { dmFileGuid: file.dmFileGuid } : {}),
        ...(file.dmUpFileGuid ? { dmUpFileGuid: file.dmUpFileGuid } : {}),
      },
    }));
    const dmFile = input.dmFiles.dmFile?.map((file) => ({
      dmEncodedContent: file.dmEncodedContent,
      attributes: {
        dmFileMetaType: file.dmFileMetaType,
        dmFileDescr: file.dmFileDescr,
        dmMimeType: file.dmMimeType,
        ...(file.dmFileGuid ? { dmFileGuid: file.dmFileGuid } : {}),
        ...(file.dmUpFileGuid ? { dmUpFileGuid: file.dmUpFileGuid } : {}),
      },
    }));

    return this.requestOn<CreateBigMessageResult>(
      this.vodzWS,
      'createBigMessage',
      'CreateBigMessage',
      {
        dmEnvelope: input.dmEnvelope,
        dmFiles: {
          ...(dmExtFile ? { dmExtFile } : {}),
          ...(dmFile ? { dmFile } : {}),
        },
      },
    );
  }

  async authenticateBigMessage(dmMessage: string): Promise<AuthenticateMessageResult> {
    return this.requestOn<AuthenticateMessageResult>(
      this.vodzWS,
      'authenticateBigMessage',
      'AuthenticateBigMessage',
      { dmMessage },
    );
  }

  async downloadSignedBigMessage(dmID: string): Promise<SignedBinaryResult> {
    return this.requestOn<SignedBinaryResult>(
      this.vodzWS,
      'downloadSignedBigMessage',
      'SignedBigMessageDownload',
      { dmID },
    );
  }

  async downloadSignedSentBigMessage(dmID: string): Promise<SignedBinaryResult> {
    return this.requestOn<SignedBinaryResult>(
      this.vodzWS,
      'downloadSignedSentBigMessage',
      'SignedSentBigMessageDownload',
      { dmID },
    );
  }

  async downloadBigMessage(dmID: string): Promise<MessageDownloadResult> {
    return this.requestOn<MessageDownloadResult>(
      this.vodzWS,
      'downloadBigMessage',
      'BigMessageDownload',
      { dmID },
    );
  }

  async archiveIsdsDocument(dmMessage: string): Promise<ArchiveIsdsDocumentResult> {
    return this.requestOn<ArchiveIsdsDocumentResult>(
      this.archiveWS,
      'archiveIsdsDocument',
      'ArchiveISDSDocument',
      { dmMessage },
    );
  }

  async pollReceivedMessages(
    options: PollReceivedMessagesOptions = {},
  ): Promise<PollReceivedMessagesResult> {
    const list = await this.listReceivedMessages(options);
    const records = this.extractMessageRecords(list);
    const items: PollReceivedMessagesResult['items'] = [];

    for (const record of records) {
      const dmID = this.extractMessageId(record);
      const envelope = options.includeEnvelope
        ? (await this.downloadMessageEnvelope(dmID)).dmReturnedMessageEnvelope
        : undefined;
      const message = options.includeMessage
        ? this.isVodzMessage(record)
          ? (await this.downloadBigMessage(dmID)).dmReturnedMessage
          : (await this.downloadMessage(dmID)).dmReturnedMessage
        : undefined;
      const deliveryInfo = options.includeDeliveryInfo
        ? (await this.getDeliveryInfo(dmID)).dmDelivery
        : undefined;

      let markedAsDownloaded = false;
      if (options.markAsDownloaded) {
        await this.markMessageAsDownloaded(dmID);
        markedAsDownloaded = true;
      }

      const item: PollReceivedMessagesResult['items'][number] = {
        record,
        markedAsDownloaded,
      };

      if (envelope !== undefined) {
        item.envelope = envelope;
      }

      if (message !== undefined) {
        item.message = message;
      }

      if (deliveryInfo !== undefined) {
        item.deliveryInfo = deliveryInfo;
      }

      items.push(item);
    }

    return {
      list,
      items,
    };
  }

  async waitForNewMessages(
    options: WaitForNewMessagesOptions = {},
  ): Promise<PollReceivedMessagesResult> {
    const {
      intervalMs = 30_000,
      timeoutMs = null,
      signal,
      notifications = null,
      ...pollOptions
    } = options;

    this.assertNotAborted(signal);

    if (
      notifications?.registerAction !== undefined &&
      notifications.registerAction !== null
    ) {
      await this.registerForNotifications(notifications.registerAction);
    }

    const startedAt = Date.now();
    let firstIteration = true;
    let notificationCursor = this.initializeNotificationCursor(notifications);

    for (;;) {
      this.assertNotAborted(signal);

      let shouldPollInbox = !notifications || firstIteration;

      if (notifications) {
        const notificationDecision = await this.shouldPollInboxFromNotifications(
          notifications,
          notificationCursor,
        );
        shouldPollInbox ||= notificationDecision.shouldPollInbox;
        notificationCursor = notificationDecision.nextCursor;
      }

      if (shouldPollInbox) {
        const batch = await this.pollReceivedMessages(pollOptions);
        if (batch.items.length > 0) {
          return batch;
        }
      }

      if (timeoutMs !== null && Date.now() - startedAt >= timeoutMs) {
        throw new Error('Timed out waiting for new ISDS messages');
      }

      firstIteration = false;
      await this.sleep(intervalMs, signal);
    }
  }

  async *watchReceivedMessages(
    options: WatchReceivedMessagesOptions = {},
  ): AsyncGenerator<PollReceivedMessagesResult, void, void> {
    const {
      intervalMs = 30_000,
      signal,
      notifications = null,
      dedupeByMessageId = true,
      maxSeenMessageIds = 1000,
      ...pollOptions
    } = options;

    this.assertNotAborted(signal);

    if (
      notifications?.registerAction !== undefined &&
      notifications.registerAction !== null
    ) {
      await this.registerForNotifications(notifications.registerAction);
    }

    const seenMessageIds = new Set<string>();
    const seenMessageOrder: string[] = [];
    let firstIteration = true;
    let notificationCursor = this.initializeNotificationCursor(notifications);

    for (;;) {
      this.assertNotAborted(signal);

      let shouldPollInbox = !notifications || firstIteration;

      if (notifications) {
        const notificationDecision = await this.shouldPollInboxFromNotifications(
          notifications,
          notificationCursor,
        );
        shouldPollInbox ||= notificationDecision.shouldPollInbox;
        notificationCursor = notificationDecision.nextCursor;
      }

      if (shouldPollInbox) {
        const batch = await this.pollReceivedMessages(pollOptions);
        const items = dedupeByMessageId
          ? this.filterSeenItems(
              batch.items,
              seenMessageIds,
              seenMessageOrder,
              maxSeenMessageIds,
            )
          : batch.items;

        if (items.length > 0) {
          yield {
            list: batch.list,
            items,
          };
        }
      }

      firstIteration = false;
      await this.sleep(intervalMs, signal);
    }
  }
}

export default ISDSBox;

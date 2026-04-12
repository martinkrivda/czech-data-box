export type LoginType = 0 | 1;

export type ServiceType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ServiceConnectionMode = 'basic' | 'cert' | 'certds' | 'hspis';

export type SoapVersion = '1.1' | '1.2';

export type SoapDateInput = string | Date | null;
export type SoapDateTimeInput = string | Date | null;

export interface SoapStatus {
  dmStatusCode?: string;
  dmStatusMessage?: string;
  dbStatusCode?: string;
  dbStatusMessage?: string;
  [key: string]: unknown;
}

export interface DataBoxOwnerInfo {
  dbID?: string;
  dbType?: string;
  ic?: string;
  pnFirstName?: string;
  pnMiddleName?: string;
  pnLastName?: string;
  pnLastNameAtBirth?: string;
  firmName?: string;
  biDate?: string;
  biCity?: string;
  biCounty?: string;
  biState?: string;
  adCity?: string;
  adStreet?: string;
  adNumberInStreet?: string;
  adNumberInMunicipality?: string;
  adZipCode?: string;
  adState?: string;
  nationality?: string;
  email?: string;
  telNumber?: string;
  identifier?: string;
  registryCode?: string;
  dbState?: string;
  dbEffectiveOVM?: string;
  dbOpenAddressing?: string;
}

export interface BuiltDataBox {
  dbOwnerInfo: DataBoxOwnerInfo;
}

export interface DataMessageParams {
  dmSenderOrgUnit?: string | null;
  dmSenderOrgUnitNum?: string | null;
  dbIDRecipient?: string | null;
  dmRecipientOrgUnit?: string | null;
  dmRecipientOrgUnitNum?: string | null;
  dmToHands?: string | null;
  dmAnnotation?: string | null;
  dmRecipientRefNumber?: string | null;
  dmSenderRefNumber?: string | null;
  dmRecipientIdent?: string | null;
  dmSenderIdent?: string | null;
  dmLegalTitleLaw?: string | null;
  dmLegalTitleYear?: string | null;
  dmLegalTitleSect?: string | null;
  dmLegalTitlePar?: string | null;
  dmLegalTitlePoint?: string | null;
  dmPersonalDelivery?: boolean;
  dmAllowSubstDelivery?: boolean;
  dmOVM?: boolean;
  dmPublishOwnID?: boolean;
}

export interface BuiltDataMessage {
  dmSenderOrgUnit: string | null;
  dmSenderOrgUnitNum: string | null;
  dbIDRecipient: string | null;
  dmRecipientOrgUnit: string | null;
  dmRecipientOrgUnitNum: string | null;
  dmToHands: string | null;
  dmAnnotation: string | null;
  dmRecipientRefNumber: string | null;
  dmSenderRefNumber: string | null;
  dmRecipientIdent: string | null;
  dmSenderIdent: string | null;
  dmLegalTitleLaw: string | null;
  dmLegalTitleYear: string | null;
  dmLegalTitleSect: string | null;
  dmLegalTitlePar: string | null;
  dmLegalTitlePoint: string | null;
  dmPersonalDelivery: boolean;
  dmAllowSubstDelivery: boolean;
  dmOVM: boolean;
  dmPublishOwnID: boolean;
}

export type MultipleMessageEnvelopeParams = Omit<
  DataMessageParams,
  'dbIDRecipient' | 'dmRecipientOrgUnit' | 'dmRecipientOrgUnitNum' | 'dmToHands'
>;

export interface MultipleMessageRecipient {
  dbIDRecipient: string;
  dmRecipientOrgUnit?: string | null;
  dmRecipientOrgUnitNum?: number | null;
  dmToHands?: string | null;
}

export interface DataMessageFileAttributes {
  dmMimeType: string;
  dmFileMetaType: string;
  dmFileDescr: string;
  dmFileGuid: string;
  dmUpFileGuid: string;
  dmFormat: string;
}

export interface BuiltDataMessageFile {
  attributes: DataMessageFileAttributes;
  dmEncodedContent?: string;
  dmXMLContent?: string;
}

export interface BuiltDataMessageFiles {
  dmFile: BuiltDataMessageFile[];
}

export interface OutgoingFileCommon {
  dmMimeType: string;
  dmFileMetaType: string;
  dmFileDescr: string;
  dmFileGuid?: string | null;
  dmUpFileGuid?: string | null;
  dmFormat?: string | null;
}

export interface OutgoingFileFromPath extends OutgoingFileCommon {
  dmFilePath: string;
  dmEncodedContent?: never;
}

export interface OutgoingFileFromMemory extends OutgoingFileCommon {
  dmEncodedContent: string;
  dmFilePath?: never;
}

export type OutgoingFileParams = OutgoingFileFromPath | OutgoingFileFromMemory;

export interface BigMessageInlineFile extends OutgoingFileCommon {
  dmEncodedContent: string;
}

export interface BigMessageExternalFile {
  dmFileMetaType: string;
  dmAttID: string;
  dmAttHash1: string;
  dmAttHash1Alg: string;
  dmAttHash2: string;
  dmAttHash2Alg: string;
  dmFileGuid?: string | null;
  dmUpFileGuid?: string | null;
}

export interface BigMessageFilesInput {
  dmExtFile?: readonly BigMessageExternalFile[];
  dmFile?: readonly BigMessageInlineFile[];
}

export interface CreateBigMessageInput {
  dmEnvelope: BuiltDataMessage & Record<string, unknown>;
  dmFiles: BigMessageFilesInput;
}

export interface UploadedAttachmentInput {
  dmEncodedContent: string;
  dmMimeType: string;
  dmFileDescr: string;
}

export interface DownloadAttachmentInput {
  dmID: string;
  attNum: number;
}

export type SoapRequestArguments = object;

export interface CreateMessageResult extends Record<string, unknown> {
  dmID?: string;
  dmStatus?: SoapStatus;
}

export interface MultipleMessageStatus extends Record<string, unknown> {
  dmID?: string;
  dmStatus?: SoapStatus;
}

export interface CreateMultipleMessageResult extends Record<string, unknown> {
  dmMultipleStatus?: {
    dmSingleStatus?: MultipleMessageStatus | MultipleMessageStatus[] | null;
  } | null;
  dmStatus?: SoapStatus;
}

export interface MessageHash extends Record<string, unknown> {
  value?: string;
  algorithm?: string;
}

export interface VerifyMessageResult extends Record<string, unknown> {
  dmHash?: MessageHash;
  dmStatus?: SoapStatus;
}

export interface DeliveryInfoResult extends Record<string, unknown> {
  dmDelivery?: Record<string, unknown> | null;
  dmStatus?: SoapStatus;
}

export interface SignedBinaryResult extends Record<string, unknown> {
  dmSignature?: string;
  dmStatus?: SoapStatus;
}

export interface MessageRecord extends Record<string, unknown> {
  dmID?: string;
  dmOrdinal?: number;
  dmAnnotation?: string | null;
  dmDeliveryTime?: string | null;
  dmAcceptanceTime?: string | null;
  dmMessageStatus?: number;
  dmAttachmentSize?: number | null;
  dmType?: string;
  dmVODZ?: boolean;
  specMessFlag?: number;
}

export interface MessageListResult extends Record<string, unknown> {
  dmRecords?: {
    dmRecord?: MessageRecord | MessageRecord[] | null;
  } | null;
  dmStatus?: SoapStatus;
}

export interface MessageDownloadResult extends Record<string, unknown> {
  dmReturnedMessage?: Record<string, unknown> | null;
  dmStatus?: SoapStatus;
}

export interface MessageEnvelopeResult extends Record<string, unknown> {
  dmReturnedMessageEnvelope?: Record<string, unknown> | null;
  dmStatus?: SoapStatus;
}

export interface MessageListInput {
  dmFromTime?: SoapDateTimeInput;
  dmToTime?: SoapDateTimeInput;
  dmStatusFilter?: string | null;
  dmOffset?: number | null;
  dmLimit?: number | null;
}

export interface SentMessageListInput extends MessageListInput {
  dmSenderOrgUnitNum?: number | null;
}

export interface ReceivedMessageListInput extends MessageListInput {
  dmRecipientOrgUnitNum?: number | null;
}

export interface MessageStateChangesInput {
  dmFromTime?: SoapDateTimeInput;
  dmToTime?: SoapDateTimeInput;
}

export interface MessageStateChangeRecord extends Record<string, unknown> {
  dmID?: string;
  dmEventTime?: string;
  dmMessageStatus?: number;
}

export interface MessageStateChangesResult extends Record<string, unknown> {
  dmRecords?: {
    dmRecord?: MessageStateChangeRecord | MessageStateChangeRecord[] | null;
  } | null;
  dmStatus?: SoapStatus;
}

export interface MessageAuthorResult extends Record<string, unknown> {
  userType?: string | null;
  authorName?: string | null;
  dmStatus?: SoapStatus;
}

export interface MessageAuthorDetailItem extends Record<string, unknown> {
  key: string;
  value: string;
}

export interface MessageAuthorDetailsResult extends Record<string, unknown> {
  dmMessageAuthor?: {
    maItem?: MessageAuthorDetailItem | MessageAuthorDetailItem[] | null;
  } | null;
  dmStatus?: SoapStatus;
}

export interface EraseMessageInput {
  dmID: string;
  dmIncoming: boolean;
}

export type ErasedMessagesListInput =
  | {
      dmFromDate: SoapDateInput;
      dmToDate: SoapDateInput;
      dmMessageType: 'SENT' | 'RECEIVED';
      dmOutFormat: 'XML' | 'CSV';
    }
  | {
      dmYear: number;
      dmMonth?: number | null;
      dmMessageType: 'SENT' | 'RECEIVED';
      dmOutFormat: 'XML' | 'CSV';
    };

export interface ErasedMessagesResult extends Record<string, unknown> {
  asyncID?: string;
  dmStatus?: SoapStatus;
}

export interface PickUpAsyncResponseInput {
  asyncID: string;
  asyncReqType: string;
}

export interface PickUpAsyncResponseResult extends Record<string, unknown> {
  asyncReqType?: string;
  asyncResponse?: string;
  dmStatus?: SoapStatus;
}

export interface NotificationListInput {
  ntfFromTime: SoapDateTimeInput;
  ntfScope: string;
}

export interface NotificationRecord extends Record<string, unknown> {
  ntfType?: number;
  dmID?: string;
  dmPersonalDelivery?: number;
  dmDeliveryTime?: string;
  dbIDRecipient?: string;
  dmAnnotation?: string;
  dbIDSender?: string;
  dmSender?: string;
}

export interface NotificationListResult extends Record<string, unknown> {
  ntfRecords?: {
    ntfRecord?: NotificationRecord | NotificationRecord[] | null;
  } | null;
  ntfListContinues?: boolean;
  dmStatus?: SoapStatus;
}

export interface RegisterForNotificationsResult extends Record<string, unknown> {
  dmStatus?: SoapStatus;
}

export interface AuthenticateMessageResult extends Record<string, unknown> {
  dmAuthResult?: boolean | null;
  dmStatus?: SoapStatus;
}

export interface ReSignIsdsDocumentResult extends Record<string, unknown> {
  dmResultDoc?: string | null;
  dmValidTo?: string;
  dmStatus?: SoapStatus;
}

export interface SentMessageEnvelopeResult extends Record<string, unknown> {
  dmReturnedMessageEnvelope?: Record<string, unknown> | null;
  dmStatus?: SoapStatus;
}

export interface SuspiciousMessageReportInput {
  dmID: string;
  repName?: string | null;
  repMail?: string | null;
  repTel?: string | null;
  allowComplete: boolean;
  note?: string | null;
}

export interface SuspiciousMessageReportResult extends Record<string, unknown> {
  dmStatus?: SoapStatus;
}

export interface FindDataBoxResult extends Record<string, unknown> {
  dbStatus?: SoapStatus;
  dbResults?: Record<string, unknown>[];
}

export interface DataBoxAddressResult extends Record<string, unknown> {
  adCity?: string | null;
  adStreet?: string | null;
  adNumberInStreet?: string | null;
  adNumberInMunicipality?: string | null;
  adZipCode?: string | null;
  adState?: string | null;
  adFullAddress1?: string | null;
  adFullAddress2?: string | null;
  adRegistrationNumber?: string | null;
}

export interface OwnerInfoResult extends Record<string, unknown> {
  dbStatus?: SoapStatus;
  ownerInfo?: Record<string, unknown>;
}

export interface PasswordInfoResult extends Record<string, unknown> {
  dbStatus?: SoapStatus;
}

export interface UploadedAttachmentHash extends Record<string, unknown> {
  AttHashAlg?: string;
}

export interface UploadAttachmentResult extends Record<string, unknown> {
  dmAttID?: string;
  dmAttHash1?: UploadedAttachmentHash | null;
  dmAttHash2?: UploadedAttachmentHash | null;
  dmStatus?: SoapStatus;
}

export interface DownloadedAttachmentFile extends Record<string, unknown> {
  dmEncodedContent?: string;
  dmFileMetaType?: string;
  dmMimeType?: string;
  dmFileDescr?: string;
}

export interface DownloadAttachmentResult extends Record<string, unknown> {
  dmFile?: DownloadedAttachmentFile | null;
  dmStatus?: SoapStatus;
}

export interface CreateBigMessageResult extends Record<string, unknown> {
  dmID?: string;
  dmStatus?: SoapStatus;
}

export interface ArchiveIsdsDocumentResult extends Record<string, unknown> {
  dmResultDoc?: string | null;
  nextStampTo?: string | null;
  dmStatus?: SoapStatus;
}

export interface PollReceivedMessagesOptions extends ReceivedMessageListInput {
  includeEnvelope?: boolean;
  includeMessage?: boolean;
  includeDeliveryInfo?: boolean;
  markAsDownloaded?: boolean;
}

export interface PolledReceivedMessage {
  record: MessageRecord;
  envelope?: Record<string, unknown> | null;
  message?: Record<string, unknown> | null;
  deliveryInfo?: Record<string, unknown> | null;
  markedAsDownloaded?: boolean;
}

export interface PollReceivedMessagesResult {
  list: MessageListResult;
  items: PolledReceivedMessage[];
}

export interface NotificationWatchOptions {
  scope: string;
  fromTime?: SoapDateTimeInput;
  registerAction?: number | null;
}

export interface WaitForNewMessagesOptions extends PollReceivedMessagesOptions {
  intervalMs?: number;
  timeoutMs?: number | null;
  signal?: AbortSignal;
  notifications?: NotificationWatchOptions | null;
}

export interface WatchReceivedMessagesOptions extends PollReceivedMessagesOptions {
  intervalMs?: number;
  signal?: AbortSignal;
  notifications?: NotificationWatchOptions | null;
  dedupeByMessageId?: boolean;
  maxSeenMessageIds?: number;
}

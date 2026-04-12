import type { BuiltDataMessage, DataMessageParams } from '../types.js';

class DataMessage {
  private readonly values: BuiltDataMessage;

  constructor(params: DataMessageParams = {}) {
    this.values = {
      dmSenderOrgUnit: params.dmSenderOrgUnit ?? null,
      dmSenderOrgUnitNum: params.dmSenderOrgUnitNum ?? null,
      dbIDRecipient: params.dbIDRecipient ?? null,
      dmRecipientOrgUnit: params.dmRecipientOrgUnit ?? null,
      dmRecipientOrgUnitNum: params.dmRecipientOrgUnitNum ?? null,
      dmToHands: params.dmToHands ?? null,
      dmAnnotation: params.dmAnnotation ?? null,
      dmRecipientRefNumber: params.dmRecipientRefNumber ?? null,
      dmSenderRefNumber: params.dmSenderRefNumber ?? null,
      dmRecipientIdent: params.dmRecipientIdent ?? null,
      dmSenderIdent: params.dmSenderIdent ?? null,
      dmLegalTitleLaw: params.dmLegalTitleLaw ?? null,
      dmLegalTitleYear: params.dmLegalTitleYear ?? null,
      dmLegalTitleSect: params.dmLegalTitleSect ?? null,
      dmLegalTitlePar: params.dmLegalTitlePar ?? null,
      dmLegalTitlePoint: params.dmLegalTitlePoint ?? null,
      dmPersonalDelivery: params.dmPersonalDelivery ?? false,
      dmAllowSubstDelivery: params.dmAllowSubstDelivery ?? false,
      dmOVM: params.dmOVM ?? false,
      dmPublishOwnID: params.dmPublishOwnID ?? false,
    };
  }

  private setValue<Key extends keyof BuiltDataMessage>(
    key: Key,
    value: BuiltDataMessage[Key],
  ): this {
    this.values[key] = value;
    return this;
  }

  setDmSenderOrgUnit(value: string | null): this {
    return this.setValue('dmSenderOrgUnit', value);
  }

  setDmSenderOrgUnitNum(value: string | null): this {
    return this.setValue('dmSenderOrgUnitNum', value);
  }

  setDbIDRecipient(value: string | null): this {
    return this.setValue('dbIDRecipient', value);
  }

  setDmRecipientOrgUnit(value: string | null): this {
    return this.setValue('dmRecipientOrgUnit', value);
  }

  setDmRecipientOrgUnitNum(value: string | null): this {
    return this.setValue('dmRecipientOrgUnitNum', value);
  }

  setDmToHands(value: string | null): this {
    return this.setValue('dmToHands', value);
  }

  setDmAnnotation(value: string | null): this {
    return this.setValue('dmAnnotation', value);
  }

  setDmRecipientRefNumber(value: string | null): this {
    return this.setValue('dmRecipientRefNumber', value);
  }

  setDmSenderRefNumber(value: string | null): this {
    return this.setValue('dmSenderRefNumber', value);
  }

  setDmRecipientIdent(value: string | null): this {
    return this.setValue('dmRecipientIdent', value);
  }

  setDmSenderIdent(value: string | null): this {
    return this.setValue('dmSenderIdent', value);
  }

  setDmLegalTitleLaw(value: string | null): this {
    return this.setValue('dmLegalTitleLaw', value);
  }

  setDmLegalTitleYear(value: string | null): this {
    return this.setValue('dmLegalTitleYear', value);
  }

  setDmLegalTitleSect(value: string | null): this {
    return this.setValue('dmLegalTitleSect', value);
  }

  setDmLegalTitlePar(value: string | null): this {
    return this.setValue('dmLegalTitlePar', value);
  }

  setDmLegalTitlePoint(value: string | null): this {
    return this.setValue('dmLegalTitlePoint', value);
  }

  setDmPersonalDelivery(value: boolean): this {
    return this.setValue('dmPersonalDelivery', value);
  }

  setDmAllowSubstDelivery(value: boolean): this {
    return this.setValue('dmAllowSubstDelivery', value);
  }

  setDmOVM(value: boolean): this {
    return this.setValue('dmOVM', value);
  }

  setDmPublishOwnID(value: boolean): this {
    return this.setValue('dmPublishOwnID', value);
  }

  build(): BuiltDataMessage {
    return { ...this.values };
  }
}

export default DataMessage;

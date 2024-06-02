// models/DataMessage.js
class DataMessage {
  constructor({
    dmSenderOrgUnit = null,
    dmSenderOrgUnitNum = null,
    dbIDRecipient = null,
    dmRecipientOrgUnit = null,
    dmRecipientOrgUnitNum = null,
    dmToHands = null,
    dmAnnotation = null,
    dmRecipientRefNumber = null,
    dmSenderRefNumber = null,
    dmRecipientIdent = null,
    dmSenderIdent = null,
    dmLegalTitleLaw = null,
    dmLegalTitleYear = null,
    dmLegalTitleSect = null,
    dmLegalTitlePar = null,
    dmLegalTitlePoint = null,
    dmPersonalDelivery = false,
    dmAllowSubstDelivery = false,
    dmOVM = false,
    dmPublishOwnID = false,
  } = {}) {
    this.dmSenderOrgUnit = dmSenderOrgUnit;
    this.dmSenderOrgUnitNum = dmSenderOrgUnitNum;
    this.dbIDRecipient = dbIDRecipient;
    this.dmRecipientOrgUnit = dmRecipientOrgUnit;
    this.dmRecipientOrgUnitNum = dmRecipientOrgUnitNum;
    this.dmToHands = dmToHands;
    this.dmAnnotation = dmAnnotation;
    this.dmRecipientRefNumber = dmRecipientRefNumber;
    this.dmSenderRefNumber = dmSenderRefNumber;
    this.dmRecipientIdent = dmRecipientIdent;
    this.dmSenderIdent = dmSenderIdent;
    this.dmLegalTitleLaw = dmLegalTitleLaw;
    this.dmLegalTitleYear = dmLegalTitleYear;
    this.dmLegalTitleSect = dmLegalTitleSect;
    this.dmLegalTitlePar = dmLegalTitlePar;
    this.dmLegalTitlePoint = dmLegalTitlePoint;
    this.dmPersonalDelivery = dmPersonalDelivery;
    this.dmAllowSubstDelivery = dmAllowSubstDelivery;
    this.dmOVM = dmOVM;
    this.dmPublishOwnID = dmPublishOwnID;
  }

  setDmSenderOrgUnit(value) {
    this.dmSenderOrgUnit = value;
  }

  setDmSenderOrgUnitNum(value) {
    this.dmSenderOrgUnitNum = value;
  }

  setDbIDRecipient(value) {
    this.dbIDRecipient = value;
  }

  setDmRecipientOrgUnit(value) {
    this.dmRecipientOrgUnit = value;
  }

  setDmRecipientOrgUnitNum(value) {
    this.dmRecipientOrgUnitNum = value;
  }

  setDmToHands(value) {
    this.dmToHands = value;
  }

  setDmAnnotation(value) {
    this.dmAnnotation = value;
  }

  setDmRecipientRefNumber(value) {
    this.dmRecipientRefNumber = value;
  }

  setDmSenderRefNumber(value) {
    this.dmSenderRefNumber = value;
  }

  setDmRecipientIdent(value) {
    this.dmRecipientIdent = value;
  }

  setDmSenderIdent(value) {
    this.dmSenderIdent = value;
  }

  setDmLegalTitleLaw(value) {
    this.dmLegalTitleLaw = value;
  }

  setDmLegalTitleYear(value) {
    this.dmLegalTitleYear = value;
  }

  setDmLegalTitleSect(value) {
    this.dmLegalTitleSect = value;
  }

  setDmLegalTitlePar(value) {
    this.dmLegalTitlePar = value;
  }

  setDmLegalTitlePoint(value) {
    this.dmLegalTitlePoint = value;
  }

  setDmPersonalDelivery(value) {
    this.dmPersonalDelivery = value;
  }

  setDmAllowSubstDelivery(value) {
    this.dmAllowSubstDelivery = value;
  }

  setDmOVM(value) {
    this.dmOVM = value;
  }

  setDmPublishOwnID(value) {
    this.dmPublishOwnID = value;
  }

  build() {
    return {
      dmSenderOrgUnit: this.dmSenderOrgUnit,
      dmSenderOrgUnitNum: this.dmSenderOrgUnitNum,
      dbIDRecipient: this.dbIDRecipient,
      dmRecipientOrgUnit: this.dmRecipientOrgUnit,
      dmRecipientOrgUnitNum: this.dmRecipientOrgUnitNum,
      dmToHands: this.dmToHands,
      dmAnnotation: this.dmAnnotation,
      dmRecipientRefNumber: this.dmRecipientRefNumber,
      dmSenderRefNumber: this.dmSenderRefNumber,
      dmRecipientIdent: this.dmRecipientIdent,
      dmSenderIdent: this.dmSenderIdent,
      dmLegalTitleLaw: this.dmLegalTitleLaw,
      dmLegalTitleYear: this.dmLegalTitleYear,
      dmLegalTitleSect: this.dmLegalTitleSect,
      dmLegalTitlePar: this.dmLegalTitlePar,
      dmLegalTitlePoint: this.dmLegalTitlePoint,
      dmPersonalDelivery: this.dmPersonalDelivery,
      dmAllowSubstDelivery: this.dmAllowSubstDelivery,
      dmOVM: this.dmOVM,
      dmPublishOwnID: this.dmPublishOwnID,
    };
  }
}

export default DataMessage;

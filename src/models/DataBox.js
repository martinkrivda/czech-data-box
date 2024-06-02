// src/models/DataBox.js
class DataBox {
  constructor() {
    this.dbOwnerInfo = {};
  }

  setDbId(value) {
    this.dbOwnerInfo.dbID = value;
    return this;
  }

  setDbType(value) {
    this.dbOwnerInfo.dbType = value;
    return this;
  }

  setIc(value) {
    this.dbOwnerInfo.ic = value;
    return this;
  }

  setPnFirstName(value) {
    this.dbOwnerInfo.pnFirstName = value;
    return this;
  }

  setPnMiddleName(value) {
    this.dbOwnerInfo.pnMiddleName = value;
    return this;
  }

  setPnLastName(value) {
    this.dbOwnerInfo.pnLastName = value;
    return this;
  }

  setPnLastNameAtBirth(value) {
    this.dbOwnerInfo.pnLastNameAtBirth = value;
    return this;
  }

  setFirmName(value) {
    this.dbOwnerInfo.firmName = value;
    return this;
  }

  setBiDate(value) {
    this.dbOwnerInfo.biDate = value;
    return this;
  }

  setBiCity(value) {
    this.dbOwnerInfo.biCity = value;
    return this;
  }

  setBiCounty(value) {
    this.dbOwnerInfo.biCounty = value;
    return this;
  }

  setBiState(value) {
    this.dbOwnerInfo.biState = value;
    return this;
  }

  setAdCity(value) {
    this.dbOwnerInfo.adCity = value;
    return this;
  }

  setAdStreet(value) {
    this.dbOwnerInfo.adStreet = value;
    return this;
  }

  setAdNumberInStreet(value) {
    this.dbOwnerInfo.adNumberInStreet = value;
    return this;
  }

  setAdNumberInMunicipality(value) {
    this.dbOwnerInfo.adNumberInMunicipality = value;
    return this;
  }

  setAdZipCode(value) {
    this.dbOwnerInfo.adZipCode = value;
    return this;
  }

  setAdState(value) {
    this.dbOwnerInfo.adState = value;
    return this;
  }

  setNationality(value) {
    this.dbOwnerInfo.nationality = value;
    return this;
  }

  setEmail(value) {
    this.dbOwnerInfo.email = value;
    return this;
  }

  setTelNumber(value) {
    this.dbOwnerInfo.telNumber = value;
    return this;
  }

  setIdentifier(value) {
    this.dbOwnerInfo.identifier = value;
    return this;
  }

  setRegistryCode(value) {
    this.dbOwnerInfo.registryCode = value;
    return this;
  }

  setDbState(value) {
    this.dbOwnerInfo.dbState = value;
    return this;
  }

  setDbEffectiveOVM(value) {
    this.dbOwnerInfo.dbEffectiveOVM = value;
    return this;
  }

  setDbOpenAddressing(value) {
    this.dbOwnerInfo.dbOpenAddressing = value;
    return this;
  }

  build() {
    return { dbOwnerInfo: this.dbOwnerInfo };
  }
}

export default DataBox;

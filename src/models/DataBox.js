// src/models/DataBox.js
class DataBox {
  constructor() {
    this.dbOwnerInfo = {};
  }

  setDbId(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.dbID = value;
    }
    return this;
  }

  setDbType(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.dbType = value;
    }
    return this;
  }

  setIc(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.ic = value;
    }
    return this;
  }

  setPnFirstName(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.pnFirstName = value;
    }
    return this;
  }

  setPnMiddleName(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.pnMiddleName = value;
    }
    return this;
  }

  setPnLastName(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.pnLastName = value;
    }
    return this;
  }

  setPnLastNameAtBirth(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.pnLastNameAtBirth = value;
    }
    return this;
  }

  setFirmName(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.firmName = value;
    }
    return this;
  }

  setBiDate(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.biDate = value;
    }
    return this;
  }

  setBiCity(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.biCity = value;
    }
    return this;
  }

  setBiCounty(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.biCounty = value;
    }
    return this;
  }

  setBiState(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.biState = value;
    }
    return this;
  }

  setAdCity(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.adCity = value;
    }
    return this;
  }

  setAdStreet(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.adStreet = value;
    }
    return this;
  }

  setAdNumberInStreet(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.adNumberInStreet = value;
    }
    return this;
  }

  setAdNumberInMunicipality(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.adNumberInMunicipality = value;
    }
    return this;
  }

  setAdZipCode(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.adZipCode = value;
    }
    return this;
  }

  setAdState(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.adState = value;
    }
    return this;
  }

  setNationality(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.nationality = value;
    }
    return this;
  }

  setEmail(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.email = value;
    }
    return this;
  }

  setTelNumber(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.telNumber = value;
    }
    return this;
  }

  setIdentifier(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.identifier = value;
    }
    return this;
  }

  setRegistryCode(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.registryCode = value;
    }
    return this;
  }

  setDbState(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.dbState = value;
    }
    return this;
  }

  setDbEffectiveOVM(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.dbEffectiveOVM = value;
    }
    return this;
  }

  setDbOpenAddressing(value) {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo.dbOpenAddressing = value;
    }
    return this;
  }

  build() {
    return { dbOwnerInfo: this.dbOwnerInfo };
  }
}

export default DataBox;

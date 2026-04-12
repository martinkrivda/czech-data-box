import type { BuiltDataBox, DataBoxOwnerInfo } from '../types.js';

class DataBox {
  private readonly dbOwnerInfo: DataBoxOwnerInfo = {};

  private setValue<Key extends keyof DataBoxOwnerInfo>(
    key: Key,
    value: DataBoxOwnerInfo[Key],
  ): this {
    if (typeof value !== 'undefined') {
      this.dbOwnerInfo[key] = value;
    }

    return this;
  }

  setDbId(value?: string): this {
    return this.setValue('dbID', value);
  }

  setDbType(value?: string): this {
    return this.setValue('dbType', value);
  }

  setIc(value?: string): this {
    return this.setValue('ic', value);
  }

  setPnFirstName(value?: string): this {
    return this.setValue('pnFirstName', value);
  }

  setPnMiddleName(value?: string): this {
    return this.setValue('pnMiddleName', value);
  }

  setPnLastName(value?: string): this {
    return this.setValue('pnLastName', value);
  }

  setPnLastNameAtBirth(value?: string): this {
    return this.setValue('pnLastNameAtBirth', value);
  }

  setFirmName(value?: string): this {
    return this.setValue('firmName', value);
  }

  setBiDate(value?: string): this {
    return this.setValue('biDate', value);
  }

  setBiCity(value?: string): this {
    return this.setValue('biCity', value);
  }

  setBiCounty(value?: string): this {
    return this.setValue('biCounty', value);
  }

  setBiState(value?: string): this {
    return this.setValue('biState', value);
  }

  setAdCity(value?: string): this {
    return this.setValue('adCity', value);
  }

  setAdStreet(value?: string): this {
    return this.setValue('adStreet', value);
  }

  setAdNumberInStreet(value?: string): this {
    return this.setValue('adNumberInStreet', value);
  }

  setAdNumberInMunicipality(value?: string): this {
    return this.setValue('adNumberInMunicipality', value);
  }

  setAdZipCode(value?: string): this {
    return this.setValue('adZipCode', value);
  }

  setAdState(value?: string): this {
    return this.setValue('adState', value);
  }

  setNationality(value?: string): this {
    return this.setValue('nationality', value);
  }

  setEmail(value?: string): this {
    return this.setValue('email', value);
  }

  setTelNumber(value?: string): this {
    return this.setValue('telNumber', value);
  }

  setIdentifier(value?: string): this {
    return this.setValue('identifier', value);
  }

  setRegistryCode(value?: string): this {
    return this.setValue('registryCode', value);
  }

  setDbState(value?: string): this {
    return this.setValue('dbState', value);
  }

  setDbEffectiveOVM(value?: string): this {
    return this.setValue('dbEffectiveOVM', value);
  }

  setDbOpenAddressing(value?: string): this {
    return this.setValue('dbOpenAddressing', value);
  }

  build(): BuiltDataBox {
    return { dbOwnerInfo: { ...this.dbOwnerInfo } };
  }
}

export default DataBox;

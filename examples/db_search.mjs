import { DataBox, ISDSBox } from '../dist/index.js';

const loginName = '';
const password = '';

async function searchDataBoxInfo() {
  const isdsBox = new ISDSBox().loginWithUsernameAndPassword(loginName, password, false);

  const dbOwnerInfo = new DataBox().setDbId('fud57s').setDbType('PO');
  return isdsBox.findDataBox(dbOwnerInfo);
}

const dataBox = await searchDataBoxInfo();
console.log(dataBox);

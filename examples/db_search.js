import ISDSBox from '../src/lib/ISDSBox.js';
import DataBox from '../src/models/DataBox.js';

// Replace these with actual values
const loginname = '';
const password = '';

async function searchDataBoxInfo() {
  const isdsBox = new ISDSBox().loginWithUsernameAndPassword(
    loginname,
    password,
    false,
  ); // Set to true for production environment

  const dbOwnerInfo = new DataBox().setDbId('fud57s').setDbType('PO');

  try {
    const dataBoxInfo = await isdsBox.findDataBox(dbOwnerInfo);
    return dataBoxInfo;
  } catch (error) {
    console.error('Error retrieving data box information:', error);
    throw Error('error');
  }
}

const dataBox = await searchDataBoxInfo();
console.log(dataBox);

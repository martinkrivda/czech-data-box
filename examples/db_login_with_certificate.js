import ISDSBox from '../src/lib/ISDSBox.js';
import DataBox from '../src/models/DataBox.js';
import fs from 'fs';

async function connectWithCertificate() {
  const pkcsContent = await fs.promises.readFile('./server_certificate.p12', {
    encoding: 'base64',
  });

  const isdsBox = new ISDSBox().loginWithPkcs12Certificate(
    pkcsContent,
    '',
    false,
  ); // Set to true for production environment

  const dbOwnerInfo = new DataBox().setDbId('fdsfa8').setDbType('PO');

  try {
    const dataBoxInfo = await isdsBox.findDataBox(dbOwnerInfo);
    console.log(dataBoxInfo);
  } catch (error) {
    console.error('Error retrieving data box information:', error);
    throw Error('error');
  }
}

connectWithCertificate();

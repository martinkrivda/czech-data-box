import { readFile } from 'node:fs/promises';

import { DataBox, ISDSBox } from '../dist/index.js';

async function connectWithCertificate() {
  const pkcsContent = await readFile('./server_certificate.p12', {
    encoding: 'base64',
  });

  const isdsBox = new ISDSBox().loginWithPkcs12Certificate(pkcsContent, '', false);

  const dbOwnerInfo = new DataBox().setDbId('fdsfa8').setDbType('PO');

  const dataBoxInfo = await isdsBox.findDataBox(dbOwnerInfo);
  console.log(dataBoxInfo);
}

void connectWithCertificate();

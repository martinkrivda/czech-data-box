import ISDSBox from './lib/ISDSBox.js';
import DataMessage from './models/DataMessage.js';

// Replace these with actual values
const loginname = '';
const password = '';

async function createDataMessage() {
  const isdsBox = new ISDSBox().loginWithUsernameAndPassword(
    loginname,
    password,
    false,
  ); // Set to true for production environment

  const dataMessageFiles = [
    {
      dmFilePath: './communication_test.pdf',
      dmMimeType: 'application/pdf',
      dmFileMetaType: 'main',
      dmFileDescr: 'file1.pdf',
    },
  ];

  const dataMessage = new DataMessage({
    dmSenderOrgUnit: null, // null
    dmSenderOrgUnitNum: null, // null
    dbIDRecipient: '', // ID datové schránky příjemce - povinný
    dmRecipientOrgUnit: null, // null
    dmRecipientOrgUnitNum: null, // null
    dmToHands: 'ISS Europe', // textové pole k rukám
    dmAnnotation: 'ISS Test komunikace (ignorovat)', // předmět datové zprávy - povinný
    dmRecipientRefNumber: null, //
    dmSenderRefNumber: null, // null
    dmRecipientIdent: '', // spisová značka vaše
    dmSenderIdent: '', // naše spisová značka
    dmLegalTitleLaw: '', // zmocnění číslo zákona
    dmLegalTitleYear: '', // zmocnění rok
    dmLegalTitleSect: 'f', // zmocnění paragraf
    dmLegalTitlePar: '', // zmocnění odstavec
    dmLegalTitlePoint: '', // zmocnění písmeno
    dmPersonalDelivery: true, // do vlastních rukou
    dmAllowSubstDelivery: true, // dmAllowSubstDelivery true
    dmOVM: true, // není v ZFO
    dmPublishOwnID: false, // není v ZFO
  });

  try {
    const response = await isdsBox.createMessage(dataMessage, dataMessageFiles);
    console.log('Created Message ID:', response.dmID);
    return response.dmID;
  } catch (error) {
    console.error('Error creating message:', error);
    throw new Error(error);
  }
}

const messageId = await createDataMessage();
console.log(messageId);

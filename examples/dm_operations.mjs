import { DataMessage, ISDSBox } from '../dist/index.js';

const loginName = '';
const password = '';

async function createDataMessage() {
  const isdsBox = new ISDSBox().loginWithUsernameAndPassword(loginName, password, false);

  const dataMessageFiles = [
    {
      dmFilePath: './communication_test.pdf',
      dmMimeType: 'application/pdf',
      dmFileMetaType: 'main',
      dmFileDescr: 'file1.pdf',
    },
  ];

  const dataMessage = new DataMessage({
    dmSenderOrgUnit: null,
    dmSenderOrgUnitNum: null,
    dbIDRecipient: '',
    dmRecipientOrgUnit: null,
    dmRecipientOrgUnitNum: null,
    dmToHands: 'ISS Europe',
    dmAnnotation: 'ISS Test komunikace (ignorovat)',
    dmRecipientRefNumber: null,
    dmSenderRefNumber: null,
    dmRecipientIdent: '',
    dmSenderIdent: '',
    dmLegalTitleLaw: '',
    dmLegalTitleYear: '',
    dmLegalTitleSect: 'f',
    dmLegalTitlePar: '',
    dmLegalTitlePoint: '',
    dmPersonalDelivery: true,
    dmAllowSubstDelivery: true,
    dmOVM: true,
    dmPublishOwnID: false,
  });

  const response = await isdsBox.createMessage(dataMessage, dataMessageFiles);
  console.log('Created Message ID:', response.dmID);
}

void createDataMessage();

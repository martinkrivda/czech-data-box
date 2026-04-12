import { ISDSBox } from '../dist/index.js';

const loginName = process.env.ISDS_LOGIN ?? '';
const password = process.env.ISDS_PASSWORD ?? '';

async function pollInbox() {
  const isdsBox = new ISDSBox().loginWithUsernameAndPassword(loginName, password, false);

  const batch = await isdsBox.pollReceivedMessages({
    dmFromTime: new Date(Date.now() - 15 * 60 * 1000),
    dmToTime: new Date(),
    dmLimit: 10,
    includeEnvelope: true,
    includeMessage: true,
  });

  for (const item of batch.items) {
    console.log(item.record.dmID, item.record.dmAnnotation);
  }
}

void pollInbox();

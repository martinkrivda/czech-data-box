import { expect } from 'chai';
import sinon from 'sinon';
import ISDSBox from '../src/lib/ISDSBox.js';
import ISDSSoapClient from '../src/lib/ISDSSoapClient.js';
import DataBox from '../src/models/DataBox.js';

describe('ISDSBox', function () {
  let sandbox;
  let soapClientMock;
  let isdsBox;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    soapClientMock = sandbox.stub(ISDSSoapClient.prototype, 'request');
    isdsBox = new ISDSBox(0, 'loginname', 'password', '', '', '');
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should create a message', async function () {
    const dataMessageFiles = [
      {
        dmFilePath: './test/communication_test.pdf',
        dmMimeType: 'application/pdf',
        dmFileMetaType: 'main',
        dmFileDescr: 'file1.pdf',
      },
    ];

    const params = {
      dmSenderOrgUnit: null,
      dmSenderOrgUnitNum: null,
      dbIDRecipient: 'fdjklz2',
      dmRecipientOrgUnit: null,
      dmRecipientOrgUnitNum: null,
      dmToHands: 'MK',
      dmAnnotation: 'MK Communication test (ignore)',
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
      dmOVM: false,
      dmPublishOwnID: false,
    };

    soapClientMock.withArgs('CreateMessage', sinon.match.any).resolves({
      dmID: 'messageID',
      dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
    });

    const result = await isdsBox.createMessage(params, dataMessageFiles);
    expect(result).to.have.property('dmID', 'messageID');
  });

  it('should find a data box based on the provided input', async function () {
    const dataBox = new DataBox();
    dataBox.setDbId('e26gfgu');
    dataBox.setDbType('FO');
    // Add other search criteria as needed

    const mockResponse = {
      // Mock response that matches the expected structure from the SOAP service
      dbStatus: { dbStatusCode: '0000', dbStatusMessage: 'OK' },
      dbResults: [{ dbID: 'e26gfgu', dbType: 'FO' }],
    };

    soapClientMock
      .withArgs('FindDataBox', sinon.match.any)
      .resolves(mockResponse);

    const result = await isdsBox.findDataBox(dataBox);
    expect(result).to.deep.equal(mockResponse);
  });

  it('should throw an error if the SOAP request fails', async function () {
    const dataBox = new DataBox();
    dataBox.setDbId('e26gfgu');
    dataBox.setDbType('FO');
    // Add other search criteria as needed

    const mockError = new Error('SOAP request failed');
    soapClientMock.withArgs('FindDataBox', sinon.match.any).rejects(mockError);

    try {
      await isdsBox.findDataBox(dataBox);
      throw new Error('Expected findDataBox to throw an error');
    } catch (error) {
      expect(error.message).to.equal('Error: SOAP request failed');
    }
  });

  it('should get owner info from login', async function () {
    const mockResponse = {
      dbStatus: { dbStatusCode: '0000', dbStatusMessage: 'OK' },
      ownerInfo: { ownerId: 'owner123', ownerName: 'Owner Name' },
    };

    soapClientMock
      .withArgs('GetOwnerInfoFromLogin', { dbDummy: '' })
      .resolves(mockResponse);

    const result = await isdsBox.getOwnerInfoFromLogin();
    expect(result).to.deep.equal(mockResponse);
  });

  it('should throw an error if the SOAP request fails', async function () {
    const mockError = new Error('SOAP request failed');
    soapClientMock
      .withArgs('GetOwnerInfoFromLogin', { dbDummy: '' })
      .rejects(mockError);

    try {
      await isdsBox.getOwnerInfoFromLogin();
      throw new Error('Expected getOwnerInfoFromLogin to throw an error');
    } catch (error) {
      expect(error.message).to.equal('Error: SOAP request failed');
    }
  });
  // Add more test cases for other methods
});

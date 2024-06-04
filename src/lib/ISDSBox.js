import forge from 'node-forge';

import ISDSSentOutFiles from './ISDSSentOutFiles.js';
import ISDSSoapClient from './ISDSSoapClient.js';
import DataMessage from '../models/DataMessage.js';
import { getServiceWSDL, getServiceURL } from './config.js';

import { DEBUG } from './config.js';

class ISDSBox {
  constructor(
    loginType,
    loginname,
    password,
    certfilename,
    privateKey,
    publicKey,
    passPhrase,
    pkcs12Certificate,
    production = true,
    debug = DEBUG,
  ) {
    this.productionMode = production;
    this.loginType = loginType;
    this.loginName = loginname;
    this.password = password;
    this.certfilename = certfilename;
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.passPhrase = passPhrase;
    this.pkcs12Certificate = pkcs12Certificate;
    this.debug = debug;

    this.initClients();
  }

  setProductionMode() {
    this.productionMode = true;
    this.initClients();
    return this;
  }

  setTestMode() {
    this.productionMode = false;
    this.initClients();
    return this;
  }

  setDebugMode() {
    this.debug = true;
    this.initClients();
    return this;
  }

  setPublicKey(cert) {
    this.publicKey = cert;
    return this;
  }

  setPrivateKey(pkey) {
    this.privateKey = pkey;
    return this;
  }

  setPassPhrase(passPhrase) {
    this.passPhrase = passPhrase;
    return this;
  }

  setPkcs12Certificate(pkcs12Certificate, passPhrase) {
    const p12Der = forge.util.decode64(pkcs12Certificate);
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, passPhrase);

    let cert;
    let key;

    // Extract the key and certificate
    for (const safeContents of p12.safeContents) {
      for (const safeBag of safeContents.safeBags) {
        if (safeBag.type === forge.pki.oids.certBag) {
          cert = forge.pki.certificateToPem(safeBag.cert);
        } else if (safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {
          key = forge.pki.privateKeyToPem(safeBag.key);
        }
      }
    }

    if (!cert || !key) {
      throw new Error('Invalid PKCS12');
    }

    this.setPublicKey(cert).setPrivateKey(key).setPassPhrase(passPhrase);

    return this;
  }

  loginWithUsernameAndPassword(loginName, password, productionMode = true) {
    this.productionMode = productionMode;
    this.loginType = 0;
    this.loginName = loginName;
    this.password = password;
    this.initClients();
    return this;
  }

  loginWithPkcs12Certificate(certFile, passPhrase, productionMode = true) {
    this.productionMode = productionMode;
    this.loginType = 1;
    this.setPkcs12Certificate(certFile, passPhrase);
    this.initClients();
    return this;
  }

  initClients() {
    if (this.debug === true) {
      console.log('Service URLs:');
      console.log(
        'Operations Service URL:',
        getServiceURL(0, this.loginType, this.productionMode),
      );
      console.log(
        'Info Service URL:',
        getServiceURL(1, this.loginType, this.productionMode),
      );
      console.log(
        'Manipulations Service URL:',
        getServiceURL(2, this.loginType, this.productionMode),
      );
      console.log(
        'Access Service URL:',
        getServiceURL(3, this.loginType, this.productionMode),
      );
      console.log(
        'Search Service URL:',
        getServiceURL(4, this.loginType, this.productionMode),
      );
    }

    this.operationsWS = new ISDSSoapClient(getServiceWSDL(0), {
      login: this.loginName,
      password: this.password,
      location: getServiceURL(0, this.loginType, this.productionMode),
      loginType: this.loginType,
      privateKey: this.privateKey,
      publicKey: this.publicKey,
      passPhrase: this.passPhrase,
      debug: this.debug,
    });
    this.infoWS = new ISDSSoapClient(getServiceWSDL(1), {
      login: this.loginName,
      password: this.password,
      location: getServiceURL(1, this.loginType, this.productionMode),
      loginType: this.loginType,
      privateKey: this.privateKey,
      publicKey: this.publicKey,
      passPhrase: this.passPhrase,
      debug: this.debug,
    });
    this.manipulationsWS = new ISDSSoapClient(getServiceWSDL(2), {
      login: this.loginName,
      password: this.password,
      location: getServiceURL(2, this.loginType, this.productionMode),
      loginType: this.loginType,
      privateKey: this.privateKey,
      publicKey: this.publicKey,
      passPhrase: this.passPhrase,
      debug: this.debug,
    });
    this.accessWS = new ISDSSoapClient(getServiceWSDL(3), {
      login: this.loginName,
      password: this.password,
      location: getServiceURL(3, this.loginType, this.productionMode),
      loginType: this.loginType,
      privateKey: this.privateKey,
      publicKey: this.publicKey,
      passPhrase: this.passPhrase,
      debug: this.debug,
    });
    this.searchWS = new ISDSSoapClient(getServiceWSDL(4), {
      login: this.loginName,
      password: this.password,
      location: getServiceURL(4, this.loginType, this.productionMode),
      loginType: this.loginType,
      privateKey: this.privateKey,
      publicKey: this.publicKey,
      passPhrase: this.passPhrase,
      debug: this.debug,
    });
  }

  async createMessage(dataMessageParams, outFilesParams) {
    console.log('Call CreateMessage');

    // Validate the dataMessageParams
    const requiredFields = ['dbIDRecipient', 'dmAnnotation'];
    for (const field of requiredFields) {
      if (!dataMessageParams[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Create the DataMessage envelope
    const envelope = new DataMessage(dataMessageParams);

    // Initialize the files array and add the files
    const files = new ISDSSentOutFiles();
    for (const file of outFilesParams) {
      if (file.dmFilePath) {
        const success = await files.addFileFromFilePath(
          file.dmFilePath,
          file.dmMimeType,
          file.dmFileMetaType,
          file.dmFileDescr,
        );
        if (!success) {
          throw new Error(`Failed to add file from path: ${file.dmFilePath}`);
        }
      } else if (file.dmEncodedContent) {
        await files.addFileFromMemory(
          file.dmEncodedContent,
          file.dmMimeType,
          file.dmFileMetaType,
          file.dmFileDescr,
        );
      } else {
        throw new Error('File must have either path or base64Content');
      }
    }

    // Prepare the message creation input
    const input = {
      dmEnvelope: envelope.build(),
      dmFiles: files.build(), // Ensure dmFiles is correctly structured as an array
    };

    if (this.debug === true) {
      console.log('Final SOAP Request Body:', JSON.stringify(input, null, 2));
    }
    try {
      const result = await this.operationsWS.request('CreateMessage', input);
      if (this.debug === true) {
        console.log('Raw Result:', result);
      }

      return result;
    } catch (error) {
      console.error('Error in createMessage:', error.message);
      throw new Error(error);
    }
  }

  /**
   * Finds a data box based on the provided input.
   * @param {DataBox} dataBox - The DataBox instance with the search criteria.
   * @returns {Promise<Object>} The search results.
   * @throws {Error} If there is an error in the SOAP request.
   */
  async findDataBox(dbOwnerInfo) {
    console.log('Call FindDataBox');
    const findInput = dbOwnerInfo.build();
    try {
      const result = await this.searchWS.request('FindDataBox', findInput);
      if (this.debug === true) {
        console.log('Raw Result:', result);
      }

      return result;
    } catch (error) {
      console.error('Error in findDataBox:', error.message);
      throw new Error(error);
    }
  }

  async getOwnerInfoFromLogin() {
    console.log('Call GetOwnerInfoFromLogin');
    const input = { dbDummy: '' };
    try {
      const result = await this.accessWS.request(
        'GetOwnerInfoFromLogin',
        input,
      );
      if (this.debug === true) {
        console.log('Raw Result:', result);
      }
      return result;
    } catch (error) {
      console.error('Error in getOwnerInfoFromLogin:', error.message);
      throw new Error(error);
    }
  }
  async getPasswordInfo() {
    console.log('Call GetPasswordInfo');
    const input = { dbDummy: '' };
    try {
      const result = await this.accessWS.request('GetPasswordInfo', input);
      if (this.debug === true) {
        console.log('Raw Result:', result);
      }

      return result;
    } catch (error) {
      console.error('Error in getPasswordInfo:', error.message);
      throw new Error(error);
    }
  }
}

export default ISDSBox;

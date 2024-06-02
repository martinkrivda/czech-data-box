import fs from 'fs';
import soap from 'soap';
import { DEBUG } from './config.js';

// Ensure Buffer is available globally (mostly needed in non-Node.js environments)
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

class ISDSSoapClient {
  constructor(wsdl, options, debug = DEBUG) {
    this.client = null;
    this.wsdl = wsdl;
    this.options = options;
    this.debug = debug;
  }

  async init() {
    try {
      console.log(`Initializing SOAP client with WSDL: ${this.wsdl}`);

      this.client = await soap.createClientAsync(this.wsdl, this.options);

      // Override the endpoint URL with the one specified in the options
      this.client.setEndpoint(this.options.location);

      // Add common HTTP headers to each request
      this.client.addHttpHeader('Method', 'POST');
      this.client.addHttpHeader('Connection', 'Keep-Alive');
      this.client.addHttpHeader('User-Agent', 'Node-SOAP-Client');
      this.client.addHttpHeader('Content-Type', 'text/xml; charset=utf-8');
      // Add Authorization header to each request
      if (this.options.loginType === 0) {
        this.client.setSecurity(
          new soap.BasicAuthSecurity(this.options.login, this.options.password),
        );
      } else if (this.options.loginType === 1) {
        const options = {};
        const wsSecurity = new soap.WSSecurityCert(
          this.options.privateKey,
          this.options.publicKey,
          this.options.passPhrase,
          options,
        );
        this.client.setSecurity(wsSecurity);
      } else {
        this.client.addHttpHeader(
          'Authorization',
          `Basic ${Buffer.from(`${this.options.login}:${this.options.password}`).toString('base64')}`,
        );
      }

      // Enable debug logging if necessary
      if (this.debug === true) {
        this.client.on('request', (xml) => {
          console.log('Request:', xml);
          fs.writeFile('soap-request-debug.xml', xml, (err) => {
            if (err) {
              console.error('Chyba při zápisu XML do souboru:', err);
            } else {
              console.log(
                'XML požadavek byl úspěšně zapsán do souboru request.xml',
              );
            }
          });
        });
        this.client.on('response', (xml, response) => {
          console.log('Response:', response);
        });
      }
    } catch (error) {
      console.error('Error initializing SOAP client:', error);
      throw error;
    }
  }

  async request(method, args) {
    if (!this.client) {
      await this.init();
    }

    console.log(
      `Making SOAP request to method: ${method} with args: ${JSON.stringify(args)}`,
    );
    try {
      const result = await this.client[`${method}Async`](args);
      if (this.debug === true) {
        console.log(`SOAP Response for method ${method}:`, result);
      }
      return result;
    } catch (error) {
      console.error(`Error in SOAP request for method ${method}:`, error);
      if (error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
        console.error('Error Response Headers:', error.response.headers);
      }
      throw error;
    }
  }
}

export default ISDSSoapClient;

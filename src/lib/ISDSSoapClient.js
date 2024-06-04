import { constants } from 'crypto'; // Use the crypto module for constants
import fs from 'fs';
import soap from 'soap';
import http from 'http';
import https from 'https';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

import { DEBUG } from './config.js';

// Ensure Buffer is available globally (mostly needed in non-Node.js environments)
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Define the dirname constant
const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

class ISDSSoapClient {
  constructor(wsdl, options, debug = DEBUG) {
    this.client = null;
    this.wsdl = wsdl;
    this.options = options;
    this.debug = debug;
  }

  async init() {
    try {
      // Default wsdl_options
      let wsdl_options = {
        rejectUnauthorized: false,
        secureOptions:
          constants.SSL_OP_NO_SSLv3 |
          constants.SSL_OP_NO_TLSv1 |
          constants.SSL_OP_NO_TLSv1_1 |
          constants.SSL_OP_NO_COMPRESSION,
        ciphers: 'HIGH:!aNULL:!MD5:!3DES', // Only use strong ciphers
      };

      // Conditionally set SSL version for non-Windows systems
      if (os.platform() !== 'win32') {
        wsdl_options.secureProtocol = 'TLSv1_3_method'; // Example: force TLSv1.2
      }

      // Conditionally add client certificate, private key, and CA if loginType is 1
      if (this.options.loginType === 1) {
        (wsdl_options.cert = this.options.publicKey),
          (wsdl_options.key = this.options.privateKey),
          (wsdl_options.ca = fs.readFileSync(
            path.join(
              dirname,
              '..',
              '..',
              'resources',
              'certs',
              'cacert_postsignum_vca4.pem',
            ),
          ));
      }

      const clientOptions = {
        ...this.options,
        wsdl_options,
        httpClient: {
          request: (rurl, data, callback, exheaders) => {
            const headers = exheaders || {};
            headers['Content-Length'] = Buffer.byteLength(data, 'utf8');

            const options = {
              method: 'POST',
              headers: headers,
              rejectUnauthorized: wsdl_options.rejectUnauthorized,
              followAllRedirects: true, // Equivalent to CURLOPT_FOLLOWLOCATION
              timeout: 30000, // Set a timeout as needed
              agentOptions: {
                secureOptions: wsdl_options.secureOptions,
                secureProtocol: wsdl_options.secureProtocol,
                ciphers: wsdl_options.ciphers,
              },
            };

            // Conditionally add client certificate, private key, and CA if loginType is 1
            if (this.options.loginType === 1) {
              options.cert = wsdl_options.cert;
              options.key = wsdl_options.key;
              options.ca = wsdl_options.ca;
            }

            const protocol = /^https/.test(rurl) ? https : http;

            const req = protocol.request(rurl, options, (res) => {
              let body = '';
              res.setEncoding('utf8');
              res.on('data', (chunk) => {
                body += chunk;
              });
              res.on('end', () => {
                callback(null, res, body);
              });
            });

            req.on('error', (err) => {
              console.error('Request error:', err); // Improved logging
              callback(err);
            });

            req.write(data);
            req.end();
          },
        },
      };

      if (this.debug) {
        console.log(`Initializing SOAP client with WSDL: ${this.wsdl}`);
      }

      this.client = await soap.createClientAsync(this.wsdl, clientOptions);

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
        const wsSecurity = new soap.WSSecurityCert(
          this.options.privateKey,
          this.options.publicKey,
          this.options.passPhrase,
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
              console.error('Error writing XML to file:', err);
            } else {
              console.log(
                'XML request successfully written to file request.xml',
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

    if (this.debug) {
      console.log(
        `Making SOAP request to method: ${method} with args: ${JSON.stringify(args)}`,
      );
    }
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

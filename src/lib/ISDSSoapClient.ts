import { constants } from 'node:crypto';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as soap from 'soap';

import type {
  ServiceConnectionMode,
  SoapRequestArguments,
  SoapVersion,
} from '../types.js';

import { DEBUG } from './config.js';

type SoapMethodName = `${string}Async`;

type AsyncSoapClient = soap.Client &
  Record<SoapMethodName, (args: SoapRequestArguments) => Promise<unknown>>;

type SoapHttpRequestResult = Awaited<ReturnType<soap.IHttpClient['request']>>;

interface SoapWsdlOptions {
  rejectUnauthorized: boolean;
  secureOptions: number;
  ciphers: string;
  secureProtocol?: string;
  cert?: string;
  key?: string;
  ca?: Buffer;
}

interface SoapClientOptions {
  login?: string;
  password?: string;
  location: string;
  connectionMode: ServiceConnectionMode;
  soapVersion: SoapVersion;
  privateKey?: string;
  publicKey?: string;
  passPhrase?: string;
  debug?: boolean;
}

type SoapHttpCallback = (
  error: Error | null,
  response?: http.IncomingMessage,
  body?: string,
) => void;

const certificateAuthorityPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'resources',
  'certs',
  'cacert_postsignum_vca4.pem',
);

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function usesClientCertificate(connectionMode: ServiceConnectionMode): boolean {
  return connectionMode !== 'basic';
}

function usesBasicAuth(connectionMode: ServiceConnectionMode): boolean {
  return (
    connectionMode === 'basic' ||
    connectionMode === 'certds' ||
    connectionMode === 'hspis'
  );
}

class ISDSSoapClient {
  private client: AsyncSoapClient | null = null;

  constructor(
    private readonly wsdl: string,
    private readonly options: SoapClientOptions,
    private readonly debug: boolean = options.debug ?? DEBUG,
  ) {}

  private logDebug(message: string, ...payload: unknown[]): void {
    if (this.debug) {
      console.log(message, ...payload);
    }
  }

  private requestWithNodeTransport(
    requestUrl: string,
    data: string,
    callback: SoapHttpCallback,
    extraHeaders?: soap.IHeaders,
    extraOptions?: soap.IExOptions,
    caller?: unknown,
  ): ReturnType<soap.IHttpClient['request']> {
    void extraOptions;
    void caller;

    const headers: http.OutgoingHttpHeaders = {
      ...extraHeaders,
      'Content-Length': Buffer.byteLength(data, 'utf8'),
    };

    const options: https.RequestOptions = {
      method: 'POST',
      headers,
      rejectUnauthorized: false,
      timeout: 30_000,
    };

    if (usesClientCertificate(this.options.connectionMode)) {
      if (!this.options.publicKey || !this.options.privateKey) {
        throw new Error('Certificate login requires both publicKey and privateKey');
      }

      options.cert = this.options.publicKey;
      options.key = this.options.privateKey;
      options.ca = fs.readFileSync(certificateAuthorityPath);
      options.secureOptions =
        constants.SSL_OP_NO_SSLv3 |
        constants.SSL_OP_NO_TLSv1 |
        constants.SSL_OP_NO_TLSv1_1 |
        constants.SSL_OP_NO_COMPRESSION;
      options.ciphers = 'HIGH:!aNULL:!MD5:!3DES';

      if (os.platform() !== 'win32') {
        options.secureProtocol = 'TLSv1_3_method';
      }
    }

    const protocol = requestUrl.startsWith('https://') ? https : http;

    return new Promise((resolve, reject) => {
      const request = protocol.request(requestUrl, options, (response) => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk: string) => {
          body += chunk;
        });
        response.on('end', () => {
          callback(null, response, body);
          resolve({
            config: {
              headers: {},
            } as SoapHttpRequestResult['config'],
            data: body,
            headers: response.headers as unknown as SoapHttpRequestResult['headers'],
            request,
            status: response.statusCode ?? 200,
            statusText: response.statusMessage ?? '',
          } as SoapHttpRequestResult);
        });
      });

      request.on('error', (error) => {
        const normalizedError = toError(error);
        callback(normalizedError);
        reject(normalizedError);
      });

      request.write(data);
      request.end();
    }) as ReturnType<soap.IHttpClient['request']>;
  }

  async init(): Promise<void> {
    const wsdlOptions: SoapWsdlOptions = {
      rejectUnauthorized: false,
      secureOptions:
        constants.SSL_OP_NO_SSLv3 |
        constants.SSL_OP_NO_TLSv1 |
        constants.SSL_OP_NO_TLSv1_1 |
        constants.SSL_OP_NO_COMPRESSION,
      ciphers: 'HIGH:!aNULL:!MD5:!3DES',
    };

    if (os.platform() !== 'win32') {
      wsdlOptions.secureProtocol = 'TLSv1_3_method';
    }

    if (usesClientCertificate(this.options.connectionMode)) {
      if (!this.options.publicKey || !this.options.privateKey) {
        throw new Error('Certificate login requires both publicKey and privateKey');
      }

      wsdlOptions.cert = this.options.publicKey;
      wsdlOptions.key = this.options.privateKey;
      wsdlOptions.ca = fs.readFileSync(certificateAuthorityPath);
    }

    const clientOptions: soap.IOptions = {
      forceSoap12Headers: this.options.soapVersion === '1.2',
      wsdl_options: wsdlOptions,
      httpClient: {
        request: (
          requestUrl: string,
          data: string,
          callback: SoapHttpCallback,
          extraHeaders?: soap.IHeaders,
          extraOptions?: soap.IExOptions,
          caller?: unknown,
        ) =>
          this.requestWithNodeTransport(
            requestUrl,
            data,
            callback,
            extraHeaders,
            extraOptions,
            caller,
          ),
      },
    };

    this.logDebug(`Initializing SOAP client with WSDL: ${this.wsdl}`);

    const client = (await soap.createClientAsync(
      this.wsdl,
      clientOptions,
    )) as AsyncSoapClient;

    client.setEndpoint(this.options.location);
    client.addHttpHeader('Method', 'POST');
    client.addHttpHeader('Connection', 'Keep-Alive');
    client.addHttpHeader('User-Agent', 'Node-SOAP-Client');

    if (usesBasicAuth(this.options.connectionMode)) {
      client.setSecurity(
        new soap.BasicAuthSecurity(this.options.login ?? '', this.options.password ?? ''),
      );
    } else if (this.options.connectionMode === 'cert') {
      client.setSecurity(
        new soap.WSSecurityCert(
          this.options.privateKey ?? '',
          this.options.publicKey ?? '',
          this.options.passPhrase ?? '',
        ),
      );
    }

    if (this.debug) {
      client.on('request', (xml: string) => {
        this.logDebug('SOAP request:', xml);
        void fs.promises
          .writeFile('soap-request-debug.xml', xml)
          .catch((error: unknown) => {
            console.error('Error writing XML to file:', toError(error).message);
          });
      });

      client.on('response', (_xml: string, response: unknown) => {
        this.logDebug('SOAP response metadata:', response);
      });
    }

    this.client = client;
  }

  async request<TResponse>(
    method: string,
    args: SoapRequestArguments,
  ): Promise<TResponse> {
    if (!this.client) {
      await this.init();
    }

    if (!this.client) {
      throw new Error('SOAP client failed to initialize');
    }

    const soapMethodName: SoapMethodName = `${method}Async`;
    const soapMethod = this.client[soapMethodName];

    if (typeof soapMethod !== 'function') {
      throw new Error(`SOAP method "${soapMethodName}" is not available`);
    }

    this.logDebug(
      `Making SOAP request to method ${method} with args:`,
      JSON.stringify(args),
    );

    try {
      const result = (await soapMethod.call(this.client, args)) as TResponse;
      this.logDebug(`SOAP response for method ${method}:`, result);
      return result;
    } catch (error: unknown) {
      const normalizedError = toError(error);
      console.error(
        `Error in SOAP request for method ${method}:`,
        normalizedError.message,
      );
      throw normalizedError;
    }
  }
}

export default ISDSSoapClient;

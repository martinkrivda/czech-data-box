import * as soap from 'soap';

import { afterEach, describe, expect, it, vi } from 'vitest';

import ISDSSoapClient from '../src/lib/ISDSSoapClient.js';

describe('ISDSSoapClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes and makes a request', async () => {
    const soapClientInstance = {
      CreateMessageAsync: vi.fn().mockResolvedValue([
        {
          dmID: 'messageID',
          dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
        },
      ]),
      addHttpHeader: vi.fn(),
      on: vi.fn(),
      setEndpoint: vi.fn(),
      setSecurity: vi.fn(),
    };

    const createClientAsyncSpy = vi
      .spyOn(soap, 'createClientAsync')
      .mockResolvedValue(soapClientInstance as unknown as soap.Client);

    const soapClient = new ISDSSoapClient(
      'wsdl_url',
      {
        connectionMode: 'basic',
        location: 'test_location',
        login: 'test',
        password: 'test',
        soapVersion: '1.1',
      },
      false,
    );

    await soapClient.init();
    const result = await soapClient.request('CreateMessage', {});

    expect(result).toEqual([
      {
        dmID: 'messageID',
        dmStatus: { dmStatusCode: '0000', dmStatusMessage: 'OK' },
      },
    ]);
    expect(createClientAsyncSpy).toHaveBeenCalledTimes(1);
    expect(soapClientInstance.CreateMessageAsync).toHaveBeenCalledWith({});
    expect(soapClientInstance.addHttpHeader).not.toHaveBeenCalledWith(
      'Content-Type',
      expect.anything(),
    );
  });

  it('does not reinitialize the client once it already exists', async () => {
    const soapClientInstance = {
      CreateMessageAsync: vi.fn().mockResolvedValue([{ ok: true }]),
      addHttpHeader: vi.fn(),
      on: vi.fn(),
      setEndpoint: vi.fn(),
      setSecurity: vi.fn(),
    };

    const createClientAsyncSpy = vi
      .spyOn(soap, 'createClientAsync')
      .mockResolvedValue(soapClientInstance as unknown as soap.Client);

    const soapClient = new ISDSSoapClient(
      'wsdl_url',
      {
        connectionMode: 'basic',
        location: 'test_location',
        login: 'test',
        password: 'test',
        soapVersion: '1.1',
      },
      false,
    );

    await soapClient.init();
    await soapClient.request('CreateMessage', {});
    await soapClient.request('CreateMessage', {});

    expect(createClientAsyncSpy).toHaveBeenCalledTimes(1);
    expect(soapClientInstance.CreateMessageAsync).toHaveBeenCalledTimes(2);
  });

  it('throws when SOAP client initialization fails', async () => {
    vi.spyOn(soap, 'createClientAsync').mockRejectedValue(
      new Error('SOAP client initialization failed'),
    );

    const soapClient = new ISDSSoapClient(
      'wsdl_url',
      {
        connectionMode: 'basic',
        location: 'test_location',
        login: 'test',
        password: 'test',
        soapVersion: '1.1',
      },
      false,
    );

    await expect(soapClient.init()).rejects.toThrow('SOAP client initialization failed');
  });

  it('forces SOAP 1.2 headers for ws2 services', async () => {
    const soapClientInstance = {
      ArchiveISDSDocumentAsync: vi.fn().mockResolvedValue([{ ok: true }]),
      addHttpHeader: vi.fn(),
      on: vi.fn(),
      setEndpoint: vi.fn(),
      setSecurity: vi.fn(),
    };

    const createClientAsyncSpy = vi
      .spyOn(soap, 'createClientAsync')
      .mockResolvedValue(soapClientInstance as unknown as soap.Client);

    const soapClient = new ISDSSoapClient(
      'wsdl_url',
      {
        connectionMode: 'basic',
        location: 'test_location',
        login: 'test',
        password: 'test',
        soapVersion: '1.2',
      },
      false,
    );

    await soapClient.init();

    expect(createClientAsyncSpy).toHaveBeenCalledWith(
      'wsdl_url',
      expect.objectContaining({
        forceSoap12Headers: true,
      }),
    );
  });
});

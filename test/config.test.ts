import { describe, expect, it } from 'vitest';

import {
  getConnectionModeFromLegacyLoginType,
  getServiceSoapVersion,
  getServiceURL,
} from '../src/lib/config.js';

describe('config', () => {
  it('maps legacy login types to connection modes', () => {
    expect(getConnectionModeFromLegacyLoginType(0)).toBe('basic');
    expect(getConnectionModeFromLegacyLoginType(1)).toBe('cert');
    expect(getConnectionModeFromLegacyLoginType(99)).toBe('basic');
  });

  it('builds service URLs for all supported connection modes', () => {
    expect(getServiceURL(0, 'basic', true)).toBe(
      'https://ws1.mojedatovaschranka.cz/DS/dz',
    );
    expect(getServiceURL(1, 'cert', false)).toBe('https://ws1c.czebox.cz/cert/DS/dx');
    expect(getServiceURL(4, 'certds', true)).toBe(
      'https://ws1c.mojedatovaschranka.cz/certds/DS/df',
    );
    expect(getServiceURL(3, 'hspis', false)).toBe(
      'https://ws1c.czebox.cz/hspis/DS/DsManage',
    );
    expect(getServiceURL(5, 'basic', true)).toBe(
      'https://ws2.mojedatovaschranka.cz/DS/arch',
    );
    expect(getServiceURL(6, 'certds', false)).toBe(
      'https://ws2c.czebox.cz/certds/DS/vodz',
    );
  });

  it('maps ws1 and ws2 services to the correct SOAP version', () => {
    expect(getServiceSoapVersion(0)).toBe('1.1');
    expect(getServiceSoapVersion(1)).toBe('1.1');
    expect(getServiceSoapVersion(5)).toBe('1.2');
    expect(getServiceSoapVersion(6)).toBe('1.2');
  });
});

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ServiceConnectionMode, ServiceType, SoapVersion } from '../types.js';

export const DEBUG = false;

const wsdlDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'resources',
  'wsdl',
);

export function getConnectionModeFromLegacyLoginType(
  loginType: number,
): ServiceConnectionMode {
  if (loginType === 1) {
    return 'cert';
  }

  return 'basic';
}

function getWs1BaseURL(
  connectionMode: ServiceConnectionMode,
  productionMode: boolean,
): string {
  let baseURL = connectionMode === 'basic' ? 'https://ws1' : 'https://ws1c';

  baseURL += productionMode ? '.mojedatovaschranka.cz/' : '.czebox.cz/';

  switch (connectionMode) {
    case 'basic':
      break;
    case 'cert':
      baseURL += 'cert/';
      break;
    case 'certds':
      baseURL += 'certds/';
      break;
    case 'hspis':
      baseURL += 'hspis/';
      break;
    default:
      throw new Error(`Invalid connection mode: ${String(connectionMode)}`);
  }

  return `${baseURL}DS/`;
}

function getWs2BaseURL(
  connectionMode: ServiceConnectionMode,
  productionMode: boolean,
): string {
  let baseURL = connectionMode === 'basic' ? 'https://ws2' : 'https://ws2c';

  baseURL += productionMode ? '.mojedatovaschranka.cz/' : '.czebox.cz/';

  switch (connectionMode) {
    case 'basic':
      break;
    case 'cert':
      baseURL += 'cert/';
      break;
    case 'certds':
      baseURL += 'certds/';
      break;
    case 'hspis':
      baseURL += 'hspis/';
      break;
    default:
      throw new Error(`Invalid connection mode: ${String(connectionMode)}`);
  }

  return `${baseURL}DS/`;
}

export function getServiceURL(
  serviceType: ServiceType,
  connectionMode: ServiceConnectionMode,
  productionMode: boolean,
): string {
  if (serviceType === 5 || serviceType === 6) {
    const ws2BaseURL = getWs2BaseURL(connectionMode, productionMode);

    return serviceType === 5 ? `${ws2BaseURL}arch` : `${ws2BaseURL}vodz`;
  }

  const ws1BaseURL = getWs1BaseURL(connectionMode, productionMode);

  switch (serviceType) {
    case 0:
      return `${ws1BaseURL}dz`;
    case 1:
      return `${ws1BaseURL}dx`;
    case 2:
    case 3:
      return `${ws1BaseURL}DsManage`;
    case 4:
      return `${ws1BaseURL}df`;
    default:
      throw new Error(`Invalid service type: ${String(serviceType)}`);
  }
}

export function getServiceWSDL(serviceType: ServiceType): string {
  switch (serviceType) {
    case 0:
      return path.join(wsdlDirectory, 'dm_operations.wsdl');
    case 1:
      return path.join(wsdlDirectory, 'dm_info.wsdl');
    case 2:
      return path.join(wsdlDirectory, 'db_manipulations.wsdl');
    case 3:
      return path.join(wsdlDirectory, 'db_access.wsdl');
    case 4:
      return path.join(wsdlDirectory, 'db_search.wsdl');
    case 5:
      return path.join(wsdlDirectory, 'dm_arch.wsdl');
    case 6:
      return path.join(wsdlDirectory, 'dm_VoDZ.wsdl');
    default:
      throw new Error(`Invalid service type: ${String(serviceType)}`);
  }
}

export function getServiceSoapVersion(serviceType: ServiceType): SoapVersion {
  return serviceType === 5 || serviceType === 6 ? '1.2' : '1.1';
}

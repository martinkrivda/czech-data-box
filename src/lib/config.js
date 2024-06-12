// config.js
import os from 'os';
import path from 'path';

export const DEBUG = false; // Set to true to enable debug mode globally

function getServiceURL(serviceType, loginType, productionMode) {
  let baseURL = 'https://ws1';
  if (loginType !== 0) {
    baseURL += 'c';
  }

  if (productionMode === false) {
    baseURL += '.czebox.cz/';
  } else if (productionMode === true) {
    baseURL += '.mojedatovaschranka.cz/';
  }

  if (loginType === 1) {
    baseURL += 'cert/';
  }

  baseURL += 'DS/';

  switch (serviceType) {
    case 0:
      return `${baseURL}dz`;
    case 1:
      return `${baseURL}dx`;
    case 2:
      return `${baseURL}DsManage`;
    case 3:
      return `${baseURL}DsManage`;
    case 4:
      return `${baseURL}df`;
    default:
      throw new Error('Invalid service type');
  }
}

function getServiceWSDL(serviceType) {
  let directory = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    '..',
    '..',
    'resources',
    'wsdl',
  );

  // Adjust the path for Windows
  if (os.platform() === 'win32') {
    directory = directory.slice(1);
  }

  switch (serviceType) {
    case 0:
      return path.join(directory, 'dm_operations.wsdl');
    case 1:
      return path.join(directory, 'dm_info.wsdl');
    case 2:
      return path.join(directory, 'db_manipulations.wsdl');
    case 3:
      return path.join(directory, 'db_access.wsdl');
    case 4:
      return path.join(directory, 'db_search.wsdl');
    default:
      throw new Error('Invalid service type');
  }
}

export { getServiceURL, getServiceWSDL };

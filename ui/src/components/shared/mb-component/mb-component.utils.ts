/**
 * Copyright (c) Microblink Ltd. All rights reserved.
 */

import * as PhotoPaySDK from '../../../../../es/photopay-sdk';

function getSDKWasmType(wasmType: string): PhotoPaySDK.WasmType | null {
  switch (wasmType) {
    case 'BASIC':
      return PhotoPaySDK.WasmType.Basic;
    case 'ADVANCED':
      return PhotoPaySDK.WasmType.Advanced;
    case 'ADVANCED_WITH_THREADS':
      return PhotoPaySDK.WasmType.AdvancedWithThreads;
    default:
      return null;
  }
}

export { getSDKWasmType }

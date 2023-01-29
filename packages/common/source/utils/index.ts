export function delay(t: any, v?: any) {
    return new Promise(resolve => setTimeout(resolve, t, v));
}

export * from './mdnsDeviceUtils';
export * from './networkUtils';
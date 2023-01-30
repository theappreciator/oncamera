export function delay<T>(time: number, val?: T) {
    return new Promise(resolve => setTimeout(resolve, time, val));
}

export * from './mdnsDeviceUtils';
export * from './networkUtils';
export function delay(t: any, v?: any) {
    return new Promise(resolve => setTimeout(resolve, t, v));
}

export * from './lightUtils';
export * from './networkUtils';
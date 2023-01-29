import os from 'os';

const getIpAddress = () => {
    const networks = os.networkInterfaces();
    for (let key in networks) {
        const network = networks[key];
        const networkFiltered = network?.filter(
            n => n.internal === false &&
            (n.family === "IPv4" || (n.family as unknown as number) === 4 || (n.family as unknown as string) === '4')
            && n.mac !== '00:00:00:00:00:00'
        )
        if (networkFiltered && networkFiltered?.length > 0) {
            return networkFiltered[0].address;
        }
    }

    throw new Error("No IP address found");
}

const getLocalHostnameDotLocal = () => {
    return os.hostname() + ".local"
}

const getLocalHostnameDotLocalNormalized = () => {
    return os.hostname().replace(' ', '-').toLowerCase() + ".local";
}

const isLocalRequest = (ip: string) => {
    if (getIpAddress() === ip) {
        return true;
    }

    return false;
}

const getNetworkAddress = (ip: string, port: number) => {
    let returnIp = ip;

    if (isLocalRequest(ip)) {
       returnIp = "127.0.0.1";
    }

    return {
        ip: returnIp,
        port: port
    }
}

export {
    getIpAddress,
    getLocalHostnameDotLocal,
    getLocalHostnameDotLocalNormalized,
    getNetworkAddress
}
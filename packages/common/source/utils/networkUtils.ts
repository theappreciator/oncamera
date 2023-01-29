import os from 'os';

const getIpAddress = () => {
    const networks = os.networkInterfaces();
    for (let key in networks) {
        const network = networks[key];
        const networkFiltered = network?.filter(n => n.internal === false && n.family === "IPv4" && n.mac !== '00:00:00:00:00:00')
        if (networkFiltered && networkFiltered?.length > 0) {
            return networkFiltered[0].address;
        }
    }

    throw new Error("No IP address found");
}

export {
    getIpAddress
}
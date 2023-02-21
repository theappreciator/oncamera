import "reflect-metadata";
import os from 'os';

import { getIpAddress, getLocalHostnameDotLocal, getLocalHostnameDotLocalNormalized, getNetworkAddress } from "../../source";

// const lightDevice: MdnsDevice = {
//     id: "testdevice",
//     name: "testdevice",
//     host: "testdevice",
//     ip: "10.0.0.200",
//     port: 9143
// }

describe(("getIpAddress"), () => {
    it("should return a single ip when there is 1", () => {

        const mockedHostname = "mockedHostname";
        const osSpy = jest.spyOn(os, "networkInterfaces").mockImplementation(() => {
            const ifaces: NodeJS.Dict<os.NetworkInterfaceInfo[]> = {
                lo: [
                  {
                    address: '127.0.0.1',
                    netmask: '255.0.0.0',
                    family: 'IPv4',
                    mac: '00:00:00:00:00:00',
                    internal: true,
                    cidr: '127.0.0.1/8'
                  },
                  {
                    address: '::1',
                    netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
                    family: 'IPv6',
                    mac: '00:00:00:00:00:00',
                    scopeid: 0,
                    internal: true,
                    cidr: '::1/128'
                  }
                ],
                eth0: [
                  {
                    address: '10.0.0.200',
                    netmask: '255.255.255.0',
                    family: 'IPv4',
                    mac: '01:02:03:0a:0b:0c',
                    internal: false,
                    cidr: '192.168.1.108/24'
                  },
                  {
                    address: 'fe80::a00:27ff:fe4e:66a1',
                    netmask: 'ffff:ffff:ffff:ffff::',
                    family: 'IPv6',
                    mac: '01:02:03:0a:0b:0c',
                    scopeid: 1,
                    internal: false,
                    cidr: 'fe80::a00:27ff:fe4e:66a1/64'
                  }
                ]
            }

            return ifaces;
        });

        const expected = "10.0.0.200";
        const received = getIpAddress();

        expect(received).toBe(expected);
    });

    it("should return a single ip when there is more than 1", () => {

        const mockedHostname = "mockedHostname";
        const osSpy = jest.spyOn(os, "networkInterfaces").mockImplementation(() => {
            const ifaces: NodeJS.Dict<os.NetworkInterfaceInfo[]> = {
                lo: [
                  {
                    address: '127.0.0.1',
                    netmask: '255.0.0.0',
                    family: 'IPv4',
                    mac: '00:00:00:00:00:00',
                    internal: true,
                    cidr: '127.0.0.1/8'
                  },
                  {
                    address: '::1',
                    netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
                    family: 'IPv6',
                    mac: '00:00:00:00:00:00',
                    scopeid: 0,
                    internal: true,
                    cidr: '::1/128'
                  }
                ],
                eth0: [
                  {
                    address: '10.0.0.200',
                    netmask: '255.255.255.0',
                    family: 'IPv4',
                    mac: '01:02:03:0a:0b:0c',
                    internal: false,
                    cidr: '192.168.1.108/24'
                  },
                  {
                    address: 'fe80::a00:27ff:fe4e:66a1',
                    netmask: 'ffff:ffff:ffff:ffff::',
                    family: 'IPv6',
                    mac: '01:02:03:0a:0b:0c',
                    scopeid: 1,
                    internal: false,
                    cidr: 'fe80::a00:27ff:fe4e:66a1/64'
                  }
                ],
                eth1: [
                    {
                      address: '10.0.0.201',
                      netmask: '255.255.255.0',
                      family: 'IPv4',
                      mac: '01:02:03:0a:0b:0d',
                      internal: false,
                      cidr: '192.168.1.108/24'
                    },
                    {
                      address: 'fe80::a00:27ff:fe4e:66a2',
                      netmask: 'ffff:ffff:ffff:ffff::',
                      family: 'IPv6',
                      mac: '01:02:03:0a:0b:0d',
                      scopeid: 1,
                      internal: false,
                      cidr: 'fe80::a00:27ff:fe4e:66a1/64'
                    }
                  ]
            }

            return ifaces;
        });

        const expected = "10.0.0.200";
        const received = getIpAddress();

        expect(received).toBe(expected);
    });

    it("should throw an error when there are only IPv6 addresses, no IPv4", () => {

        const mockedHostname = "mockedHostname";
        const osSpy = jest.spyOn(os, "networkInterfaces").mockImplementation(() => {
            const ifaces: NodeJS.Dict<os.NetworkInterfaceInfo[]> = {
                lo: [
                  {
                    address: '::1',
                    netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
                    family: 'IPv6',
                    mac: '00:00:00:00:00:00',
                    scopeid: 0,
                    internal: true,
                    cidr: '::1/128'
                  }
                ],
                eth0: [
                  {
                    address: 'fe80::a00:27ff:fe4e:66a1',
                    netmask: 'ffff:ffff:ffff:ffff::',
                    family: 'IPv6',
                    mac: '01:02:03:0a:0b:0c',
                    scopeid: 1,
                    internal: false,
                    cidr: 'fe80::a00:27ff:fe4e:66a1/64'
                  }
                ],
                eth1: [
                    {
                      address: 'fe80::a00:27ff:fe4e:66a2',
                      netmask: 'ffff:ffff:ffff:ffff::',
                      family: 'IPv6',
                      mac: '01:02:03:0a:0b:0d',
                      scopeid: 1,
                      internal: false,
                      cidr: 'fe80::a00:27ff:fe4e:66a1/64'
                    }
                  ]
            }

            return ifaces;
        });

        expect(() => getIpAddress()).toThrow();
    });

    it("should throw an error when local ip can't be determined", () => {

        const mockedHostname = "mockedHostname";
        const osSpy = jest.spyOn(os, "networkInterfaces").mockImplementation(() => {
            const ifaces = {};

            return ifaces;
        });

        expect(() => getIpAddress()).toThrow();
    });
});

describe(("getLocalHostnameDotLocal"), () => {
    it("should get a local name", () => {

        const mockedHostname = "mockedHostname";
        const osSpy = jest.spyOn(os, "hostname").mockImplementation(() => {
            return mockedHostname;
        });

        const received = getLocalHostnameDotLocal();

        expect(typeof received).toBe("string");
        expect(received.length).toBeGreaterThan((mockedHostname + ".").length);
    });
});

describe(("getLocalHostnameDotLocalNormalized"), () => {
    it("should get a local normalized name", () => {

        const mockedHostname = "Mocked Hostname";
        const osSpy = jest.spyOn(os, "hostname").mockImplementation(() => {
            return mockedHostname;
        });

        const received = getLocalHostnameDotLocalNormalized();
        const expected = mockedHostname.toLocaleLowerCase().replace(" ", "-");

        expect(typeof received).toBe("string");
        expect(received.length).toBeGreaterThan((expected + ".").length);
        expect(received.slice(0, mockedHostname.length)).toBe(expected);
    });
});

describe(("getNetworkAddress"), () => {
    it("should return an ip address and port", () => {

        const mockedHostname = "mockedHostname";
        const osSpy = jest.spyOn(os, "networkInterfaces").mockImplementation(() => {
            const ifaces: NodeJS.Dict<os.NetworkInterfaceInfo[]> = {
                lo: [
                  {
                    address: '127.0.0.1',
                    netmask: '255.0.0.0',
                    family: 'IPv4',
                    mac: '00:00:00:00:00:00',
                    internal: true,
                    cidr: '127.0.0.1/8'
                  },
                  {
                    address: '::1',
                    netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
                    family: 'IPv6',
                    mac: '00:00:00:00:00:00',
                    scopeid: 0,
                    internal: true,
                    cidr: '::1/128'
                  }
                ],
                eth0: [
                  {
                    address: '10.0.0.200',
                    netmask: '255.255.255.0',
                    family: 'IPv4',
                    mac: '01:02:03:0a:0b:0c',
                    internal: false,
                    cidr: '192.168.1.108/24'
                  },
                  {
                    address: 'fe80::a00:27ff:fe4e:66a1',
                    netmask: 'ffff:ffff:ffff:ffff::',
                    family: 'IPv6',
                    mac: '01:02:03:0a:0b:0c',
                    scopeid: 1,
                    internal: false,
                    cidr: 'fe80::a00:27ff:fe4e:66a1/64'
                  }
                ]
            }

            return ifaces;
        });

        const ip = "10.0.0.201";
        const port = 9143;
        const expected = {
            ip,
            port
        }
        const received = getNetworkAddress(ip, port);

        expect(JSON.stringify(received)).toBe(JSON.stringify(expected));
    });
});

describe(("getNetworkAddress"), () => {
    it("should return a localhost ip address and port", () => {

        const mockedHostname = "mockedHostname";
        const osSpy = jest.spyOn(os, "networkInterfaces").mockImplementation(() => {
            const ifaces: NodeJS.Dict<os.NetworkInterfaceInfo[]> = {
                lo: [
                  {
                    address: '127.0.0.1',
                    netmask: '255.0.0.0',
                    family: 'IPv4',
                    mac: '00:00:00:00:00:00',
                    internal: true,
                    cidr: '127.0.0.1/8'
                  },
                  {
                    address: '::1',
                    netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
                    family: 'IPv6',
                    mac: '00:00:00:00:00:00',
                    scopeid: 0,
                    internal: true,
                    cidr: '::1/128'
                  }
                ],
                eth0: [
                  {
                    address: '10.0.0.200',
                    netmask: '255.255.255.0',
                    family: 'IPv4',
                    mac: '01:02:03:0a:0b:0c',
                    internal: false,
                    cidr: '192.168.1.108/24'
                  },
                  {
                    address: 'fe80::a00:27ff:fe4e:66a1',
                    netmask: 'ffff:ffff:ffff:ffff::',
                    family: 'IPv6',
                    mac: '01:02:03:0a:0b:0c',
                    scopeid: 1,
                    internal: false,
                    cidr: 'fe80::a00:27ff:fe4e:66a1/64'
                  }
                ]
            }

            return ifaces;
        });

        const ip = "10.0.0.200";
        const port = 9143;
        const expected = {
            ip: "127.0.0.1",
            port
        }
        const received = getNetworkAddress(ip, port);

        expect(JSON.stringify(received)).toBe(JSON.stringify(expected));
    });
});
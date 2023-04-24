type Host = {
  host: string;
  cloud: string;
  os: string;
  // services: number;
  // public: boolean;
  mode: string;
  // appsec: boolean;
  // extensions: boolean;
};

const osTypes = ['Linux', 'Windows', 'AIX', 'Solaris'];
const cloudTypes = ['AWS', 'Azure', 'GCP', 'VMWare'];

export { Host, osTypes, cloudTypes };

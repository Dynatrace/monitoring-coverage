interface Cloud {
  cloudType: "EC2" | "GOOGLE_CLOUD_PLATFORM" | "VMWare" | "AZURE";
  icon: string;
  cloud: string;
  cloudStatus: boolean;
  cloudHosts: number;
  oneagentHosts: number;
}

export { Cloud };

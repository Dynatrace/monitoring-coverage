import React, { useState } from "react";
import { Host, osTypes, cloudTypes } from "../types/HostTypes";

export const useMockHostData = () => {
  const [hostList, setHostList] = useState<Host[]>([]);
  const rand = (num: number) => Math.floor(Math.random() * num);
  const pickRand = (list: string[]) => list[rand(list.length - 1)];

  const generateHostData = ({ count }) => {
    const hosts: Host[] = [];
    for (let i = 0; i < count; i++) {
      hosts.push({
        host: "host-" + i,
        cloud: pickRand(cloudTypes),
        os: pickRand(osTypes),
        //   services: rand(10),
        //   public: props.hasOwnProperty("public") ? props["public"] : false,
        // most: "discovery",  
        mode: "infrastructure",
        //   appsec: props.hasOwnProperty("appsec") ? props["appsec"] : false,
        //   extensions: props.hasOwnProperty("extensions") ? props["extensions"] : false,
      } as Host);
    }
    //   console.log("generateHostData:", props.count, props, hosts);
    setHostList(hosts);
  };

  return { hostList, generateHostData };
};

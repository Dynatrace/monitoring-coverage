const downloadLatestAgentInstaller = async function (config) {
    if (!config) {
      throw new ApiClientError("API client error", "API client call is missing mandatory config parameter");
    }
    // const query = toQueryString({
    //   flavor: config.flavor,
    //   arch: config.arch,
    //   bitness: config.bitness,
    //   include: config.include,
    //   skipMetadata: config.skipMetadata,
    //   networkZone: config.networkZone
    // });
    const query = "";
    // const headerParameters = __spreadValues({}, config.ifNoneMatch !== void 0 && { "If-None-Match": String(config.ifNoneMatch) });
    // debugger;
    const response = await this.httpClient.send({
      url: `/platform/classic/environment-api/v1/deployment/installer/agent/${config.osType}/${config.installerType}/latest?${query}`,
      method: "GET",
      // headers: __spreadValues({}, headerParameters),
      abortSignal: config.abortSignal
    });
    return response;
  }

  export {downloadLatestAgentInstaller};
import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  Flex,
  FormField,
  Select,
  SelectOption,
  Button,
  SelectedKeys,
  LoadingIndicator,
  TextInput,
  TextArea,
  useToastNotification,
} from '@dynatrace/strato-components-preview';
import {
  deploymentClient,
  DownloadLatestAgentInstallerPathOsType,
  DownloadLatestAgentInstallerPathInstallerType,
  GetAgentInstallerMetaInfoPathOsType,
  GetAgentInstallerMetaInfoPathInstallerType,
  GetAgentInstallerMetaInfoQueryFlavor,
  GetAgentInstallerMetaInfoQueryArch,
  GetAgentInstallerMetaInfoQueryBitness,
} from "@dynatrace-sdk/client-classic-environment-v1";
import {
  accessTokensApiTokensClient,
  ApiTokenCreate,
  ApiTokenCreateScopesItem,
} from "@dynatrace-sdk/client-classic-environment-v2";
// import { HttpClientResponse } from "@dynatrace-sdk/client-classic-environment-v1/types/packages/http-client/src/";
import { CopyIcon, DownloadIcon, PlayIcon, CheckmarkIcon } from '@dynatrace/strato-icons';
import { Cloud, UnmonitoredCloud } from "../types/CloudTypes";
import { downloadLatestAgentInstaller } from "../Workarounds.js";
import "./InstallOneagentModal.css";

const TEXTCOLS = 80;

export const InstallOneagentModal = ({
  modalOpen,
  setModalOpen,
  selectedCloud,
  apiUrl,
  gen2Url,
  demoMode,
  ips,
  setMockCloudData,
}: {
  modalOpen: boolean;
  setModalOpen;
  selectedCloud?: Cloud;
  apiUrl: string;
  gen2Url: string;
  demoMode: boolean;
  ips: string;
  setMockCloudData: React.Dispatch<React.SetStateAction<Cloud[]>>;
}) => {
  //override broken SDK with workaround
  deploymentClient.downloadLatestAgentInstaller = downloadLatestAgentInstaller;
  //visual states
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [ipsCopied, setIpsCopied] = useState(false);
  const [dl1linerCopied, setdl1LinerCopied] = useState(false);
  const [install1linerCopied, setInstall1LinerCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  //form states
  const [mode, setMode] = useState<SelectedKeys | null>(["infrastructure"]);
  const [installerType, setInstallerType] = useState<SelectedKeys | null>(["default"]);
  const [disabledInstallerTypes, setDisabledInstallerTypes] = useState<string[]>([]);
  const [arch, setArch] = useState<SelectedKeys | null>(["all"]);
  const [disabledArchs, setDisabledArchs] = useState<string[]>([]);
  const [osType, setOsType] = useState<SelectedKeys | null>(["unix"]);
  const [osTypeTxt, setOsTypeTxt] = useState<string | null>("Linux");
  const [networkZone, setNetworkZone] = useState<string | undefined>("");
  const [version, setVersion] = useState<string>("");
  const [token, setToken] = useState<string>("<TOKEN_HERE>");
  const { showToast } = useToastNotification();

  useEffect(() => {
    const config: {
      osType: GetAgentInstallerMetaInfoPathOsType;
      installerType: GetAgentInstallerMetaInfoPathInstallerType;
      flavor?: GetAgentInstallerMetaInfoQueryFlavor | undefined;
      arch?: GetAgentInstallerMetaInfoQueryArch | undefined;
      bitness?: GetAgentInstallerMetaInfoQueryBitness | undefined;
      abortSignal?: AbortSignal | undefined;
    } = {
      osType:
        (Array.isArray(osType) && osType.length > 0 && (osType[0] as GetAgentInstallerMetaInfoPathOsType)) ||
        GetAgentInstallerMetaInfoPathOsType["unix"],
      installerType:
        (Array.isArray(installerType) &&
          installerType.length > 0 &&
          (installerType[0] as GetAgentInstallerMetaInfoPathInstallerType)) ||
        GetAgentInstallerMetaInfoPathInstallerType["default"],
      flavor: undefined,
      arch:
        (Array.isArray(arch) && arch.length > 0 && (arch[0] as GetAgentInstallerMetaInfoQueryArch)) ||
        GetAgentInstallerMetaInfoQueryArch["all"],
      bitness: undefined,
      abortSignal: undefined,
    };
    deploymentClient.getAgentInstallerMetaInfo(config).then(
      (value) => {
        // console.log("deploymentClient.getAgentInstallerMetaInfo:", value);
        setVersion(value.latestAgentVersion || "");
      },
      (reason) => {
        console.warn("getAgentInstallerMetaInfo failed:", reason.message, reason.response.url);
        showToast({
          title: "Fetch installer metainfo failed",
          type: "critical",
          message: reason.message,
        });
        setVersion("NOT_FOUND");
      }
    );
  }, [osType, installerType, arch]);
  useEffect(() => {
    const config: {
      body: ApiTokenCreate;
      abortSignal?: AbortSignal | undefined;
    } = {
      body: {
        scopes: [ApiTokenCreateScopesItem.InstallerDownload],
        name: "Installer token created from Monitoring Coverage",
        expirationDate: "now+1d",
      },
    };
    accessTokensApiTokensClient.createApiToken(config).then(
      (value) => {
        // console.log("accessTokensApiTokensClient.createApiToken:", value);
        setToken(value.token || "TOKEN_MISSING");
      },
      (reason) => {
        console.warn("accessTokensApiTokensClient.createApiToken failed:", reason.message, reason.response.url);
        showToast({
          title: "Create download token failed",
          type: "critical",
          message: reason.message,
        });
        setToken("TOKEN_MISSING");
      }
    );
  }, []);
  const dl1Liner = useMemo(
    () =>
      `wget -O Dynatrace-OneAgent-${osTypeTxt}-${version}.sh "${gen2Url}/api/v1/deployment/installer/agent/${osType}/${installerType}/latest?arch=${arch}&flavor=default" --header="Authorization: Api-Token ${demoMode ? "<TOKEN_HERE>" : token}"`,
    [version, gen2Url, osType, installerType, arch, token, osTypeTxt, demoMode]
  );
  const install1Liner = useMemo(
    () =>
      `/bin/sh Dynatrace-OneAgent-${osTypeTxt}-${version}.sh --set-infra-only=false --set-app-log-content-access=true`,
    [osTypeTxt, version]
  );

  const copyToClipboard = () => {
    if (ips) {
      navigator.clipboard.writeText(ips);
      console.log("Copied text to clipboard: " + ips);
      setIpsCopied(true);
    } else console.warn("tried to copy to clipboard:", selectedCloud);
  };

  const downloadOneagent = () => {
    setDownloading(true);
    const agentPromise = deploymentClient.downloadLatestAgentInstaller({
      osType: DownloadLatestAgentInstallerPathOsType.Unix,
      installerType: DownloadLatestAgentInstallerPathInstallerType.Default,
    });

    agentPromise.then((res: /*Promise<HttpClientResponse>*/ any) => {
      try {
        res.response.blob().then((blob) => {
          console.log("client:", blob);
          const blobUrl = window.URL.createObjectURL(new Blob([blob]));
          const dlLink = document.createElement("a");
          dlLink.href = blobUrl;
          dlLink.download = "oneagent.sh";
          document.body.appendChild(dlLink);
          dlLink.click();
          dlLink.parentNode?.removeChild(dlLink);
          setDownloading(false);
        });
      } catch (e) {
        console.warn("agent download failed:", e);
        showToast({
          title: "Agent download failed",
          type: "warning",
          message: e.message,
        });
        setDownloading(false);
      }
    });
  };

  const copyDownload1Liner = () => {
    navigator.clipboard.writeText(dl1Liner);
    setdl1LinerCopied(true);
  };

  const copyInstall1Liner = () => {
    navigator.clipboard.writeText(install1Liner);
    setInstall1LinerCopied(true);
    if(demoMode){
      setMockCloudData((oldData) => {
        if (selectedCloud) {
          selectedCloud.oneagentHosts = selectedCloud.cloudHosts;
          selectedCloud.unmonitoredCloud = [] as UnmonitoredCloud[];
        }
        return [...oldData];
      });
    }
  };

  const selectOsType = (selectedKeys, selectedValues: string) => {
    const archs = Object.values(GetAgentInstallerMetaInfoQueryArch);
    setOsType(selectedKeys);
    setOsTypeTxt(selectedValues);
    switch (selectedKeys[0]) {
      case "solaris":
        setDisabledArchs(archs.filter((a) => a != "sparc"));
        setArch(["sparc"]);
        setDisabledInstallerTypes(["default"]);
        setInstallerType(["paas"]);
        break;
      case "unix":
        setDisabledArchs(["sparc"]);
        setArch(["x86"]);
        setDisabledInstallerTypes([]);
        setInstallerType(["default"]);
        break;
      case "aix":
        setDisabledArchs(archs.filter((a) => a != "all"));
        setArch(["all"]);
        setDisabledInstallerTypes([]);
        setInstallerType(["default"]);
        break;
      case "zos":
        setDisabledArchs(archs.filter((a) => a != "all"));
        setArch(["all"]);
        setDisabledInstallerTypes(["default", "paas-sh"]);
        setInstallerType(["paas"]);
        break;
      case "windows":
        setDisabledArchs(archs.filter((a) => a != "x86"));
        setArch(["x86"]);
        setDisabledInstallerTypes(["paas-sh"]);
        setInstallerType(["default"]);
        break;
    }
  };

  return (
    <Modal title={`Install OneAgents`} show={modalOpen} onDismiss={() => setModalOpen(false)} dismissible={true}>
      <Flex flexDirection="column" flex={0}>
        {/* Heading */}
        <span>
          <img src="./assets/oneagent.svg" className="iconStyle" />
          &nbsp; Install OneAgents:
        </span>

        {/* Step 1 - Copy IP list */}
        <Flex flexItem flexGrow={0} flexDirection="row">
          <FormField label="Copy IP list">
            {/* <Flex flexDirection="row"> */}
            <TextArea
              readOnly
              rows={3}
              cols={TEXTCOLS}
              value={ips}
              onChange={() => {
                return;
              }}
            />
            <Button variant="accent" onClick={copyToClipboard} className="copyButton" color={ipsCopied?"success":"neutral"}>
              {/* // Visually show the copy is complete here */}
              {!ipsCopied ? <CopyIcon /> : <CheckmarkIcon />}
              <span>Copy</span>
            </Button>
            {/* </Flex> */}
          </FormField>
        </Flex>

        {/* Step 2 - Pick OneAgent mode */}
        <Flex flex={0} flexDirection="row">
          <FormField label="OS Type">
            <Select name="mode" selectedId={osType} onChange={selectOsType} disabledKeys={[""]}>
              <SelectOption id="unix">Linux</SelectOption>
              <SelectOption id="windows">Windows</SelectOption>
              <SelectOption id="aix">AIX</SelectOption>
              <SelectOption id="solaris">Solaris</SelectOption>
              <SelectOption id="zos">zOS</SelectOption>
            </Select>
          </FormField>
          <FormField label="OneAgent Mode">
            <Select name="mode" selectedId={mode} onChange={setMode} disabledKeys={["discovery"]}>
              <SelectOption id="discovery">Discovery</SelectOption>
              <SelectOption id="infrastructure">Infrastructure</SelectOption>
              <SelectOption id="fullstack">FullStack</SelectOption>
            </Select>
          </FormField>
        </Flex>

        {/* Step 4 - Pick other options, dependent on installer type */}
        <Flex flexItem flexGrow={0} flexDirection="row">
          <Flex flexDirection="row" alignItems={"baseline"}>
            <Button
              variant="default"
              className={optionsOpen ? "caret-button open" : "caret-button"}
              onClick={() => {
                setOptionsOpen((old) => !old);
              }}
            >
              &gt;
            </Button>
            <span>Set customized options (optional)</span>
          </Flex>
          {optionsOpen && (
            <Flex flexDirection="row">
              <FormField label="Installer type">
                <Select
                  name="mode"
                  selectedId={installerType}
                  onChange={setInstallerType}
                  disabledKeys={disabledInstallerTypes}
                >
                  <SelectOption id="default">Default</SelectOption>
                  {/* <SelectOption id="default-unattended">Default Unattended</SelectOption> */}
                  <SelectOption id="paas">PaaS</SelectOption>
                  <SelectOption id="paas-sh">PaaS sh</SelectOption>
                </Select>
              </FormField>
              <FormField label="Architecture">
                <Select name="mode" selectedId={arch} onChange={setArch} disabledKeys={disabledArchs}>
                  <SelectOption id="all">Default</SelectOption>
                  <SelectOption id="x86">x86</SelectOption>
                  <SelectOption id="ppc">ppc</SelectOption>
                  <SelectOption id="ppcle">ppcle</SelectOption>
                  <SelectOption id="sparc">sparc</SelectOption>
                  <SelectOption id="arm">arm</SelectOption>
                  <SelectOption id="s390">s390</SelectOption>
                </Select>
              </FormField>
              <FormField label="Network Zone">
                <TextInput value={networkZone} onChange={setNetworkZone} />
              </FormField>
            </Flex>
          )}
        </Flex>

        {/* Step 5 - Get agent  */}
        <Flex flexItem flexGrow={0} flexDirection="row">
          <FormField label="Get OneAgent">
            <TextArea
              readOnly
              rows={2}
              cols={TEXTCOLS}
              value={dl1Liner}
              onChange={() => {
                return;
              }}
            />
            <Flex flexDirection="row">
              <FormField label="Download 1-liner">
                <Button variant="accent" onClick={copyDownload1Liner} className="dlButton" color={dl1linerCopied?"success":"neutral"}>
                  {!dl1linerCopied ? <CopyIcon /> : <CheckmarkIcon />}
                  <span>Copy</span>
                </Button>
              </FormField>
              <FormField label="Installer">
                <Button disabled={downloading} onClick={downloadOneagent} className="copyButton">
                  <Flex flexDirection="row" alignContent="space-between">
                    <DownloadIcon />
                    <span>Download</span>
                  </Flex>
                </Button>
                <LoadingIndicator loading={downloading} />
              </FormField>
            </Flex>
          </FormField>
        </Flex>

        {/* Step 6 - Install agent */}
        <Flex flexItem flexGrow={0} flexDirection="row">
          <FormField label="Install 1-liner">
            <TextArea
              readOnly
              rows={2}
              cols={TEXTCOLS}
              value={install1Liner}
              onChange={() => {
                return;
              }}
            />
            <Button variant="accent" onClick={copyInstall1Liner} className="copyButton" color={install1linerCopied?"success":"neutral"}>
              {!install1linerCopied ? <CopyIcon /> : <CheckmarkIcon />}
              Copy
            </Button>
          </FormField>
        </Flex>
      </Flex>
    </Modal>
  );
};

import React, { useState } from 'react';
import {
  Modal,
  Flex,
  FormField,
  Select,
  SelectOption,
  Button,
  SelectedKeys,
  ProgressCircle,
  TextInput,
  Text,
  Hint,
  ProgressBar,
  CodeSnippet,
} from '@dynatrace/strato-components-preview';
import {
  GetAgentInstallerMetaInfoPathOsType,
  GetAgentInstallerMetaInfoPathInstallerType,
  GetAgentInstallerMetaInfoQueryArch,
} from '@dynatrace-sdk/client-classic-environment-v1';
import { DownloadIcon, UnfoldMoreIcon, UnfoldLessIcon, ArrowRightIcon, CheckmarkIcon } from '@dynatrace/strato-icons';
import Colors from '@dynatrace/strato-design-tokens/colors';
import { GEN2URL } from '../../constants';
import { useDemoMode } from '../../hooks/useDemoMode';
import { useOneAgentInstallerMeta } from '../../hooks/useOneAgentInstallerMetaInfo';
import { useDownloadOneAgent } from '../../hooks/useDownloadOneAgent';
import { useInstallerDownloadToken } from '../../hooks/useInstallerDownloadToken';
import { OneAgentIcon } from '../../icons/OneAgent';
import { useQueryClient } from '@tanstack/react-query';
import { CloudType } from 'src/app/types/CloudTypes';
import { updateMockHosts } from '../demo/update-mock-hosts';

type InstallOneagentModalProps = {
  modalOpen: boolean;
  onDismiss: () => void;
  ips: string;
  cloudType: CloudType;
};

export const InstallOneAgentModal = ({ modalOpen, onDismiss, ips, cloudType }: InstallOneagentModalProps) => {
  const demoMode = useDemoMode();
  const queryClient = useQueryClient();

  //visual states
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [sectionsCopied, setSectionsCopied] = useState<string[]>([]);
  //form states
  const [mode, setMode] = useState<SelectedKeys>(['infrastructure']);
  const [installerType, setInstallerType] = useState<SelectedKeys>(['default']);
  const [disabledInstallerTypes, setDisabledInstallerTypes] = useState<string[]>([]);
  const [arch, setArch] = useState<SelectedKeys>(['all']);
  const [disabledArchs, setDisabledArchs] = useState<string[]>([]);
  const [osType, setOsType] = useState<{ keys: SelectedKeys; value: string }>({ keys: ['unix'], value: 'Linux' });
  const [networkZone, setNetworkZone] = useState<string | undefined>('');

  const { data: token } = useInstallerDownloadToken();

  const {
    data: version,
    isLoading: isInstallerMetaLoading,
    isError: isInstallerMetaError,
  } = useOneAgentInstallerMeta({
    arch: arch[0] as GetAgentInstallerMetaInfoQueryArch,
    osType: osType.keys[0] as GetAgentInstallerMetaInfoPathOsType,
    installerType: installerType[0] as GetAgentInstallerMetaInfoPathInstallerType,
  });

  const dl1Liner = `wget -O Dynatrace-OneAgent-${
    osType.value
  }-${version}.sh "${GEN2URL}/api/v1/deployment/installer/agent/${
    osType.value
  }/${installerType}/latest?arch=${arch}&flavor=default" --header="Authorization: Api-Token ${
    demoMode ? '<TOKEN_HERE>' : token
  }"`;
  const install1Liner = `/bin/sh Dynatrace-OneAgent-${osType.value}-${version}.sh --set-infra-only=false --set-app-log-content-access=true`;
  const downloadConfig = { osType: `${osType.keys[0]}`, installerType: `${installerType[0]}` };

  const { mutate: downloadOneAgent, isLoading: downloading } = useDownloadOneAgent();

  const selectOsType = (keys: SelectedKeys, value: string) => {
    const archs = Object.values(GetAgentInstallerMetaInfoQueryArch);
    setOsType({ keys, value });
    switch (keys[0]) {
      case 'solaris':
        setDisabledArchs(archs.filter((a) => a != 'sparc'));
        setArch(['sparc']);
        setDisabledInstallerTypes(['default']);
        setInstallerType(['paas']);
        break;
      case 'unix':
        setDisabledArchs(['sparc']);
        setArch(['x86']);
        setDisabledInstallerTypes([]);
        setInstallerType(['default']);
        break;
      case 'aix':
        setDisabledArchs(archs.filter((a) => a != 'all'));
        setArch(['all']);
        setDisabledInstallerTypes([]);
        setInstallerType(['default']);
        break;
      case 'zos':
        setDisabledArchs(archs.filter((a) => a != 'all'));
        setArch(['all']);
        setDisabledInstallerTypes(['default', 'paas-sh']);
        setInstallerType(['paas']);
        break;
      case 'windows':
        setDisabledArchs(archs.filter((a) => a != 'x86'));
        setArch(['x86']);
        setDisabledInstallerTypes(['paas-sh']);
        setInstallerType(['default']);
        break;
    }
  };

  const installOneAgentHosts = () => {
    if (demoMode) {
      updateMockHosts(queryClient, cloudType);
    } else {
      queryClient.invalidateQueries({ queryKey: ['one-agent-host', { demoMode }] });
    }
  };

  const attentionLabel = (text: string) => {
    if (!sectionsCopied.includes(text)) {
      return (
        <Flex flexDirection='row' style={{ color: Colors.Text.Primary.Default }}>
          <ArrowRightIcon /> {text}
        </Flex>
      );
    } else {
      return (
        <Flex flexDirection='row' alignContent='baseline' style={{ color: Colors.Text.Success.Default }}>
          <CheckmarkIcon /> {text}
        </Flex>
      );
    }
  };

  const onCopiedSection = (text: string) => {
    setSectionsCopied((oldval: string[]) => {
      if (oldval.includes(text)) return oldval;
      return [...oldval, text];
    });
  };

  return (
    <Modal title={`Install OneAgents`} show={modalOpen} onDismiss={onDismiss} dismissible={true}>
      <Flex flexDirection='column' gap={16}>
        <Flex>
          <OneAgentIcon />
          <Text>Install OneAgents:</Text>
        </Flex>

        {/* Step 1 - Copy IP list */}
        <Flex flexDirection='row'>
          <FormField label={attentionLabel('IP list')}>
            <CodeSnippet
              showLineNumbers={false}
              lineBreaks={true}
              maxHeight={200}
              onCopy={() => onCopiedSection('IP list')}
            >
              {ips}
            </CodeSnippet>
          </FormField>
        </Flex>

        {/* Step 2 - Pick OneAgent mode */}
        <Flex flexDirection='row'>
          <FormField label='OS Type'>
            <Select selectedId={osType.keys} onChange={selectOsType}>
              <SelectOption id='unix'>Linux</SelectOption>
              <SelectOption id='windows'>Windows</SelectOption>
              <SelectOption id='aix'>AIX</SelectOption>
              <SelectOption id='solaris'>Solaris</SelectOption>
              <SelectOption id='zos'>zOS</SelectOption>
            </Select>
          </FormField>
          <FormField label='OneAgent Mode'>
            <Select
              selectedId={mode}
              onChange={(value) => value !== null && setMode(value)}
              disabledKeys={['discovery']}
            >
              <SelectOption id='discovery'>Discovery</SelectOption>
              <SelectOption id='infrastructure'>Infrastructure</SelectOption>
              <SelectOption id='fullstack'>FullStack</SelectOption>
            </Select>
          </FormField>
        </Flex>

        {/* Step 4 - Pick other options, dependent on installer type */}

        <Flex flexDirection='row' as='details' open={optionsOpen} onToggle={() => setOptionsOpen((prev) => !prev)}>
          <Button as='summary' variant='default'>
            <Button.Prefix>{optionsOpen ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}</Button.Prefix>
            Optional Parameters
          </Button>
          <Flex flexDirection='column' marginTop={8}>
            <FormField label='Installer type'>
              <Select
                name='mode'
                selectedId={installerType}
                onChange={(value) => value !== null && setInstallerType(value)}
                disabledKeys={disabledInstallerTypes}
              >
                <SelectOption id='default'>Default</SelectOption>
                <SelectOption id='paas'>PaaS</SelectOption>
                <SelectOption id='paas-sh'>PaaS sh</SelectOption>
              </Select>
            </FormField>
            <FormField label='Architecture'>
              <Select
                selectedId={arch}
                onChange={(value) => value !== null && setArch(value)}
                disabledKeys={disabledArchs}
              >
                <SelectOption id='all'>Default</SelectOption>
                <SelectOption id='x86'>x86</SelectOption>
                <SelectOption id='ppc'>ppc</SelectOption>
                <SelectOption id='ppcle'>ppcle</SelectOption>
                <SelectOption id='sparc'>sparc</SelectOption>
                <SelectOption id='arm'>arm</SelectOption>
                <SelectOption id='s390'>s390</SelectOption>
              </Select>
            </FormField>
            <FormField label='Network Zone'>
              <TextInput value={networkZone} onChange={setNetworkZone} />
            </FormField>
          </Flex>
        </Flex>

        {/* Step 5 - Get agent  */}
        <Flex flexItem flexGrow={0} flexDirection='row'>
          {isInstallerMetaLoading ? (
            <ProgressBar>
              <ProgressBar.Label>Downloading Agent information...</ProgressBar.Label>
            </ProgressBar>
          ) : (
            <>
              <FormField label={attentionLabel('Get OneAgent')}>
                <CodeSnippet
                  showLineNumbers={false}
                  language='bash'
                  lineBreaks={true}
                  maxHeight={200}
                  onCopy={() => onCopiedSection('Get OneAgent')}
                >
                  {isInstallerMetaError ? '' : dl1Liner}
                </CodeSnippet>
                {isInstallerMetaError ? (
                  <Hint hasError={isInstallerMetaError}>There was an error obtaining the agent information.</Hint>
                ) : null}
                <Flex flexDirection='row' gap={12} alignItems='center' mb={12}>
                  <Text>or</Text>
                  <Button disabled={downloading} onClick={() => downloadOneAgent(downloadConfig)}>
                    <Button.Prefix>
                      <DownloadIcon />
                    </Button.Prefix>
                    Download
                  </Button>
                  {downloading && <ProgressCircle size='small' aria-label='Loading...' />}
                </Flex>
              </FormField>
              <FormField label={attentionLabel('Install 1-liner')}>
                <CodeSnippet
                  showLineNumbers={false}
                  language='bash'
                  lineBreaks={true}
                  maxHeight={200}
                  onCopy={() => {
                    onCopiedSection('Install 1-liner');
                    installOneAgentHosts();
                  }}
                >
                  {isInstallerMetaError ? '' : install1Liner}
                </CodeSnippet>

                {isInstallerMetaError ? (
                  <Hint hasError={isInstallerMetaError}>There was an error obtaining the agent information.</Hint>
                ) : null}
              </FormField>
            </>
          )}
        </Flex>
      </Flex>
    </Modal>
  );
};

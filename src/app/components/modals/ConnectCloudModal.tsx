import React, { Dispatch, SetStateAction } from 'react';
import { Modal, Flex, FormField, TextInput, Button, Text } from '@dynatrace/strato-components-preview';
import { ExternalLinkIcon } from '@dynatrace/strato-icons';
import { Cloud } from '../../types/CloudTypes';
import { useDemoMode } from '../../hooks/useDemoMode';
import { GEN2URL } from '../../constants';
import { useQueryClient } from '@tanstack/react-query';
import { updateMockData } from '../demo/update-mock-data';

type ConnectCloudModalProps = {
  modalOpen: boolean;
  onDismiss: () => void;
  selectedCloud: Cloud;
};

export const ConnectCloudModal = ({ modalOpen, onDismiss, selectedCloud }: ConnectCloudModalProps) => {
  const demoMode = useDemoMode();

  const url = GEN2URL + selectedCloud.setupPath;

  const queryClient = useQueryClient();

  return (
    <Modal title={`Add ${selectedCloud.cloud} integration`} show={modalOpen} onDismiss={onDismiss}>
      <Flex flexDirection='column' gap={16}>
        <Flex flexDirection='row'>
          <Text>
            {selectedCloud.icon && <img src={`./assets/` + selectedCloud.icon} />}
            &nbsp; Add {selectedCloud.cloud} integration:
          </Text>
        </Flex>
        {demoMode && (
          <Flex flexDirection='column' gap={16}>
            <FormField label='(Mock)'>
              <FormField label='API URL'>
                <TextInput placeholder='https://xxx.xxxxxxxx.xxx/xxx' />
              </FormField>
              <FormField label='API Key'>
                <TextInput placeholder='xxxxxxxxxxxxxxxxxxxxxxxxxxxx' />
              </FormField>
            </FormField>
          </Flex>
        )}
        <Flex flexGrow={0} justifyContent='flex-end'>
          {demoMode ? (
            <Button
              variant='emphasized'
              onClick={() => {
                if (selectedCloud) {
                  updateMockData(queryClient, selectedCloud.cloudType);
                }
                onDismiss();
              }}
            >
              Connect
            </Button>
          ) : (
            <Button as='a' target='_blank' href={url} variant='emphasized'>
              {selectedCloud.cloudType == 'VMWare' ? 'Settings' : 'Hub'}
              <Button.Suffix>
                <ExternalLinkIcon />
              </Button.Suffix>
            </Button>
          )}
          <Button variant='default' onClick={onDismiss}>
            Done
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};

import React, { FormEvent, useRef, } from 'react';
import {
  Modal,
  Flex,
  FormField,
  TextInput,
  PasswordInput,
  Text,
  Button,
} from '@dynatrace/strato-components-preview';
import { Cloud } from '../../types/CloudTypes';
import { useVMWareSettings } from 'src/app/hooks/useVMWareSettings';

type ConnectVMWareModalProps = {
  modalOpen: boolean;
  onDismiss: () => void;
  selectedCloud?: Cloud;
};

export const ConnectVMWareModal = ({ modalOpen, onDismiss, selectedCloud }: ConnectVMWareModalProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  const { mutate } = useVMWareSettings();

  function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      mutate(formData, {
        onSuccess: () => {
          onDismiss();
        },
      });
    }
    onDismiss();
  }

  return (
    <Modal title={`Add ${selectedCloud?.cloud} integration`} show={modalOpen} onDismiss={onDismiss}>
      <form ref={formRef} onSubmit={submit}>
        <Flex flexDirection='column' gap={16}>
          <Flex flexDirection='row'>
            <Text>
              {selectedCloud?.icon && <img src={`./assets/` + selectedCloud.icon} className='iconStyle' />}
              &nbsp; Add {selectedCloud?.cloud} integration:
            </Text>
          </Flex>
          <FormField label='Name this connection' required>
            <TextInput placeholder='For example, Dynatrace integration' name='label' />
          </FormField>
          <FormField label='Specify the IP address or name of the vCenter or standalone ESXi host:'>
            <TextInput placeholder='For example, Vcenter01' name='ipaddress' />
          </FormField>
          <FormField label='Provide user credentials for the vCenter or standalone ESXi host:'>
            <TextInput placeholder='Account ID' name='username' />
          </FormField>
          <FormField label='Password'>
            <PasswordInput placeholder='********************' name='password' />
          </FormField>
          <Flex flexGrow={0} justifyContent='flex-end'>
            <Button variant='emphasized' type='submit'>
              Connect
            </Button>
          </Flex>
        </Flex>
      </form>
    </Modal>
  );
};

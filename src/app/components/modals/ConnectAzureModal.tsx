import React, { FormEvent, useRef } from 'react';
import { Modal, Flex, FormField, TextInput, PasswordInput, Text, Button } from '@dynatrace/strato-components-preview';
import { Cloud } from '../../types/CloudTypes';
import { useAzureCredentials } from '../../hooks/useAzureCredentials';

type ConnectAzureModalProps = {
  modalOpen: boolean;
  onDismiss: () => void;
  selectedCloud: Cloud;
};

export const ConnectAzureModal = ({ modalOpen, onDismiss, selectedCloud }: ConnectAzureModalProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  const { mutate } = useAzureCredentials();

  function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      mutate(formData);
    }
    onDismiss();
  }

  return (
    <Modal title={`Add ${selectedCloud.cloud} integration`} show={modalOpen} onDismiss={onDismiss}>
      <form ref={formRef} onSubmit={submit}>
        <Flex flexDirection='column' gap={16}>
          <Flex flexDirection='row'>
            <Text>
              {selectedCloud.icon && <img src={`./assets/` + selectedCloud.icon} className='iconStyle' />}
              &nbsp; Add {selectedCloud.cloud} integration:
            </Text>
          </Flex>
          <FormField label='Connection name' required>
            <TextInput placeholder='For example, Dynatrace integration' name='name' />
          </FormField>
          <FormField label='Client ID' required>
            <TextInput placeholder='For example, 98989ae2-4566-4efd-9db8-e194bb3910e4' name='clientId' />
          </FormField>
          <FormField label='Tenant ID' required>
            <TextInput placeholder='For example, 68345fd1-3216-4aed-7be2-a244bb3907b2' name='tenantId' />
          </FormField>
          <FormField label='Secret Key' required>
            <PasswordInput placeholder='**********************' name='secretKey' />
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

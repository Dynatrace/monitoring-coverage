import React, { FormEvent, useRef, useState } from 'react';
import {
  Modal,
  Flex,
  FormField,
  TextInput,
  Select,
  SelectOption,
  SelectedKeys,
  PasswordInput,
  Text,
  Button,
  FieldSet,
} from '@dynatrace/strato-components-preview';
import { Cloud } from '../../types/CloudTypes';
import { useAWSCredentials } from '../../hooks/useAWSCredentials';

type ConnectAWSModalProps = {
  modalOpen: boolean;
  onDismiss: () => void;
  selectedCloud?: Cloud;
};

export const ConnectAWSModal = ({ modalOpen, onDismiss, selectedCloud }: ConnectAWSModalProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [auth, setAuth] = useState<SelectedKeys | null>(['ROLE']);

  const { mutate } = useAWSCredentials();

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
          <FormField label='Connection name' required>
            <TextInput placeholder='For example, Dynatrace integration' name='name' />
          </FormField>
          <FieldSet name='authenticationData'>
            <FormField label='Authentication method' required>
              <Select name='auth' onChange={setAuth} selectedId={auth}>
                <SelectOption id='KEYS' value='KEYS'>
                  Key-based authentication
                </SelectOption>
                <SelectOption id='ROLE' value='ROLE'>
                  Role-based authentication
                </SelectOption>
              </Select>
            </FormField>
          </FieldSet>
          {auth?.includes('KEYS') ? (
            <Flex flexDirection='column' gap={16}>
              <Select defaultSelectedId={['AWS_DEFAULT']} name='partition'>
                <SelectOption id='AWS_DEFAULT' value='AWS_DEFAULT'>
                  Default
                </SelectOption>
                <SelectOption id='AWS_US_GOV' value='AWS_US_GOV'>
                  US Gov
                </SelectOption>
                <SelectOption id='AWS_CN' value='AWS_CN'>
                  China
                </SelectOption>
              </Select>
              <FormField label='Access Key ID' required>
                <TextInput placeholder='Access key' name='accessKeyId' required />
              </FormField>
              <FormField label='Secret access key' required>
                <PasswordInput placeholder='Secret key' name='secretKeyId' required />
              </FormField>
            </Flex>
          ) : (
            <input type='hidden' value='AWS_DEFAULT' name='partition' />
          )}
          {auth?.includes('ROLE') && (
            <Flex flexDirection='column' gap={16}>
              <FormField label='IAM role that Dynatrace should use to get monitoring data'>
                <TextInput placeholder='Role for this connection' name='role' />
              </FormField>
              <FormField label='Your Amazon account ID'>
                <TextInput placeholder='Account ID' name='accountId' />
              </FormField>
              <FormField label='Token (use this value as the External ID for your IAM role)'>
                <PasswordInput placeholder='********************' name='externalId' />
              </FormField>
            </Flex>
          )}
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

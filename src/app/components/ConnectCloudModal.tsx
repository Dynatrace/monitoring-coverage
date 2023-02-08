import React from "react";
import { Modal, Flex, FormField, TextInput, Button } from "@dynatrace/wave-components-preview";

export const ConnectCloudModal = ({modalOpen, setModalOpen, selectedCloud}) => {

return (
<Modal title={`Add ${selectedCloud?.cloud} integration`} show={modalOpen} onDismiss={() => setModalOpen(false)}>
        <Flex flexDirection="column">
          <span>
            {/* <img src={theme == "dark" ? selectedCloud.icon : selectedCloud.icon.replace("white","purple")} style={iconStyle} /> */}
            &nbsp; Add {selectedCloud?.cloud} integration:
          </span>
          <FormField label="API URL">
            <TextInput value="https://xxx.xxxxxxxx.xxx/xxx" />
          </FormField>
          <FormField label="API Key">
            <TextInput value="xxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </FormField>
          <Flex flexItem flexGrow={0}>
            <Button
              variant="primary"
              onClick={() => {
                // activateCloud(selectedCloud);
                setModalOpen(false);
              }}
            >
              Connect
            </Button>
          </Flex>
        </Flex>
      </Modal>
)
            }
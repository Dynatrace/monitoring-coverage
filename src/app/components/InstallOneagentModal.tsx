import React, {useState} from "react";
import {Modal, Flex, FormField, Select, SelectOption, Button, SelectedKeys} from "@dynatrace/wave-components-preview";
import { CopyIcon} from "@dynatrace/react-icons";

const iconStyle = {
    height: 20,
    width: 20,
  };

export const InstallOneagentModal = ({modalOpen, setModalOpen}) => {
    const [mode, setMode] = useState<SelectedKeys | null>(["infrastructure"]);

    return (
        <Modal title={`Install OneAgents`} show={modalOpen} onDismiss={() => setModalOpen(false)}>
        <Flex flexDirection="column">
          <span>
            {/* <img src={theme == "dark" ? "./assets/oneagent-white.svg" : "./assets/oneagent-purple.svg"} style={iconStyle} /> */}
            &nbsp; Install OneAgents:
          </span>
          <Flex flexItem flexGrow={0} flexDirection="row">
            <FormField label="OneAgent Mode">
              <Select name="mode" selectedId={mode} onChange={setMode} disabledKeys={["discovery"]}>
                <SelectOption id="discovery" >Discovery</SelectOption>
                <SelectOption id="infrastructure">Infrastructure</SelectOption>
                <SelectOption id="fullstack">FullStack</SelectOption>
              </Select>
            </FormField>
          </Flex>

          <Flex flexItem flexGrow={0} flexDirection="row">
            <table>
              <tbody>
                <tr>
                  <td>Copy IP list:</td>
                  <td>
                    <Button>
                      <CopyIcon />
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td>Copy install one-liner:</td>
                  <td>
                    <Button
                      variant="primary"
                      onClick={() => {
                        // deployOneAgent(candidate);
                        setModalOpen(false);
                      }}
                    >
                      <img src="./assets/oneagent.svg" style={iconStyle} />
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </Flex>
        </Flex>
      </Modal>
    )
}
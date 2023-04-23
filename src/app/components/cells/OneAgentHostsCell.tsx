import React from "react"
import { CloudType } from "../../types/CloudTypes"
import { ErrorIcon } from "@dynatrace/strato-icons"
import { format } from '@dynatrace-sdk/util-formatters';
import { useOneAgentHosts } from "src/app/hooks/useOneAgentHosts";

type OneAgentHostsCellProps = {
  type: CloudType
}

export const OneAgentHostsCell = ({ type }: OneAgentHostsCellProps) => {
  const { data, isLoading, isError } = useOneAgentHosts();

  if (isLoading) return null;

  if (isError) return <ErrorIcon />

  return <>{data[type] !== undefined ? format(data[type]||0) : "-"}</>;
}


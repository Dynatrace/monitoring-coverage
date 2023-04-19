import React from "react"
import { CloudType } from "../../types/CloudTypes"
import { useHostsStatus } from "../../hooks/useHostsStatus"
import { ErrorIcon } from "@dynatrace/strato-icons"
import { format } from '@dynatrace-sdk/util-formatters';

type OneAgentHostsCellProps = {
  type: CloudType
}

export const OneAgentHostsCell = ({ type }: OneAgentHostsCellProps) => {
  // TODO: use one agent query
  const { data, isLoading, isError } = useHostsStatus(type);

  if (isLoading) return null;

  if (isError) return <ErrorIcon />

  return <>{data.hosts !== undefined ? format(data.hosts) : "-"}</>;
}


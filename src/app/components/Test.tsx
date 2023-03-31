import React from 'react';
import { convertToColumns } from '@dynatrace/strato-components-preview/conversion-utilities';
import { DataTable } from '@dynatrace/strato-components-preview/tables';
import { FieldTypeType, QueryResult } from '@dynatrace-sdk/client-query';

const queryResult: QueryResult = {
  metadata: {},
  types: [
    {
      indexRange: [0, 3],
      mappings: {
        'dt.entity.host': {
          type: FieldTypeType.String,
        },
        timeframe: {
          type: FieldTypeType.Timeframe,
        },
        value: {
          type: FieldTypeType.Double,
        },
      },
    },
  ],
  records: [
    {
      'dt.entity.host': 'CI-Prod0',
      timeframe: {
        end: '2022-10-02T12:00:00',
        start: '2022-10-02T00:00:00',
      },
      value: 25,
    },
    {
      'dt.entity.host': 'CI-Prod0',
      timeframe: {
        end: '2022-10-03T00:00:00',
        start: '2022-10-02T12:00:00',
      },
      value: 25.39997333386666,
    },
    {
      'dt.entity.host': 'CI-Prod1',
      timeframe: {
        end: '2022-10-02T12:00:00',
        start: '2022-10-02T00:00:00',
      },
      value: 25.66654321673507,
    },
    {
      'dt.entity.host': 'CI-Prod1',
      timeframe: {
        end: '2022-10-03T00:00:00',
        start: '2022-10-02T12:00:00',
      },
      value: 26.066161059568245,
    },
  ],
};

export const ConvertColumns = () => {
  const { types, records } = queryResult;
  const columns = convertToColumns(types);
  return <DataTable data={records} columns={columns} />;
};

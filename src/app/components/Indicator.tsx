import React, { ReactNode } from 'react';
import { Colors } from '@dynatrace/strato-design-tokens';

type IndicatorState = 'critical' | 'success' | 'warning' | 'neutral';
type IndicatorStateMap = { [key in IndicatorState]: string };
type IndicatorProps = {
  state: IndicatorState;
  children: ReactNode;
};

const indicatorStateMap: IndicatorStateMap = {
  neutral: Colors.Text.Neutral.Default,
  critical: Colors.Text.Critical.Default,
  warning: Colors.Text.Warning.Default,
  success: Colors.Text.Success.Default,
};

export const Indicator = ({ children, state }: IndicatorProps) => {
  return <div style={{ color: indicatorStateMap[state], width:"100%" }}>{children}</div>;
};

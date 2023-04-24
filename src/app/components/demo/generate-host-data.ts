import { UnmonitoredCloud } from 'src/app/types/CloudTypes';

export function generateHostData(count, entprefix = 'CLOUDHOST', nameprefix = 'cloud_') {
  const hosts: UnmonitoredCloud[] = [];
  for (let i = 0; i < count; i++) {
    hosts.push({
      'id': entprefix + `-` + i.toString().padStart(7, '0'),
      'entity.name': nameprefix + `_` + i.toString().padStart(3, '0'),
      'entity.detected_name': nameprefix + `_` + i.toString().padStart(3, '0'),
      'ipAddress': `10.0.${(i / 254).toFixed(0)}.${(i % 254) + 1}`,
    });
  }
  return hosts;
}

import type { AlertsPayload } from '../types/mes';

export const alertsMock: AlertsPayload = {
  count: 4,
  alerts: [
    {
      code: 'PG-DEF-014',
      severity: 'high',
      message: 'Déficit de puissance détecté sur le nœud réseau C2 durant le pic de charge.'
    },
    {
      code: 'RA-BLK-022',
      severity: 'critical',
      message: 'Étape 4 RailAuto bloquée par timeout de validation inter-verrouillage.'
    },
    {
      code: 'FC-TNK-008',
      severity: 'medium',
      message: 'Seuil bas cuve 1 atteint ; stratégie de recyclage basculée en mode conservateur.'
    },
    {
      code: 'SYS-INF-101',
      severity: 'info',
      message: 'Heartbeat de sécurité synchronisé via le pont OT/DMZ/IT.'
    }
  ],
  generatedAt: new Date().toISOString(),
  sourceUpdatedAt: new Date().toISOString(),
  pointCount: 4
};

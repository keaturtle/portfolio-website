import { AttemptStatus } from '@engine';

export const ATTEMPT_STATUS_LABEL: Record<AttemptStatus, string> = {
  active: 'In progress',
  succeeded: 'Succeeded',
  failed: 'Failed',
  'restart-required': 'Restart required',
};

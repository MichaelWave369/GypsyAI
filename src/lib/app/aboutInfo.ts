import { APP_LICENSE_ID, APP_SOURCE_LABEL, APP_SOURCE_URL } from '@/lib/app/sourceInfo';

export const APP_NAME = 'GypsyAI' as const;
export const APP_IDENTITY_LINE = 'GypsyAI sovereign oracle habitat.' as const;
export const APP_SOURCE_LINK_LABEL = APP_SOURCE_LABEL;
export const APP_SOURCE_LINK_URL = APP_SOURCE_URL;
export const APP_LICENSE_LABEL = APP_LICENSE_ID;
export const APP_LICENSE_NOTE_LABEL = 'MIT License' as const;
export const APP_LICENSE_NOTE_PATH = '/LICENSE' as const;
// Backward-compatible aliases for existing UI imports. These no longer imply a
// separate commercial license; they route to the project's MIT license.
export const APP_COMMERCIAL_NOTE_LABEL = APP_LICENSE_NOTE_LABEL;
export const APP_COMMERCIAL_NOTE_PATH = APP_LICENSE_NOTE_PATH;
export const APP_LOCAL_PRIVACY_NOTE = 'Local-first configuration memory only; no transcript/session telemetry or cloud sync.' as const;
export const APP_MODELED_NOTE = 'Modeled/theoretical oracle system; not a physical measurement device.' as const;

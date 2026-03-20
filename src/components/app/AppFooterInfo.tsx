import React from 'react';
import {
  APP_COMMERCIAL_NOTE_LABEL,
  APP_COMMERCIAL_NOTE_PATH,
  APP_IDENTITY_LINE,
  APP_LICENSE_LABEL,
  APP_LOCAL_PRIVACY_NOTE,
  APP_MODELED_NOTE,
  APP_NAME,
  APP_SOURCE_LINK_LABEL,
  APP_SOURCE_LINK_URL
} from '@/lib/app/aboutInfo';

export function AppFooterInfo(props: { habitatStatusLine?: string | null }) {
  return (
    <footer className="rounded border border-zinc-800 px-3 py-2 text-[10px] text-zinc-500" data-testid="app-footer-info">
      <p className="text-zinc-400">{APP_NAME} • {APP_IDENTITY_LINE}</p>
      <p>
        <a href={APP_SOURCE_LINK_URL} target="_blank" rel="noreferrer" className="underline">{APP_SOURCE_LINK_LABEL}</a>
        {` • ${APP_LICENSE_LABEL} • `}
        <a href={APP_COMMERCIAL_NOTE_PATH} className="underline">{APP_COMMERCIAL_NOTE_LABEL}</a>
      </p>
      <p>{APP_LOCAL_PRIVACY_NOTE}</p>
      <p>{APP_MODELED_NOTE}</p>
      {props.habitatStatusLine ? <p>{props.habitatStatusLine}</p> : null}
    </footer>
  );
}

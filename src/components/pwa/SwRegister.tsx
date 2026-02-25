'use client';

import { useEffect, useMemo } from 'react';

export function SwRegister() {
  const isWebDriver = useMemo(() => typeof navigator !== 'undefined' && navigator.webdriver === true, []);

  useEffect(() => {
    if (isWebDriver) return;
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => null);
  }, [isWebDriver]);

  if (isWebDriver) return null;
  return null;
}

export const isTestMode = () =>
  process.env.TEST_MODE === '1' || process.env.NEXT_PUBLIC_TEST_MODE === '1';

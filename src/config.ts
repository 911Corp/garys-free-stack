export const REPO = 'https://github.com/911Corp/garys-free-stack';
export const X_HANDLE = 'Gary_NGMI';
export const VERSION = '0.1.0';
export const issueUrl = (title: string, body: string, labels: string) =>
  `${REPO}/issues/new?${new URLSearchParams({ title, body, labels }).toString()}`;

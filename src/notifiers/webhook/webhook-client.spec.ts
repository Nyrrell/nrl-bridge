import { postMessage } from './webhook-client';

describe('postMessage', () => {
  const message = { title: 'Hello', priority: 'normal' as const };
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  it('posts JSON with a bearer token to the exact URL', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    await postMessage('https://example.org/api/messages', 'secret', message);
    expect(fetchMock).toHaveBeenCalledWith('https://example.org/api/messages', {
      method: 'POST',
      headers: { Authorization: 'Bearer secret', 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  });

  it('throws with status and body on failure', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400, text: () => Promise.resolve('bad') });
    await expect(postMessage('https://example.org', 'secret', message)).rejects.toThrow(
      'Webhook message failed: 400 - bad',
    );
  });
});

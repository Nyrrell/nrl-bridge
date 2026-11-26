import { buildTarget, postJson } from './webhook-client';

describe('buildTarget', () => {
  it('puts the token in the auth header', () => {
    const target = buildTarget(
      'https://example.org/api',
      { name: 'Authorization', value: 'Bearer {{token}}' },
      'secret',
    );
    expect(target).toEqual({
      url: 'https://example.org/api',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer secret' },
    });
  });

  it('puts the token in the URL, encoded, without auth header', () => {
    const target = buildTarget('https://example.org/message?token={{token}}', undefined, 'a&b');
    expect(target.url).toBe('https://example.org/message?token=a%26b');
    expect(target.headers).toEqual({ 'Content-Type': 'application/json' });
  });
});

describe('postJson', () => {
  const target = { url: 'https://example.org/api', headers: { 'X-Key': 'k' } };
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  it('posts the rendered body', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    await postJson(target, { title: 'Hello' });
    expect(fetchMock).toHaveBeenCalledWith('https://example.org/api', {
      method: 'POST',
      headers: { 'X-Key': 'k' },
      body: '{"title":"Hello"}',
    });
  });

  it('throws with status and body on failure', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400, text: () => Promise.resolve('bad') });
    await expect(postJson(target, {})).rejects.toThrow('Webhook message failed: 400 - bad');
  });
});

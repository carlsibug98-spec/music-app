import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('GET /healthz', () => {
  it('returns ok with version and uptime', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.version).toBe('string');
    expect(Number.isFinite(res.body.uptime_s)).toBe(true);
  });
});

describe('POST /v1/devices', () => {
  it('registers a device and returns a one-time key', async () => {
    const res = await request(app)
      .post('/v1/devices')
      .send({ display_name: 'Carl', platform: 'android' });

    expect(res.status).toBe(201);
    expect(res.body.display_name).toBe('Carl');
    expect(res.body.platform).toBe('android');
    // uuid v4
    expect(res.body.device_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    // 32-byte key, base64url → 43 chars, returned exactly once
    expect(res.body.device_key).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(res.body.created_at).toBeTruthy();
  });

  it('trims the display name', async () => {
    const res = await request(app)
      .post('/v1/devices')
      .send({ display_name: '  May  ', platform: 'ios' });
    expect(res.status).toBe(201);
    expect(res.body.display_name).toBe('May');
  });

  it('rejects an empty display name with a 422 problem', async () => {
    const res = await request(app)
      .post('/v1/devices')
      .send({ display_name: '   ', platform: 'ios' });

    expect(res.status).toBe(422);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.type).toBe('https://resona.dev/problems/validation');
    expect(res.body.errors?.[0]?.path).toBe('display_name');
  });

  it('rejects a display name longer than 32 chars', async () => {
    const res = await request(app)
      .post('/v1/devices')
      .send({ display_name: 'x'.repeat(33), platform: 'ios' });

    expect(res.status).toBe(422);
    expect(res.body.errors?.[0]?.path).toBe('display_name');
  });

  it('rejects an unknown platform', async () => {
    const res = await request(app)
      .post('/v1/devices')
      .send({ display_name: 'Carl', platform: 'web' });

    expect(res.status).toBe(422);
    expect(res.body.errors?.[0]?.path).toBe('platform');
  });

  it('rejects a missing body entirely', async () => {
    const res = await request(app).post('/v1/devices').send();
    expect(res.status).toBe(422);
    expect(res.body.title).toBe('Validation failed');
  });
});

describe('error envelope', () => {
  it('returns RFC 7807 problem for unknown routes', async () => {
    const res = await request(app).get('/v1/nope');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toContain('application/problem+json');
    expect(res.body.title).toBe('Not found');
    expect(res.body.trace_id).toBeTruthy();
  });

  it('returns 400 problem for malformed JSON', async () => {
    const res = await request(app)
      .post('/v1/devices')
      .set('Content-Type', 'application/json')
      .send('{"display_name": broken');

    expect(res.status).toBe(400);
    expect(res.body.type).toBe('https://resona.dev/problems/bad-request');
  });

  it('carries a trace id on problems', async () => {
    const res = await request(app).get('/v1/nope');
    expect(res.body.trace_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});

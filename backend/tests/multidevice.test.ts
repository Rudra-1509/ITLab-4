import request from 'supertest';
import authApp from '../services/auth/src/index.js';
import { prisma } from '../shared/prisma/client.js';

describe('MULTI-DEVICE AUTHENTICATION TEST', () => {
  const testEmail = `multidevice-${Date.now()}@example.com`;
  const password = 'password123';
  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    // Register user
    await request(authApp)
      .post('/api/auth/register')
      .send({ name: 'Multi Device User', email: testEmail, password, role: 'AUDIENCE' });
  });

  afterAll(async () => {
    await prisma.userSession.deleteMany({ where: { user: { email: testEmail } } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it('should allow concurrent logins from multiple devices creating separate active sessions', async () => {
    // Login Browser A
    const resA = await request(authApp)
      .post('/api/auth/login')
      .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Chrome/115.0)')
      .send({ email: testEmail, password });

    expect(resA.status).toBe(200);
    tokenA = resA.body.access_token;

    // Login Browser B
    const resB = await request(authApp)
      .post('/api/auth/login')
      .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')
      .send({ email: testEmail, password });

    expect(resB.status).toBe(200);
    tokenB = resB.body.access_token;

    expect(tokenA).not.toEqual(tokenB);

    // Verify GET /api/auth/sessions returns 2 active sessions
    const sessionsRes = await request(authApp)
      .get('/api/auth/sessions')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(sessionsRes.status).toBe(200);
    expect(sessionsRes.body.sessions.length).toBeGreaterThanOrEqual(2);
  });

  it('should revoke only target session on single device logout leaving other session active', async () => {
    // Logout Browser A
    const logoutRes = await request(authApp)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(logoutRes.status).toBe(200);

    // Token A should now be revoked
    const meResA = await request(authApp)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(meResA.status).toBe(401);

    // Token B MUST remain valid
    const meResB = await request(authApp)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(meResB.status).toBe(200);
    expect(meResB.body.user.email).toBe(testEmail);
  });

  it('should revoke all sessions on logout-all', async () => {
    // Login Browser C
    const resC = await request(authApp)
      .post('/api/auth/login')
      .send({ email: testEmail, password });

    const tokenC = resC.body.access_token;

    // Call logout-all
    const logoutAllRes = await request(authApp)
      .post('/api/auth/logout-all')
      .set('Authorization', `Bearer ${tokenC}`);

    expect(logoutAllRes.status).toBe(200);

    // Neither tokenB nor tokenC should work
    const meResB = await request(authApp)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenB}`);

    const meResC = await request(authApp)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenC}`);

    expect(meResB.status).toBe(401);
    expect(meResC.status).toBe(401);
  });
});

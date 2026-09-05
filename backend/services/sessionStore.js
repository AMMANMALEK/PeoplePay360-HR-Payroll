const crypto = require('crypto');

const sessions = new Map();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const pruneExpired = () => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
};

const createSession = (payload) => {
  pruneExpired();
  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, {
    ...payload,
    createdAt: Date.now(),
  });
  return sessionId;
};

const getSession = (sessionId) => {
  if (!sessionId) return null;
  pruneExpired();
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
};

const destroySession = (sessionId) => {
  if (sessionId) {
    sessions.delete(sessionId);
  }
};

module.exports = {
  createSession,
  getSession,
  destroySession,
  SESSION_TTL_MS,
};

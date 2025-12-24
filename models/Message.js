
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: 'https://growing-firefly-50232.upstash.io',
  token: 'AcQ4AAIncDFlYjI2ZWM2ODhmOGQ0N2YwOTI1Njg5ZDA3ZjRjMDdhMHAxNTAyMzI',
});

const Message = {
  send: async (to, text) => {
    const msgData = { text, time: new Date().toISOString() };
    await redis.lpush(`msgs:${to}`, JSON.stringify(msgData));
  },
  get: async (username) => {
    const data = await redis.lrange(`msgs:${username}`, 0, -1);
    return data || [];
  }
};

module.exports = Message;

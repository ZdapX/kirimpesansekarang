
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: 'MASUKKAN_URL_UPSTASH_DISINI',
  token: 'MASUKKAN_TOKEN_UPSTASH_DISINI',
});

const Message = {
  send: async (to, text) => {
    const msgData = { text, time: new Date().toISOString() };
    await redis.lpush(`msgs:${to}`, JSON.stringify(msgData));
  },
  get: async (username) => {
    return await redis.lrange(`msgs:${username}`, 0, -1);
  }
};

module.exports = Message;

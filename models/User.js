
const { Redis } = require('@upstash/redis');

// Paste URL & TOKEN Upstash di sini
const redis = new Redis({
  url: 'MASUKKAN_URL_UPSTASH_DISINI',
  token: 'MASUKKAN_TOKEN_UPSTASH_DISINI',
});

const User = {
  create: async (username, password) => {
    const exists = await redis.get(`user:${username}`);
    if (exists) return false;
    await redis.set(`user:${username}`, password);
    return true;
  },
  login: async (username, password) => {
    const savedPass = await redis.get(`user:${username}`);
    return savedPass === password;
  }
};

module.exports = User;


const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: 'https://growing-firefly-50232.upstash.io',
  token: 'AcQ4AAIncDFlYjI2ZWM2ODhmOGQ0N2YwOTI1Njg5ZDA3ZjRjMDdhMHAxNTAyMzI',
});

const Message = {
  send: async (to, text) => {
    const cleanTo = to.trim().toLowerCase();
    // Simpan langsung sebagai object, Upstash akan otomatis mengurus JSON-nya
    const msgData = { 
      text: text, 
      time: new Date().toISOString() 
    };
    await redis.lpush(`msgs:${cleanTo}`, msgData);
  },
  get: async (username) => {
    const cleanUser = username.trim().toLowerCase();
    const data = await redis.lrange(`msgs:${cleanUser}`, 0, -1);
    return data || [];
  }
};

module.exports = Message;

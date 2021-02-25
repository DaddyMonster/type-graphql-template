import Redis from "ioredis";

const getRedis = () => {
  return new Redis(process.env.REDIS_URI, { password: process.env.REDIS_PW });
};

export default getRedis;

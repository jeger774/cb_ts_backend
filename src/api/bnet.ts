import { request } from 'https';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

export const GetAccessToken = async () => {
  return new Promise<string>((resolve, reject) => {
    const req = request({
      method: 'POST',
      auth: `${CLIENT_ID}:${CLIENT_SECRET}`,
      hostname: 'oauth.battle.net',
      path: '/token?grant_type=client_credentials'
    }, (res) => {
      const chunks: Buffer[] = [];

      res.on('data', (data) => {
        chunks.push(data);
      });

      res.on('end', () => {
        resolve(Buffer.concat(chunks).toString());
      });
    });

    req.on('error', (err) => {
      reject(new Error(err.message));
    });

    req.end();
  });
};

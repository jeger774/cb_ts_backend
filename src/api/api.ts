import { request } from "https";
import { accessToken } from "../cb_api";

const HOST = process.env.API_HOST;
const DATA_URL = '/data/wow';

export interface AuctionData {
  _links: {
    self: {
      href: string;
    }
  };
  connected_realm: {
    href: string;
  };
  auctions: {
    id: number;
    item: {
      id: number;
    };
    bid: number;
    buyout: number;
    quantity: number;
    time_left: string;
  }[];
};

export const PollAuctionHouse = async (region: string, realmId: number, faction: number) => {
  return new Promise<AuctionData>((resolve, reject) => {
    const req = request({
      hostname: `${region}${HOST}`,
      path: `${DATA_URL}/connected-realm/${realmId}/auctions/${faction}?namespace=dynamic-classic-${region}&locale=en_GB`,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }, (res) => {
      const chunks: Buffer[] = [];

      res.on('data', (data: Buffer) => {
        chunks.push(data);
      });

      res.on('end', () => {
        const data = Buffer.concat(chunks).toString();

        try {
          const parsedData = JSON.parse(data);
          if (parsedData) {
            resolve(parsedData);
          } else {
            throw new Error('Incomplete JSON data received');
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
          reject(error);
        }
      });

      res.on('error', (err) => {
        console.error('Error receiving JSON data:', err);
        reject(err);
      });
    });

    req.on('error', (err) => {
      console.error('Error sending request:', err);
      reject(err);
    });

    req.end();
  })
  .catch((err) => {
    console.error('Error fetching auction data:', err);
    process.exit(1);
  });
};

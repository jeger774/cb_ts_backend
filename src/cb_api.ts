import { join } from 'path';
require('dotenv').config({ path: join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import { PollAuctionHouse } from './api/api';
import { GetAccessToken } from './api/bnet';
import { AddAuctions } from './queries/addAuctions';
import { AddItems } from './queries/addItems';
import { GetItemTrends } from './queries/getItemTrends';
import { dbConnect } from './db/connections';
import { Summary } from './db/models/Summary';
import { OptimizedAuction } from './db/models/OptimizedAuction';
import { logger } from './logger/logger';
import { Item } from './db/models/Item';
import { GetItemsByItemId } from './queries/getItem';
import cron from 'node-cron';
import { Op } from 'sequelize';

const app = express();
app.use(cors());
app.use(bodyParser.json());

export let accessToken = '';

const realmsEu = [
  4440, 4441, 4442, 4452, 4453, 4454, 4455, 4456, 4464, 4465, 4466, 4467, 
  4474, 4476, 4477, 4678, 4701, 4703, 4742, 4745, 4749, 4811, 4813, 4815
];
const realmsUs = [
  4384, 4385, 4387, 4388, 4408, 4648, 4726, 4727, 4728, 4731, 4738, 4800
];
const realmsKr = [
  4417, 4419, 4420, 4421, 4840
];
const realmsTw = [
  4485, 4487, 5740, 5741
];
const factions = [2, 6]
const regions = ['eu', 'us', 'kr', 'tw']

const startServer = async () => {
  dbConnect();
  Summary.sync();
  OptimizedAuction.sync();
  Item.sync();

  const tokenObject = await GetAccessToken();
  accessToken = JSON.parse(tokenObject).access_token;

  setInterval(async () => {
    try {
      const startTime = Date.now();
      for (const region of regions) {
        for (const faction of factions) {
          const realms = (region === 'eu') ? realmsEu :
                         (region === 'us') ? realmsUs :
                         (region === 'kr') ? realmsKr :
                         (region === 'tw') ? realmsTw :
                         [];
          for (const realm of realms) {
            console.log(`Polling region ${region}, faction ${faction}, realm ${realm}`);
            const auctionItems = await PollAuctionHouse(region, realm, faction);
            await AddAuctions(auctionItems, region, realm, faction);
            await AddItems(auctionItems, region, realm, faction);
          }
        }
      }
      const endTime = Date.now();
      const elapsedSeconds = (endTime - startTime) / 1000;
      console.log(`Polling complete in ${elapsedSeconds} seconds`);
    } catch (e) {
      logger.error('Failed to poll auctions');
    }
  }, 1000 * 60 * 60 * 3); // every 3 hours
  app.listen(process.env.API_PORT, () => {
    console.log(`API endpoints listening on ${process.env.API_PORT}`);
  });

  try {
    const startTime = Date.now();
    for (const region of regions) {
      for (const faction of factions) {
        const realms = (region === 'eu') ? realmsEu :
                       (region === 'us') ? realmsUs :
                       (region === 'kr') ? realmsKr :
                       (region === 'tw') ? realmsTw :
                       [];
        for (const realm of realms) {
          console.log(`Polling region ${region}, faction ${faction}, realm ${realm}`);
          const auctionItems = await PollAuctionHouse(region, realm, faction);
          await AddAuctions(auctionItems, region, realm, faction);
          await AddItems(auctionItems, region, realm, faction);
        }
      }
    }
    const endTime = Date.now();
    const elapsedSeconds = (endTime - startTime) / 1000;
    console.log(`Polling complete in ${elapsedSeconds} seconds`);
  } catch (e) {
    logger.error('Failed to run initial saves:', e);
  }
};

app.get('/items', async (req, res) => {
  const region = req.query['region'];
  const days = req.query['days'];
  const id = req.query['id'];
  const realmId = req.query['realm'];
  const faction = req.query['faction'];

  if (!days || typeof days !== 'string' || !parseInt(days)
      || !id || typeof id !== 'string' || !parseInt(id)
      || !realmId || typeof realmId !== 'string' || !parseInt(realmId)
      || !faction || typeof faction !== 'string' || !parseInt(faction)
      || !region || typeof region !== 'string') {
    return res.status(400).send();
  } 

  const result = await GetItemsByItemId({ days: parseInt(days), itemId: parseInt(id), realmId: parseInt(realmId), faction: parseInt(faction), region: region });
  return res.json(result);
});

app.get('/item', async (req, res) => {
  const region = req.query['region'];
  const days = req.query['days'];
  const id = req.query['id'];
  const realmId = req.query['realm'];
  const faction = req.query['faction'];

  if (!days || typeof days !== 'string' || !parseInt(days)
      || !id || typeof id !== 'string' || !parseInt(id)
      || !realmId || typeof realmId !== 'string' || !parseInt(realmId)
      || !faction || typeof faction !== 'string' || !parseInt(faction)
      || !region || typeof region !== 'string') {
    return res.status(400).send();
  } 

  const result = await GetItemTrends({ days: parseInt(days), itemId: parseInt(id), realmId: parseInt(realmId), faction: parseInt(faction), region: region });
  return res.json(result);
});

cron.schedule('0 0 * * *', async () => {
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

  await Summary.destroy({
    where: {
      createdAt: {
        [Op.lt]: fiveDaysAgo,
      },
    },
  });

  await OptimizedAuction.destroy({
    where: {
      createdAt: {
        [Op.lt]: fiveDaysAgo,
      },
    },
  });

  await Item.destroy({
    where: {
      createdAt: {
        [Op.lt]: twoDaysAgo,
      },
    },
  });
});


startServer();
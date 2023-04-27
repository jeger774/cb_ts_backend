import { Op } from 'sequelize';
//import { logger } from '../logger/logger';
import { Summary, SummaryInstance } from '../db/models/Summary';

interface CachedQuery {
  days: number;
  obsolete: number;
  result: SummaryInstance[];
};

const cachedQuery: CachedQuery = {
  days: 0,
  result: [],
  obsolete: 0
};

type GetAuctionsDataProps = {
  days: number;
};

export const GetAuctionsData = async ({ days }: GetAuctionsDataProps ) => {
  if (days === cachedQuery.days && Date.now() < cachedQuery.obsolete) {
    //return cachedQuery.result;
  }

  const date = new Date();
  date.setDate(date.getDate() - days);

  console.log(days);

  const start = Date.now();
  const result = await Summary.findAll({
    where: {
      createdAt: {
        [Op.gt]: date
      }
    },
    attributes: [
      'avgPrice',
      'noItems',
      'createdAt'
    ],
    group: [
      'createdAt'
    ]
  });

  //logger.info(`getAuctionsData query took ${Date.now() - start}ms`);

  cachedQuery.days = days;
  cachedQuery.result = result;
  cachedQuery.obsolete = new Date().setMinutes(date.getMinutes() + 30);

  return result;
};

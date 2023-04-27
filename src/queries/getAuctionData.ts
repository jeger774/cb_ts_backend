import { Op } from 'sequelize';
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

type GetAuctionDataProps = {
  days: number;
  id: number;
};

export const GetAuctionData = async ({ days, id }: GetAuctionDataProps ) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const start = Date.now();
  const result = await Summary.findAll({
    where: {
      createdAt: {
        [Op.gt]: date
      },
      id: {
        [Op.gt]: id
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

  cachedQuery.days = days;
  cachedQuery.result = result;
  cachedQuery.obsolete = new Date().setMinutes(date.getMinutes() + 30);

  return result;
};

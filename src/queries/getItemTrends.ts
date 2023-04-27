import { Op, fn, col} from "sequelize";
import { OptimizedAuction } from "../db/models/OptimizedAuction";

type GetItemTrendsProps = {
  itemId: number;
  days: number;
  realmId: number;
  faction: number;
  region: string;
};

export const GetItemTrends = async ({ itemId, days, realmId, faction, region }: GetItemTrendsProps ) => {
  const date = new Date();
  date.setDate(date.getDate() - days);

  const start = Date.now();
  const result = await OptimizedAuction.findAll({
    where: {
      [Op.and]: [
        { itemId },
        { region },
        { createdAt: {
          [Op.gt]: date
        }},
        { realmId },
        { faction }
      ]
    },
    group: [
      'createdAt'
    ],
    attributes: ['minPrice', 'medianPrice', 'noItems', 'createdAt'],
  });

  return result;
};
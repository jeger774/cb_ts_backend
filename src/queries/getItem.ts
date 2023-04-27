import { Op } from 'sequelize';
import { Item } from '../db/models/Item';

type GetItemsByItemIdProps = {
  itemId: number;
  days: number;
  realmId: number;
  faction: number;
  region: string;
};

export const GetItemsByItemId = async ({ itemId, days, realmId, faction, region }: GetItemsByItemIdProps) => {
  const date = new Date();
  date.setDate(date.getDate() - days);

  const items = await Item.findAll({
    where: {
      [Op.and]: [
        { itemId },
        { region }, 
        { createdAt: {
          [Op.gt]: date
        }},
        { realmId },
        { faction },
      ]
    },
  });

  return items;
};
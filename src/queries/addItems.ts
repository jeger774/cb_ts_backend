import { AuctionData } from "../api/api";
import { Item } from "../db/models/Item";
import { logger } from '../logger/logger';

interface ItemData {
  id: number;
  itemId: number;
  buyout: number;
  quantity: number;
  realmId: number;
  faction: number;
  region: string;
}

export const AddItems = async (data: AuctionData, region: string, realmId: number, faction: number) => {
  const itemsStart = Date.now();
  const auctions = data.auctions;
  const formattedData: ItemData[] = auctions.map((auction) => ({
    id: auction.id,
    itemId: auction.item.id,
    buyout: auction.buyout,
    quantity: auction.quantity,
    realmId: realmId,
    faction: faction,
    region: region,
  }));

  const batchSize = 1000;
  const batches = Math.ceil(formattedData.length / batchSize);

  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = (i + 1) * batchSize;
    const itemsToInsert = formattedData.slice(start, end);

    await Item.bulkCreate(itemsToInsert, { ignoreDuplicates: true });
  }


  const itemsEnd = Date.now();
  const duration = itemsEnd - itemsStart; 
  logger.info(`Inserted ${formattedData.length} items in ${duration} ms for realm ${realmId} faction ${faction}`);
  return formattedData.length;
};
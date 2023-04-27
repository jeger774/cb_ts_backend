import { AuctionData } from "../api/api";
import { OptimizedAuction } from "../db/models/OptimizedAuction";
import { Summary } from "../db/models/Summary";
import { logger } from '../logger/logger';


interface ReducedData {
  [key: number]: number[];
};

interface SummarizedData {
  realmId: number;
  faction: number;
  itemId: number;
  minPrice: number;
  medianPrice: number;
  noItems: number;
  region: string;
};

export const AddAuctions = async (data: AuctionData, region: string, realmId: number, faction: number) => {
  const itemsStart = Date.now();
  const auctions = data.auctions;
  const formattedData = auctions.map(auction => ({
    itemId: auction.item.id,
    buyout: auction.buyout / auction.quantity,
  }));

  const reducedDataInit: ReducedData = {};

  const reducedData = formattedData.reduce((prev, current) => {
    if (!prev[current.itemId]) {
      prev[current.itemId] = [];
    }

    prev[current.itemId].push(current.buyout);

    return prev;
  }, reducedDataInit);

  const summarizedData: SummarizedData[] = [];

  Object.keys(reducedData).forEach(key => {
    const prices = reducedData[parseInt(key)];
    const noElements = prices.length;

    const sortedPrices = prices.sort((a, b) => { return a - b });

    summarizedData.push({
      realmId: realmId,
      faction: faction,
      region: region,
      minPrice: sortedPrices[0],
      medianPrice: sortedPrices[Math.floor(noElements / 2)],
      itemId: parseInt(key),
      noItems: noElements
    });
  });

  const result = await OptimizedAuction.bulkCreate(summarizedData);
  logger.info(`New AH record synced, added ${result.length} auctions, took ${Date.now() - itemsStart}ms for realm ${realmId} faction ${faction}`);

  const summaryStart = Date.now();
  const priceSum = formattedData.reduce((sum, current) => sum + current.buyout, 0);
  const noItems = formattedData.length;

  const summaryResult = await Summary.create({
    realmId: realmId,
    faction: faction,
    region: region,
    avgPrice: priceSum / noItems,
    noItems
  });
  logger.info(`New summary(${summaryResult.id}) created, took ${Date.now() - summaryStart}ms for realm ${realmId} faction ${faction}`);
  return result.length;
};
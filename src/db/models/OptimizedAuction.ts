import { sequelize } from "../connections";
import { DataTypes, Model, Optional } from 'sequelize';

interface OptimizedAuctionAttributes {
  id: number;
  itemId: number;
  noItems: number;
  minPrice: number;
  medianPrice: number;
  realmId: number;
  faction: number;
  region: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OptimizedAuctionCreationAttributes
  extends Optional<OptimizedAuctionAttributes, 'id'> {}

export interface OptimizedAuctionInstance
  extends Model<OptimizedAuctionAttributes, OptimizedAuctionCreationAttributes>,
  OptimizedAuctionAttributes {}

export const OptimizedAuction = sequelize.define<OptimizedAuctionInstance>('OptimizedAuction', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  itemId: DataTypes.INTEGER,
  minPrice: DataTypes.INTEGER,
  medianPrice: DataTypes.INTEGER,
  noItems: DataTypes.INTEGER,
  realmId: DataTypes.INTEGER,
  faction: DataTypes.INTEGER,
  region: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  indexes: [
    {
      unique: false,
      fields: ['createdAt', 'itemId', 'realmId', 'faction', 'region', 'minPrice', 'medianPrice', 'noItems'],
      name: 'opt_auct_crtdAt_itmId_rlmId_fctn_rgn_minPrc_medPrc_noItms'
    }
  ]
});

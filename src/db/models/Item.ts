import { sequelize } from "../connections";
import { DataTypes, Model, Optional } from 'sequelize';

interface ItemAttributes {
  id: number;
  itemId: number;
  buyout: number;
  quantity: number;
  realmId: number;
  faction: number;
  region: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ItemCreationAttributes
  extends Optional<ItemAttributes, 'id'> {}

export interface ItemInstance
  extends Model<ItemAttributes, ItemCreationAttributes>,
  ItemAttributes {}

export const Item = sequelize.define<ItemInstance>('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  itemId: DataTypes.INTEGER,
  buyout: DataTypes.INTEGER,
  quantity: DataTypes.INTEGER,
  realmId: DataTypes.INTEGER,
  faction: DataTypes.INTEGER,
  region: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  indexes: [
    {
      unique: false,
      fields: ['itemId', 'realmId', 'faction', 'region', 'createdAt']
    }
  ]
});

import { sequelize } from "../connections";
import { DataTypes, Model, Optional } from 'sequelize';

interface SummaryAttributes {
  id: number;
  avgPrice: number;
  noItems: number;
  realmId: number;
  faction: number;
  region: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SummaryCreationAttributes
  extends Optional<SummaryAttributes, 'id'> {}

export interface SummaryInstance
  extends Model<SummaryAttributes, SummaryCreationAttributes>,
    SummaryAttributes {}

export const Summary = sequelize.define<SummaryInstance>('Summary', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  avgPrice: DataTypes.INTEGER,
  noItems: DataTypes.INTEGER,
  realmId: DataTypes.INTEGER,
  faction: DataTypes.INTEGER,
  region: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE
}, {
  indexes: [
    {
      unique: false,
      fields: ['createdAt', 'id', 'realmId', 'faction', 'region']
    }
  ]
});
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class Site extends Model {}

Site.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    region: { type: DataTypes.STRING(100), allowNull: false },
    latitude: { type: DataTypes.DECIMAL(9, 6), allowNull: false },
    longitude: { type: DataTypes.DECIMAL(9, 6), allowNull: false },
  },
  {
    sequelize,
    modelName: "Site",
    tableName: "sites",
    underscored: true,
    timestamps: true,
  },
);

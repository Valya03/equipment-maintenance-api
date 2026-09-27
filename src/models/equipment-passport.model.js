import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class EquipmentPassport extends Model {}

EquipmentPassport.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    equipment_id: { type: DataTypes.UUID, allowNull: false, unique: true },
    manufacturer: { type: DataTypes.STRING(100), allowNull: false },
    model: { type: DataTypes.STRING(100), allowNull: false },
    rated_power_kw: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    last_verified_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName: "EquipmentPassport",
    tableName: "equipment_passports",
    underscored: true,
    timestamps: true,
  },
);

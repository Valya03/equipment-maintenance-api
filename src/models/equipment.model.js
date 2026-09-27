import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class Equipment extends Model {}

Equipment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    site_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    type: {
      type: DataTypes.ENUM("turbine", "inverter", "sensor", "substation"),
      allowNull: false,
    },
    serial_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM(
        "operational",
        "maintenance",
        "fault",
        "decommissioned",
      ),
      allowNull: false,
      defaultValue: "operational",
    },
    installed_at: { type: DataTypes.DATE, allowNull: false },
    latitude: { type: DataTypes.DECIMAL(9, 6), allowNull: false },
    longitude: { type: DataTypes.DECIMAL(9, 6), allowNull: false },
  },
  {
    sequelize,
    modelName: "Equipment",
    tableName: "equipment",
    underscored: true,
    timestamps: true,
  },
);

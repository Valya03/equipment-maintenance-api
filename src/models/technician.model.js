import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class Technician extends Model {}

Technician.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    full_name: { type: DataTypes.STRING(150), allowNull: false },
    specialization: { type: DataTypes.STRING(100), allowNull: false },
    employee_number: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: "Technician",
    tableName: "technicians",
    underscored: true,
    timestamps: true,
  },
);

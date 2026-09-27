import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class MaintenanceRequest extends Model {}

MaintenanceRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    equipment_id: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("new", "in_progress", "done", "rejected"),
      allowNull: false,
      defaultValue: "new",
    },
    planned_at: { type: DataTypes.DATE, allowNull: true },
    created_by: { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    sequelize,
    modelName: "MaintenanceRequest",
    tableName: "maintenance_requests",
    underscored: true,
    timestamps: true,
  },
);

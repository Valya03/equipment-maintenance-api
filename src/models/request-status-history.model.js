import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class RequestStatusHistory extends Model {}

RequestStatusHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    request_id: { type: DataTypes.UUID, allowNull: false },
    old_status: {
      type: DataTypes.ENUM("new", "in_progress", "done", "rejected"),
      allowNull: true,
    },
    new_status: {
      type: DataTypes.ENUM("new", "in_progress", "done", "rejected"),
      allowNull: false,
    },
    changed_by: { type: DataTypes.STRING(100), allowNull: true },
    comment: { type: DataTypes.TEXT, allowNull: true },
    changed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "RequestStatusHistory",
    tableName: "request_status_history",
    underscored: true,
    timestamps: false, // у этой таблицы нет created_at/updated_at, только changed_at
  },
);

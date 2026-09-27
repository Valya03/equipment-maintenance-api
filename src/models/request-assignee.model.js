import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class RequestAssignee extends Model {}

RequestAssignee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    request_id: { type: DataTypes.UUID, allowNull: false },
    technician_id: { type: DataTypes.UUID, allowNull: false },
    role: {
      type: DataTypes.ENUM("lead", "member"),
      allowNull: false,
    },
    hours: { type: DataTypes.DECIMAL(6, 2), allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: "RequestAssignee",
    tableName: "request_assignees",
    underscored: true,
    timestamps: true,
    updatedAt: false, // у этой таблицы есть только created_at, но нет updated_at
  },
);

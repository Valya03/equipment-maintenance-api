import { sequelize } from "../config/database.js";
import { Site } from "./site.model.js";
import { Equipment } from "./equipment.model.js";
import { EquipmentPassport } from "./equipment-passport.model.js";
import { Technician } from "./technician.model.js";
import { MaintenanceRequest } from "./maintenance-request.model.js";
import { RequestStatusHistory } from "./request-status-history.model.js";
import { RequestAssignee } from "./request-assignee.model.js";

// 1:N  Площадка -> Оборудование
Site.hasMany(Equipment, { foreignKey: "site_id", as: "equipment" });
Equipment.belongsTo(Site, { foreignKey: "site_id", as: "site" });

// 1:1 - Оборудование -> Паспорт
Equipment.hasOne(EquipmentPassport, {
  foreignKey: "equipment_id",
  as: "passport",
});
EquipmentPassport.belongsTo(Equipment, {
  foreignKey: "equipment_id",
  as: "equipment",
});

// 1:N - Оборудование -> Заявки
Equipment.hasMany(MaintenanceRequest, {
  foreignKey: "equipment_id",
  as: "requests",
});
MaintenanceRequest.belongsTo(Equipment, {
  foreignKey: "equipment_id",
  as: "equipment",
});

// 1:N - Заявка -> История статусов
MaintenanceRequest.hasMany(RequestStatusHistory, {
  foreignKey: "request_id",
  as: "history",
});
RequestStatusHistory.belongsTo(MaintenanceRequest, {
  foreignKey: "request_id",
  as: "request",
});

// N:M - Заявки <-> Специалисты
MaintenanceRequest.belongsToMany(Technician, {
  through: RequestAssignee,
  foreignKey: "request_id",
  otherKey: "technician_id",
  as: "assignees",
});
Technician.belongsToMany(MaintenanceRequest, {
  through: RequestAssignee,
  foreignKey: "technician_id",
  otherKey: "request_id",
  as: "requests",
});

// Прямые ассоциации для связующей таблицы (для явной работы)
RequestAssignee.belongsTo(MaintenanceRequest, {
  foreignKey: "request_id",
  as: "request",
});
RequestAssignee.belongsTo(Technician, {
  foreignKey: "technician_id",
  as: "technician",
});
MaintenanceRequest.hasMany(RequestAssignee, {
  foreignKey: "request_id",
  as: "assignments",
});
Technician.hasMany(RequestAssignee, {
  foreignKey: "technician_id",
  as: "assignments",
});

export const models = {
  Site,
  Equipment,
  EquipmentPassport,
  Technician,
  MaintenanceRequest,
  RequestStatusHistory,
  RequestAssignee,
  sequelize,
};

export { sequelize };

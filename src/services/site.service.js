import { siteRepository } from "../repositories/site.repository.js";
import { sequelize } from "../config/database.js";
import { NotFoundError } from "../errors/NotFoundError.js";

export class SiteService {
  async getSummary(siteId) {
    const site = await siteRepository.findById(siteId);
    if (!site) {
      throw new NotFoundError(`Площадка с id ${siteId} не найдена`);
    }

    // Количество заявок по статусам
    const byStatusRows = await sequelize.models.MaintenanceRequest.findAll({
      attributes: [
        "status",
        [
          sequelize.fn("COUNT", sequelize.col("MaintenanceRequest.id")),
          "count",
        ],
      ],
      include: [
        {
          association: "equipment",
          attributes: [],
          where: { site_id: siteId },
        },
      ],
      group: ["MaintenanceRequest.status"],
      raw: true,
    });

    const byStatus = {};
    for (const row of byStatusRows) {
      byStatus[row.status] = parseInt(row.count, 10);
    }

    // Количество заявок по приоритетам
    const byPriorityRows = await sequelize.models.MaintenanceRequest.findAll({
      attributes: [
        "priority",
        [
          sequelize.fn("COUNT", sequelize.col("MaintenanceRequest.id")),
          "count",
        ],
      ],
      include: [
        {
          association: "equipment",
          attributes: [],
          where: { site_id: siteId },
        },
      ],
      group: ["MaintenanceRequest.priority"],
      raw: true,
    });

    const byPriority = {};
    for (const row of byPriorityRows) {
      byPriority[row.priority] = parseInt(row.count, 10);
    }

    // Среднее время закрытия (done) в часах
    const [avgRow] = await sequelize.query(
      `
      SELECT AVG(EXTRACT(EPOCH FROM (mr.updated_at - mr.created_at)) / 3600) AS avg_hours
      FROM maintenance_requests mr
      JOIN equipment e ON e.id = mr.equipment_id
      WHERE e.site_id = :siteId AND mr.status = 'done'
      `,
      {
        replacements: { siteId },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    const avgCloseHours = avgRow?.avg_hours
      ? Number(parseFloat(avgRow.avg_hours).toFixed(2))
      : null;

    return {
      siteId,
      site: {
        id: site.id,
        name: site.name,
        code: site.code,
        region: site.region,
      },
      requestsByStatus: byStatus,
      requestsByPriority: byPriority,
      averageCloseHours: avgCloseHours,
    };
  }
}

export const siteService = new SiteService();

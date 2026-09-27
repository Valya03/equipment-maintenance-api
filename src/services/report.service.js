import { sequelize } from "../config/database.js";
import { ValidationError } from "../errors/ValidationError.js";

export class ReportService {
  async getEquipmentLoad(query) {
    // Валидация параметров
    const minRequests =
      query.minRequests !== undefined ? parseInt(query.minRequests, 10) : 0;

    if (isNaN(minRequests) || minRequests < 0) {
      throw new ValidationError("Некорректное значение minRequests", [
        { field: "minRequests", message: "Должно быть целое число >= 0" },
      ]);
    }

    const params = {
      minRequests,
      dateFrom: query.dateFrom || null,
      dateTo: query.dateTo || null,
    };

    // Прямой SQL с JOIN, GROUP BY, HAVING (параметризованный)
    const rows = await sequelize.query(
      `
      SELECT
        e.id                                          AS equipment_id,
        e.name                                        AS equipment_name,
        e.serial_number                               AS serial_number,
        e.type                                        AS equipment_type,
        COUNT(mr.id)                                  AS total_requests,
        COUNT(mr.id) FILTER (WHERE mr.status = 'done') AS done_requests,
        COALESCE(SUM(ra.hours), 0)                    AS total_hours,
        MAX(mr.updated_at) FILTER (WHERE mr.status = 'done') AS last_service_at
      FROM equipment e
      LEFT JOIN maintenance_requests mr
        ON mr.equipment_id = e.id
        AND (:dateFrom::timestamp IS NULL OR mr.created_at >= :dateFrom::timestamp)
        AND (:dateTo::timestamp   IS NULL OR mr.created_at <= :dateTo::timestamp)
      LEFT JOIN request_assignees ra
        ON ra.request_id = mr.id
      GROUP BY e.id, e.name, e.serial_number, e.type
      HAVING COUNT(mr.id) >= :minRequests
      ORDER BY total_requests DESC, e.name ASC
      `,
      {
        replacements: params,
        type: sequelize.QueryTypes.SELECT,
      },
    );

    return rows.map((r) => ({
      equipmentId: r.equipment_id,
      equipmentName: r.equipment_name,
      serialNumber: r.serial_number,
      equipmentType: r.equipment_type,
      totalRequests: parseInt(r.total_requests, 10),
      doneRequests: parseInt(r.done_requests, 10),
      totalHours: Number(parseFloat(r.total_hours).toFixed(2)),
      lastServiceAt: r.last_service_at,
    }));
  }
}

export const reportService = new ReportService();

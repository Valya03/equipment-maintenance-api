import { Site } from "../models/site.model.js";
import { BaseRepository } from "./base.repository.js";

export class SiteRepository extends BaseRepository {
  constructor() {
    super(Site);
  }

  _toApiFormat(instance) {
    if (!instance) return null;
    const plain = instance.get({ plain: true });
    return {
      id: plain.id,
      name: plain.name,
      code: plain.code,
      region: plain.region,
      location: {
        lat: Number(plain.latitude),
        lon: Number(plain.longitude),
      },
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }
}

export const siteRepository = new SiteRepository();

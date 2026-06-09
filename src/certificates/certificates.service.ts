import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CertificatesService {
  constructor(private readonly dataSource: DataSource) {}

  async getStats() {
    const totalCertificates = await this.dataSource.query(
      `SELECT COUNT(*)::int as count FROM certificates`,
    );

    const trendData = await this.dataSource.query(
      `SELECT 
         COUNT(CASE WHEN issued_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)::int as current_month,
         COUNT(CASE WHEN issued_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND issued_at < DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)::int as prev_month
       FROM certificates`,
    );

    const current = trendData[0]?.current_month || 0;
    const prev = trendData[0]?.prev_month || 0;
    const trend =
      prev === 0
        ? current > 0
          ? 100
          : 0
        : Math.round(((current - prev) / prev) * 100);

    return {
      total: totalCertificates[0]?.count || 0,
      trend,
    };
  }
}

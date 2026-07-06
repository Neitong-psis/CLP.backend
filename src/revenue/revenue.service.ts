import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

function computeTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

@Injectable()
export class RevenueService {
  constructor(private readonly dataSource: DataSource) {}

  async getStats() {
    const [periods] = await this.dataSource.query(
      `SELECT
         COALESCE(SUM(CASE WHEN e.enrolled_at >= CURRENT_DATE - INTERVAL '12 months' THEN c.price END), 0)::float as current_annual,
         COALESCE(SUM(CASE WHEN e.enrolled_at >= CURRENT_DATE - INTERVAL '24 months' AND e.enrolled_at < CURRENT_DATE - INTERVAL '12 months' THEN c.price END), 0)::float as prev_annual,
         COALESCE(SUM(CASE WHEN e.enrolled_at >= DATE_TRUNC('month', CURRENT_DATE) THEN c.price END), 0)::float as current_month,
         COALESCE(SUM(CASE WHEN e.enrolled_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND e.enrolled_at < DATE_TRUNC('month', CURRENT_DATE) THEN c.price END), 0)::float as prev_month,
         COUNT(*) FILTER (WHERE e.enrolled_at >= DATE_TRUNC('month', CURRENT_DATE))::int as current_month_orders,
         COUNT(*) FILTER (WHERE e.enrolled_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND e.enrolled_at < DATE_TRUNC('month', CURRENT_DATE))::int as prev_month_orders
       FROM enrollments e
       JOIN courses c ON e.course_id = c.course_id`,
    );

    const currentMonthAov =
      periods.current_month_orders > 0
        ? periods.current_month / periods.current_month_orders
        : 0;
    const prevMonthAov =
      periods.prev_month_orders > 0
        ? periods.prev_month / periods.prev_month_orders
        : 0;

    return {
      annualRevenue: periods.current_annual,
      annualRevenueTrend: computeTrend(
        periods.current_annual,
        periods.prev_annual,
      ),
      thisMonth: periods.current_month,
      thisMonthTrend: computeTrend(periods.current_month, periods.prev_month),
      // No subscription billing exists on this platform — MRR is reported as
      // an alias of the current month's course-sale revenue.
      monthlyRecurringRevenue: periods.current_month,
      monthlyRecurringRevenueTrend: computeTrend(
        periods.current_month,
        periods.prev_month,
      ),
      averageOrderValue: currentMonthAov,
      averageOrderValueTrend: computeTrend(currentMonthAov, prevMonthAov),
    };
  }

  async getMonthly() {
    const rows = await this.dataSource.query(
      `WITH months AS (
         SELECT DATE_TRUNC('month', m)::date as month_start
         FROM generate_series(
           CURRENT_DATE - INTERVAL '11 months',
           CURRENT_DATE,
           '1 month'::interval
         ) m
       )
       SELECT
         TO_CHAR(m.month_start, 'Mon') as month_name,
         COALESCE((
           SELECT SUM(c.price)
           FROM enrollments e
           JOIN courses c ON e.course_id = c.course_id
           WHERE e.enrolled_at >= m.month_start
             AND e.enrolled_at < m.month_start + INTERVAL '1 month'
         ), 0)::float as revenue
       FROM months m
       ORDER BY m.month_start ASC`,
    );

    return {
      months: rows.map((row) => row.month_name),
      amounts: rows.map((row) => row.revenue),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly dataSource: DataSource) {}

  async getStats() {
    const totalEnrollments = await this.dataSource.query(
      `SELECT COUNT(*)::int as count FROM enrollments`,
    );

    const trendData = await this.dataSource.query(
      `SELECT 
         COUNT(CASE WHEN enrolled_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)::int as current_month,
         COUNT(CASE WHEN enrolled_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND enrolled_at < DATE_TRUNC('month', CURRENT_DATE) THEN 1 END)::int as prev_month
       FROM enrollments`,
    );

    const revenueStats = await this.dataSource.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN e.enrolled_at >= DATE_TRUNC('month', CURRENT_DATE) THEN c.price END), 0)::float as current_revenue,
         COALESCE(SUM(CASE WHEN e.enrolled_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND e.enrolled_at < DATE_TRUNC('month', CURRENT_DATE) THEN c.price END), 0)::float as prev_revenue
       FROM enrollments e 
       JOIN courses c ON e.course_id = c.course_id`,
    );

    const currentEnrollments = trendData[0]?.current_month || 0;
    const prevEnrollments = trendData[0]?.prev_month || 0;
    const enrollmentsTrend =
      prevEnrollments === 0
        ? currentEnrollments > 0
          ? 100
          : 0
        : Math.round(
            ((currentEnrollments - prevEnrollments) / prevEnrollments) * 100,
          );

    const currentRev = revenueStats[0]?.current_revenue || 0;
    const prevRev = revenueStats[0]?.prev_revenue || 0;
    const revenueTrend =
      prevRev === 0
        ? currentRev > 0
          ? 100
          : 0
        : Math.round(((currentRev - prevRev) / prevRev) * 100);

    return {
      total: totalEnrollments[0]?.count || 0,
      trend: enrollmentsTrend,
      monthlyRevenue: {
        value: currentRev,
        trend: revenueTrend,
        month: new Date().toLocaleString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      },
    };
  }

  async findByStudent(studentId: string) {
    return this.dataSource.query(
      `SELECT 
        e.enrollment_id as id,
        e.status,
        e.enrolled_at,
        c.course_id as courseId,
        c.title,
        c.thumbnail,
        c.subtitle,
        c.level,
        c.duration
       FROM enrollments e
       JOIN courses c ON e.course_id = c.course_id
       WHERE e.student_id = $1
       ORDER BY e.enrolled_at DESC`,
      [studentId],
    );
  }

  async getAnalytics() {
    const analyticsData = await this.dataSource.query(
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
         (SELECT COUNT(*)::int FROM enrollments e WHERE e.enrolled_at <= m.month_start + INTERVAL '1 month' - INTERVAL '1 second') as enrollments_count
       FROM months m
       ORDER BY m.month_start ASC`,
    );

    return {
      months: analyticsData.map((row) => row.month_name),
      growth: analyticsData.map((row) => row.enrollments_count),
    };
  }
}

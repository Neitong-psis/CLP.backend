import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { CourseEntity } from './course.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Entity({
  name: 'course_reviews',
})
export class CourseReviewEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid', { name: 'review_id' })
  id: string;

  @ManyToOne(() => CourseEntity, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: CourseEntity;

  @ManyToOne(() => UserEntity, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: UserEntity;

  @Column({ type: 'varchar', length: 50 })
  status: 'approved' | 'rejected';

  @Column({ type: 'text', nullable: true })
  feedback?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

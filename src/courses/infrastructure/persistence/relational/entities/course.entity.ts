import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { CategoryEntity } from '../../../../../categories/infrastructure/persistence/relational/entities/category.entity';

@Entity({
  name: 'courses',
})
export class CourseEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid', { name: 'course_id' })
  id: string;

  @ManyToOne(() => UserEntity, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'instructor_id' })
  instructor: UserEntity;

  @ManyToOne(() => CategoryEntity, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category?: CategoryEntity | null;

  @Column({ type: String })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  price: number;

  @Column({ type: String, nullable: true })
  thumbnail?: string | null;

  @Column({ type: 'boolean', name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any> | null;
}

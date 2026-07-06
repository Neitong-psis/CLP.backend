import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { CategoryEntity } from '../../../../../categories/infrastructure/persistence/relational/entities/category.entity';
import { ModuleEntity } from './module.entity';
import { CourseStatusEnum } from '../../../../course-status.enum';

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

  @ManyToOne(() => UserEntity, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: UserEntity | null;

  @ManyToOne(() => UserEntity, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'assigned_by_id' })
  assignedBy?: UserEntity | null;

  @ManyToOne(() => CategoryEntity, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category?: CategoryEntity | null;

  @Column({ type: String, length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'numeric', precision: 18, scale: 2, default: 0 })
  price: number;

  @Column({ type: String, length: 500, nullable: true })
  thumbnail?: string | null;

  @Column({
    type: 'enum',
    enum: CourseStatusEnum,
    default: CourseStatusEnum.TODO,
  })
  status: CourseStatusEnum;

  @Column({ type: 'timestamp', nullable: true, name: 'due_date' })
  dueDate?: Date | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  priority?: string | null;

  @Column({ type: String, length: 255, nullable: true })
  slug?: string | null;

  @Column({ type: String, length: 255, nullable: true })
  subtitle?: string | null;

  @Column({ type: String, length: 50, nullable: true })
  level?: string | null;

  @Column({ type: String, length: 100, nullable: true })
  duration?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  tags?: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any> | null;

  @OneToMany(() => ModuleEntity, (module) => module.course)
  modules?: ModuleEntity[];
}

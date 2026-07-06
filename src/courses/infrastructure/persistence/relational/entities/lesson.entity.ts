import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ModuleEntity } from './module.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'lessons',
})
export class LessonEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid', { name: 'lesson_id' })
  id: string;

  @Column({ name: 'module_id', type: 'uuid' })
  moduleId: string;

  @ManyToOne(() => ModuleEntity, (module) => module.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'module_id' })
  module: ModuleEntity;

  @Column({ type: String, length: 500 })
  title: string;

  @Column({ name: 'content_type', type: String, length: 100 })
  contentType: string;

  @Column({ type: String, length: 500, nullable: true })
  content?: string | null;

  @Column({ name: 'video_duration_seconds', type: 'integer', default: 0 })
  videoDurationSeconds: number;

  @Column({ name: 'order_index', type: 'integer', default: 0 })
  orderIndex: number;

  @Column({ name: 'is_free', type: 'boolean', default: false })
  isFree: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

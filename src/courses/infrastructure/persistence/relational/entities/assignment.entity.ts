import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { LessonEntity } from './lesson.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'assignments',
})
export class AssignmentEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid', { name: 'assignment_id' })
  id: string;

  @Column({ name: 'lesson_id', type: 'uuid' })
  lessonId: string;

  @ManyToOne(() => LessonEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: LessonEntity;

  @Column({ type: String, length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate?: Date | null;

  @Column({
    name: 'max_score',
    type: 'numeric',
    precision: 8,
    scale: 2,
    default: 100,
  })
  maxScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

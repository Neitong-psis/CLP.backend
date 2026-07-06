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
  name: 'quizzes',
})
export class QuizEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid', { name: 'quiz_id' })
  id: string;

  @Column({ name: 'lesson_id', type: 'uuid' })
  lessonId: string;

  @ManyToOne(() => LessonEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: LessonEntity;

  @Column({ type: String, length: 255 })
  title: string;

  @Column({ name: 'time_limit_minutes', type: 'integer', nullable: true })
  timeLimitMinutes?: number | null;

  @Column({
    name: 'passing_score',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 60,
  })
  passingScore: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqEntity } from '../../../../faqs/infrastructure/persistence/relational/entities/faq.entity';

@Injectable()
export class FaqSeedService {
  constructor(
    @InjectRepository(FaqEntity)
    private readonly repository: Repository<FaqEntity>,
  ) {}

  async run() {
    const faqs = [
      {
        question: 'What is CLP?',
        answer:
          'CLP is a premium Content Learning Platform offering structured, guided courses designed to help learners gain practical, real-world skills.',
        sortOrder: 1,
      },
      {
        question: 'How long do I have access to a course?',
        answer:
          'Once you enroll in a course, you get lifetime access to all lessons, resources, quizzes, and future updates.',
        sortOrder: 2,
      },
      {
        question: 'Are there any certificates upon completion?',
        answer:
          'Yes! You will receive a verifiable digital completion certificate once you finish all lessons and pass the final course quizzes.',
        sortOrder: 3,
      },
    ];

    for (const faq of faqs) {
      const count = await this.repository.count({
        where: { question: faq.question },
      });

      if (!count) {
        await this.repository.save(
          this.repository.create({
            question: faq.question,
            answer: faq.answer,
            sortOrder: faq.sortOrder,
            isActive: true,
          }),
        );
      }
    }
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../../../categories/infrastructure/persistence/relational/entities/category.entity';

@Injectable()
export class CategorySeedService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly repository: Repository<CategoryEntity>,
  ) {}

  async run() {
    const categories = [
      { name: 'Java', slug: 'java', sortOrder: 1 },
      { name: 'HTML', slug: 'html', sortOrder: 2 },
      { name: 'CSS', slug: 'css', sortOrder: 3 },
      { name: 'JavaScript', slug: 'javascript', sortOrder: 4 },
      { name: 'UI/UX Design', slug: 'ui-ux-design', sortOrder: 5 },
      {
        name: 'Frontend Development',
        slug: 'frontend-development',
        sortOrder: 6,
      },
      { name: 'Graphic Design', slug: 'graphic-design', sortOrder: 7 },
      { name: 'Database', slug: 'database', sortOrder: 8 },
      { name: 'AWS Cloud', slug: 'aws-cloud', sortOrder: 9 },
      { name: 'Python', slug: 'python', sortOrder: 10 },
      { name: 'AI & Business', slug: 'ai-business', sortOrder: 11 },
    ];

    for (const cat of categories) {
      const count = await this.repository.count({
        where: { slug: cat.slug },
      });

      if (!count) {
        await this.repository.save(
          this.repository.create({
            name: cat.name,
            slug: cat.slug,
            sortOrder: cat.sortOrder,
            isActive: true,
          }),
        );
      }
    }
  }
}

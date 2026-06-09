import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './infrastructure/persistence/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './domain/category';
import { IPaginationOptions } from '../utils/types/pagination-options';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryRepository.create({
      name: createCategoryDto.name,
      slug: createCategoryDto.slug,
      description: createCategoryDto.description ?? null,
      thumbnail: createCategoryDto.thumbnail ?? null,
      parentCategoryId: createCategoryDto.parentCategoryId ?? null,
      path: createCategoryDto.path ?? null,
      sortOrder: createCategoryDto.sortOrder ?? 0,
      isActive: createCategoryDto.isActive ?? true,
    });
  }

  async findManyWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<Category[]> {
    return this.categoryRepository.findManyWithPagination({
      paginationOptions,
    });
  }

  async findOne(id: Category['id']): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async findBySlug(slug: Category['slug']): Promise<Category> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }
    return category;
  }

  async update(
    id: Category['id'],
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const updated = await this.categoryRepository.update(id, updateCategoryDto);
    if (!updated) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: Category['id']): Promise<void> {
    await this.categoryRepository.remove(id);
  }
}

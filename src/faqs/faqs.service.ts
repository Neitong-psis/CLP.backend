import { Injectable, NotFoundException } from '@nestjs/common';
import { FaqRepository } from './infrastructure/persistence/faq.repository';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Faq } from './domain/faq';
import { IPaginationOptions } from '../utils/types/pagination-options';

@Injectable()
export class FaqsService {
  constructor(private readonly faqRepository: FaqRepository) {}

  async create(createFaqDto: CreateFaqDto): Promise<Faq> {
    return this.faqRepository.create({
      question: createFaqDto.question,
      answer: createFaqDto.answer,
      sortOrder: createFaqDto.sortOrder ?? 0,
      isActive: createFaqDto.isActive ?? true,
    });
  }

  async findManyWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<Faq[]> {
    return this.faqRepository.findManyWithPagination({
      paginationOptions,
    });
  }

  async findOne(id: Faq['id']): Promise<Faq> {
    const faq = await this.faqRepository.findById(id);
    if (!faq) {
      throw new NotFoundException(`Faq with ID ${id} not found`);
    }
    return faq;
  }

  async update(id: Faq['id'], updateFaqDto: UpdateFaqDto): Promise<Faq> {
    const updated = await this.faqRepository.update(id, updateFaqDto);
    if (!updated) {
      throw new NotFoundException(`Faq with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: Faq['id']): Promise<void> {
    await this.faqRepository.remove(id);
  }
}

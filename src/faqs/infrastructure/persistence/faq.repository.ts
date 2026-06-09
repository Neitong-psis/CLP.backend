import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Faq } from '../../domain/faq';
import { DeepPartial } from '../../../utils/types/deep-partial.type';

export abstract class FaqRepository {
  abstract create(data: Omit<Faq, 'id' | 'createdAt'>): Promise<Faq>;

  abstract findManyWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Faq[]>;

  abstract findById(id: Faq['id']): Promise<NullableType<Faq>>;

  abstract update(
    id: Faq['id'],
    payload: DeepPartial<Faq>,
  ): Promise<Faq | null>;

  abstract remove(id: Faq['id']): Promise<void>;
}

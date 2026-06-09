import { ApiProperty } from '@nestjs/swagger';

export class Category {
  @ApiProperty({
    type: String,
    description: 'Unique UUID for the category',
  })
  id: string;

  @ApiProperty({
    type: String,
    example: 'Business Leadership',
  })
  name: string;

  @ApiProperty({
    type: String,
    example: 'business-leadership',
  })
  slug: string;

  @ApiProperty({
    type: String,
    example: 'Courses teaching core business and strategic leadership skills.',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    type: String,
    example: 'https://example.com/thumbnails/business.png',
    required: false,
  })
  thumbnail?: string | null;

  @ApiProperty({
    type: String,
    description: 'UUID of the parent category if it is a subcategory',
    required: false,
  })
  parentCategoryId?: string | null;

  @ApiProperty({
    type: String,
    description:
      'Hierarchical path representing category hierarchy (e.g. /1/5/)',
    required: false,
  })
  path?: string | null;

  @ApiProperty({
    type: Number,
    example: 0,
  })
  sortOrder: number;

  @ApiProperty({
    type: Boolean,
    example: true,
  })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}

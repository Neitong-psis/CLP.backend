import { ApiProperty } from '@nestjs/swagger';

export class Faq {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: 'What is this platform about?',
  })
  question: string;

  @ApiProperty({
    type: String,
    example: 'It is a content learning platform for business and leadership.',
  })
  answer: string;

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

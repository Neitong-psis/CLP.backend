import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from '../../../../courses/infrastructure/persistence/relational/entities/course.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { CategoryEntity } from '../../../../categories/infrastructure/persistence/relational/entities/category.entity';

@Injectable()
export class CourseSeedService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async run() {
    const instructor = await this.userRepository.findOne({
      where: { email: 'jane.smith@example.com' },
    });

    if (!instructor) {
      console.warn('Instructor Jane Smith not found. Skipping course seeding.');
      return;
    }

    const [
      frontendCat,
      aiCat,
      uiuxCat,
      javaCat,
      pythonCat,
      jsCat,
      cssCat,
      awsCat,
      dbCat,
      graphicCat,
    ] = await Promise.all([
      this.categoryRepository.findOne({
        where: { slug: 'frontend-development' },
      }),
      this.categoryRepository.findOne({ where: { slug: 'ai-business' } }),
      this.categoryRepository.findOne({ where: { slug: 'ui-ux-design' } }),
      this.categoryRepository.findOne({ where: { slug: 'java' } }),
      this.categoryRepository.findOne({ where: { slug: 'python' } }),
      this.categoryRepository.findOne({ where: { slug: 'javascript' } }),
      this.categoryRepository.findOne({ where: { slug: 'css' } }),
      this.categoryRepository.findOne({ where: { slug: 'aws-cloud' } }),
      this.categoryRepository.findOne({ where: { slug: 'database' } }),
      this.categoryRepository.findOne({ where: { slug: 'graphic-design' } }),
    ]);

    const courses = [
      {
        title: 'Complete Web Development Bootcamp',
        description:
          'Learn HTML, CSS, JavaScript, React basics, and guided portfolio projects through structured modules.',
        price: 29.99,
        thumbnail:
          'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&auto=format&fit=crop&q=60',
        category: frontendCat,
        isPublished: true,
        meta: {
          rating: 4.8,
          studentsCount: 234567,
          level: 'Beginner',
          hours: 52,
          sections: [
            {
              id: 's1',
              title: 'HTML & CSS Foundations',
              lessons: [
                {
                  id: 'l1',
                  title: 'Intro to Web Development',
                  type: 'video',
                  duration: '12:30',
                  videoId: 'UB1O30fR-EE',
                },
                {
                  id: 'l2',
                  title: 'HTML Structure & Elements',
                  type: 'video',
                  duration: '18:45',
                  videoId: 'PkZNo7MFNFg',
                },
                {
                  id: 'l3',
                  title: 'HTML Quiz',
                  type: 'quiz',
                  duration: '10 min',
                },
              ],
            },
            {
              id: 's2',
              title: 'CSS & Layouts',
              lessons: [
                {
                  id: 'l4',
                  title: 'CSS Fundamentals',
                  type: 'video',
                  duration: '15:20',
                  videoId: 'rfscVS0vtbw',
                },
                {
                  id: 'l5',
                  title: 'Flexbox & Grid',
                  type: 'video',
                  duration: '22:10',
                  videoId: 'W6NZfCO5SIk',
                },
                {
                  id: 'l6',
                  title: 'Responsive Design',
                  type: 'video',
                  duration: '19:05',
                  videoId: 'yfoY53QXEnI',
                },
                {
                  id: 'l7',
                  title: 'CSS Quiz',
                  type: 'quiz',
                  duration: '15 min',
                },
              ],
            },
            {
              id: 's3',
              title: 'JavaScript Basics',
              lessons: [
                {
                  id: 'l8',
                  title: 'JavaScript Fundamentals',
                  type: 'video',
                  duration: '25:40',
                  videoId: 'Ke90Tje7VS0',
                },
                {
                  id: 'l9',
                  title: 'DOM Manipulation',
                  type: 'video',
                  duration: '20:15',
                  videoId: 'OtZJbNh77d0',
                },
                {
                  id: 'l10',
                  title: 'JavaScript Quiz',
                  type: 'quiz',
                  duration: '20 min',
                },
              ],
            },
          ],
        },
      },
      {
        title: 'AI Productivity for Office Teams',
        description:
          'Use AI for documents, meetings, workflow planning, and daily team productivity with safer habits.',
        price: 19.99,
        thumbnail:
          'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=60',
        category: aiCat,
        isPublished: true,
        meta: {
          rating: 4.9,
          studentsCount: 18240,
          level: 'Intermediate',
          hours: 18,
          sections: [
            {
              id: 's1',
              title: 'Introduction to AI Tools',
              lessons: [
                {
                  id: 'l1',
                  title: 'What is Generative AI?',
                  type: 'video',
                  duration: '8:45',
                  videoId: 'UB1O30fR-EE',
                },
                {
                  id: 'l2',
                  title: 'ChatGPT for Work',
                  type: 'video',
                  duration: '14:20',
                  videoId: 'PkZNo7MFNFg',
                },
                {
                  id: 'l3',
                  title: 'AI Tools Quiz',
                  type: 'quiz',
                  duration: '10 min',
                },
              ],
            },
            {
              id: 's2',
              title: 'AI for Documents & Writing',
              lessons: [
                {
                  id: 'l4',
                  title: 'AI Writing Assistants',
                  type: 'video',
                  duration: '11:30',
                  videoId: 'rfscVS0vtbw',
                },
                {
                  id: 'l5',
                  title: 'Summarizing with AI',
                  type: 'video',
                  duration: '9:15',
                  videoId: 'W6NZfCO5SIk',
                },
                {
                  id: 'l6',
                  title: 'AI Document Review',
                  type: 'video',
                  duration: '13:00',
                  videoId: 'yfoY53QXEnI',
                },
                {
                  id: 'l7',
                  title: 'Documents Quiz',
                  type: 'quiz',
                  duration: '15 min',
                },
              ],
            },
            {
              id: 's3',
              title: 'AI Workflow Integration',
              lessons: [
                {
                  id: 'l8',
                  title: 'Automating Tasks with AI',
                  type: 'video',
                  duration: '16:50',
                  videoId: 'Ke90Tje7VS0',
                },
                {
                  id: 'l9',
                  title: 'AI Safety & Best Practices',
                  type: 'video',
                  duration: '12:35',
                  videoId: 'OtZJbNh77d0',
                },
                {
                  id: 'l10',
                  title: 'Workflow Quiz',
                  type: 'quiz',
                  duration: '15 min',
                },
              ],
            },
          ],
        },
      },
      {
        title: 'UI/UX Design Essentials',
        description:
          'Learn practical UI and UX methods, Figma workflows, design systems, and interface documentation.',
        price: 49.99,
        thumbnail:
          'https://images.unsplash.com/photo-1561070791-26c113006238?w=600&auto=format&fit=crop&q=60',
        category: uiuxCat,
        isPublished: true,
        meta: {
          rating: 4.6,
          studentsCount: 98765,
          level: 'Beginner',
          hours: 24,
          sections: [
            {
              id: 's1',
              title: 'Design Fundamentals',
              lessons: [
                {
                  id: 'l1',
                  title: 'Introduction to UI/UX',
                  type: 'video',
                  duration: '10:00',
                  videoId: 'UB1O30fR-EE',
                },
                {
                  id: 'l2',
                  title: 'Core Design Principles',
                  type: 'video',
                  duration: '16:30',
                  videoId: 'PkZNo7MFNFg',
                },
                {
                  id: 'l3',
                  title: 'Design Basics Quiz',
                  type: 'quiz',
                  duration: '10 min',
                },
              ],
            },
            {
              id: 's2',
              title: 'Figma Fundamentals',
              lessons: [
                {
                  id: 'l4',
                  title: 'Getting Started with Figma',
                  type: 'video',
                  duration: '14:45',
                  videoId: 'rfscVS0vtbw',
                },
                {
                  id: 'l5',
                  title: 'Components & Variants',
                  type: 'video',
                  duration: '18:20',
                  videoId: 'W6NZfCO5SIk',
                },
                {
                  id: 'l6',
                  title: 'Design Systems',
                  type: 'video',
                  duration: '21:10',
                  videoId: 'yfoY53QXEnI',
                },
                {
                  id: 'l7',
                  title: 'Figma Quiz',
                  type: 'quiz',
                  duration: '15 min',
                },
              ],
            },
            {
              id: 's3',
              title: 'Advanced UX Methods',
              lessons: [
                {
                  id: 'l8',
                  title: 'User Research Methods',
                  type: 'video',
                  duration: '17:00',
                  videoId: 'Ke90Tje7VS0',
                },
                {
                  id: 'l9',
                  title: 'Prototyping & Testing',
                  type: 'video',
                  duration: '19:45',
                  videoId: 'OtZJbNh77d0',
                },
                {
                  id: 'l10',
                  title: 'UX Final Assessment',
                  type: 'quiz',
                  duration: '20 min',
                },
              ],
            },
          ],
        },
      },
      {
        title: 'Java Programming Masterclass',
        description:
          'Master Java from fundamentals to OOP, collections, streams, exception handling, and Spring Boot basics.',
        price: 39.99,
        thumbnail:
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60',
        category: javaCat,
        isPublished: true,
        meta: {
          rating: 4.7,
          studentsCount: 87432,
          level: 'Intermediate',
          hours: 42,
          sections: [
            {
              id: 's1',
              title: 'Java Fundamentals',
              lessons: [
                {
                  id: 'l1',
                  title: 'Introduction to Java',
                  type: 'video',
                  duration: '10:20',
                  videoId: 'UB1O30fR-EE',
                },
                {
                  id: 'l2',
                  title: 'Variables & Data Types',
                  type: 'video',
                  duration: '14:30',
                  videoId: 'PkZNo7MFNFg',
                },
                {
                  id: 'l3',
                  title: 'Control Flow',
                  type: 'video',
                  duration: '12:50',
                  videoId: 'rfscVS0vtbw',
                },
                {
                  id: 'l4',
                  title: 'Java Basics Quiz',
                  type: 'quiz',
                  duration: '10 min',
                },
              ],
            },
            {
              id: 's2',
              title: 'Object-Oriented Programming',
              lessons: [
                {
                  id: 'l5',
                  title: 'Classes & Objects',
                  type: 'video',
                  duration: '18:45',
                  videoId: 'W6NZfCO5SIk',
                },
                {
                  id: 'l6',
                  title: 'Inheritance & Polymorphism',
                  type: 'video',
                  duration: '22:10',
                  videoId: 'yfoY53QXEnI',
                },
                {
                  id: 'l7',
                  title: 'Interfaces & Abstract Classes',
                  type: 'video',
                  duration: '16:30',
                  videoId: 'Ke90Tje7VS0',
                },
                {
                  id: 'l8',
                  title: 'OOP Quiz',
                  type: 'quiz',
                  duration: '15 min',
                },
              ],
            },
            {
              id: 's3',
              title: 'Collections & Streams',
              lessons: [
                {
                  id: 'l9',
                  title: 'Java Collections Framework',
                  type: 'video',
                  duration: '20:15',
                  videoId: 'OtZJbNh77d0',
                },
                {
                  id: 'l10',
                  title: 'Streams & Lambda Expressions',
                  type: 'video',
                  duration: '24:40',
                  videoId: 'UB1O30fR-EE',
                },
                {
                  id: 'l11',
                  title: 'Collections Assessment',
                  type: 'quiz',
                  duration: '20 min',
                },
              ],
            },
          ],
        },
      },
      {
        title: 'Python for Data Science & ML',
        description:
          'Build real data pipelines using Python, Pandas, NumPy, Matplotlib, and scikit-learn from the ground up.',
        price: 34.99,
        thumbnail:
          'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=60',
        category: pythonCat,
        isPublished: true,
        meta: {
          rating: 4.8,
          studentsCount: 156789,
          level: 'Beginner',
          hours: 36,
          sections: [
            {
              id: 's1',
              title: 'Python Basics',
              lessons: [
                {
                  id: 'l1',
                  title: 'Introduction to Python',
                  type: 'video',
                  duration: '9:15',
                  videoId: 'PkZNo7MFNFg',
                },
                {
                  id: 'l2',
                  title: 'Data Structures in Python',
                  type: 'video',
                  duration: '17:30',
                  videoId: 'rfscVS0vtbw',
                },
                {
                  id: 'l3',
                  title: 'Functions & Modules',
                  type: 'video',
                  duration: '13:40',
                  videoId: 'W6NZfCO5SIk',
                },
                {
                  id: 'l4',
                  title: 'Python Basics Quiz',
                  type: 'quiz',
                  duration: '10 min',
                },
              ],
            },
            {
              id: 's2',
              title: 'Data Analysis with Pandas',
              lessons: [
                {
                  id: 'l5',
                  title: 'NumPy Arrays & Operations',
                  type: 'video',
                  duration: '16:20',
                  videoId: 'yfoY53QXEnI',
                },
                {
                  id: 'l6',
                  title: 'Pandas DataFrames',
                  type: 'video',
                  duration: '21:45',
                  videoId: 'Ke90Tje7VS0',
                },
                {
                  id: 'l7',
                  title: 'Data Cleaning & Wrangling',
                  type: 'video',
                  duration: '19:00',
                  videoId: 'OtZJbNh77d0',
                },
                {
                  id: 'l8',
                  title: 'Pandas Quiz',
                  type: 'quiz',
                  duration: '15 min',
                },
              ],
            },
            {
              id: 's3',
              title: 'Machine Learning Intro',
              lessons: [
                {
                  id: 'l9',
                  title: 'Data Visualization with Matplotlib',
                  type: 'video',
                  duration: '14:55',
                  videoId: 'UB1O30fR-EE',
                },
                {
                  id: 'l10',
                  title: 'Intro to scikit-learn',
                  type: 'video',
                  duration: '23:10',
                  videoId: 'PkZNo7MFNFg',
                },
                {
                  id: 'l11',
                  title: 'ML Final Assessment',
                  type: 'quiz',
                  duration: '20 min',
                },
              ],
            },
          ],
        },
      },
      {
        title: 'Modern JavaScript: ES6 to ES2024',
        description:
          'Deep-dive into modern JavaScript — arrow functions, promises, async/await, modules, and the latest language features.',
        price: 24.99,
        thumbnail:
          'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&auto=format&fit=crop&q=60',
        category: jsCat,
        isPublished: true,
        meta: {
          rating: 4.9,
          studentsCount: 203456,
          level: 'Intermediate',
          hours: 28,
          sections: [
            {
              id: 's1',
              title: 'ES6 Core Features',
              lessons: [
                {
                  id: 'l1',
                  title: 'Let, Const & Scope',
                  type: 'video',
                  duration: '11:10',
                  videoId: 'Ke90Tje7VS0',
                },
                {
                  id: 'l2',
                  title: 'Arrow Functions & this',
                  type: 'video',
                  duration: '13:25',
                  videoId: 'OtZJbNh77d0',
                },
                {
                  id: 'l3',
                  title: 'Destructuring & Spread',
                  type: 'video',
                  duration: '15:40',
                  videoId: 'UB1O30fR-EE',
                },
                {
                  id: 'l4',
                  title: 'ES6 Quiz',
                  type: 'quiz',
                  duration: '10 min',
                },
              ],
            },
            {
              id: 's2',
              title: 'Async JavaScript',
              lessons: [
                {
                  id: 'l5',
                  title: 'Promises & the Event Loop',
                  type: 'video',
                  duration: '19:30',
                  videoId: 'PkZNo7MFNFg',
                },
                {
                  id: 'l6',
                  title: 'Async / Await',
                  type: 'video',
                  duration: '16:00',
                  videoId: 'rfscVS0vtbw',
                },
                {
                  id: 'l7',
                  title: 'Fetch API & Error Handling',
                  type: 'video',
                  duration: '14:50',
                  videoId: 'W6NZfCO5SIk',
                },
                {
                  id: 'l8',
                  title: 'Async Quiz',
                  type: 'quiz',
                  duration: '15 min',
                },
              ],
            },
            {
              id: 's3',
              title: 'Modern Patterns & ES2024',
              lessons: [
                {
                  id: 'l9',
                  title: 'ES Modules & Bundlers',
                  type: 'video',
                  duration: '17:15',
                  videoId: 'yfoY53QXEnI',
                },
                {
                  id: 'l10',
                  title: 'Optional Chaining & Nullish Coalescing',
                  type: 'video',
                  duration: '10:30',
                  videoId: 'Ke90Tje7VS0',
                },
                {
                  id: 'l11',
                  title: 'Modern JS Final Quiz',
                  type: 'quiz',
                  duration: '20 min',
                },
              ],
            },
          ],
        },
      },
      {
        title: 'Advanced CSS & Web Animations',
        description:
          'Master CSS architecture, custom properties, keyframe animations, scroll-driven effects, and 3D transforms.',
        price: 19.99,
        thumbnail:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=60',
        category: cssCat,
        isPublished: true,
        meta: {
          rating: 4.6,
          studentsCount: 45678,
          level: 'Intermediate',
          hours: 16,
          sections: [
            {
              id: 's1',
              title: 'CSS Architecture',
              lessons: [
                {
                  id: 'l1',
                  title: 'CSS Custom Properties',
                  type: 'video',
                  duration: '12:00',
                  videoId: 'rfscVS0vtbw',
                },
                {
                  id: 'l2',
                  title: 'BEM & CSS Methodologies',
                  type: 'video',
                  duration: '10:45',
                  videoId: 'W6NZfCO5SIk',
                },
                {
                  id: 'l3',
                  title: 'Architecture Quiz',
                  type: 'quiz',
                  duration: '10 min',
                },
              ],
            },
            {
              id: 's2',
              title: 'Animations & Transitions',
              lessons: [
                {
                  id: 'l4',
                  title: 'CSS Transitions',
                  type: 'video',
                  duration: '9:30',
                  videoId: 'yfoY53QXEnI',
                },
                {
                  id: 'l5',
                  title: 'Keyframe Animations',
                  type: 'video',
                  duration: '16:20',
                  videoId: 'Ke90Tje7VS0',
                },
                {
                  id: 'l6',
                  title: 'Scroll-Driven Animations',
                  type: 'video',
                  duration: '14:10',
                  videoId: 'OtZJbNh77d0',
                },
                {
                  id: 'l7',
                  title: 'Animation Quiz',
                  type: 'quiz',
                  duration: '15 min',
                },
              ],
            },
            {
              id: 's3',
              title: 'Advanced Layouts & 3D',
              lessons: [
                {
                  id: 'l8',
                  title: 'CSS Grid Advanced',
                  type: 'video',
                  duration: '18:55',
                  videoId: 'UB1O30fR-EE',
                },
                {
                  id: 'l9',
                  title: 'CSS 3D Transforms',
                  type: 'video',
                  duration: '13:35',
                  videoId: 'PkZNo7MFNFg',
                },
                {
                  id: 'l10',
                  title: 'CSS Final Assessment',
                  type: 'quiz',
                  duration: '20 min',
                },
              ],
            },
          ],
        },
      },
      {
        title: 'AWS Solutions Architect Associate',
        description:
          'Prepare for the AWS SAA-C03 exam. Covers compute, storage, networking, databases, security, and architecture patterns.',
        price: 59.99,
        thumbnail:
          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60',
        category: awsCat,
        isPublished: true,
        meta: {
          rating: 4.8,
          studentsCount: 112345,
          level: 'Advanced',
          hours: 45,
          sections: [
            {
              id: 's1',
              title: 'Cloud & IAM Fundamentals',
              lessons: [
                {
                  id: 'l1',
                  title: 'AWS Global Infrastructure',
                  type: 'video',
                  duration: '11:00',
                  videoId: 'UB1O30fR-EE',
                },
                {
                  id: 'l2',
                  title: 'IAM: Users, Roles & Policies',
                  type: 'video',
                  duration: '19:25',
                  videoId: 'PkZNo7MFNFg',
                },
                {
                  id: 'l3',
                  title: 'IAM Quiz',
                  type: 'quiz',
                  duration: '10 min',
                },
              ],
            },
            {
              id: 's2',
              title: 'Core AWS Services',
              lessons: [
                {
                  id: 'l4',
                  title: 'EC2, Auto Scaling & ELB',
                  type: 'video',
                  duration: '24:30',
                  videoId: 'rfscVS0vtbw',
                },
                {
                  id: 'l5',
                  title: 'S3 & Storage Services',
                  type: 'video',
                  duration: '21:15',
                  videoId: 'W6NZfCO5SIk',
                },
                {
                  id: 'l6',
                  title: 'RDS, DynamoDB & Caching',
                  type: 'video',
                  duration: '22:40',
                  videoId: 'yfoY53QXEnI',
                },
                {
                  id: 'l7',
                  title: 'Core Services Quiz',
                  type: 'quiz',
                  duration: '20 min',
                },
              ],
            },
            {
              id: 's3',
              title: 'Architecture Best Practices',
              lessons: [
                {
                  id: 'l8',
                  title: 'VPC, Security Groups & Networking',
                  type: 'video',
                  duration: '26:00',
                  videoId: 'Ke90Tje7VS0',
                },
                {
                  id: 'l9',
                  title: 'Serverless & Event-Driven Patterns',
                  type: 'video',
                  duration: '18:50',
                  videoId: 'OtZJbNh77d0',
                },
                {
                  id: 'l10',
                  title: 'SAA Practice Exam',
                  type: 'quiz',
                  duration: '30 min',
                },
              ],
            },
          ],
        },
      },
      {
        title: 'Database Design & PostgreSQL',
        description:
          'Design relational schemas, write advanced SQL queries, optimize indexes, and manage PostgreSQL in production.',
        price: 29.99,
        thumbnail:
          'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=60',
        category: dbCat,
        isPublished: true,
        meta: {
          rating: 4.7,
          studentsCount: 67890,
          level: 'Beginner',
          hours: 22,
          sections: [
            {
              id: 's1',
              title: 'Relational Database Fundamentals',
              lessons: [
                {
                  id: 'l1',
                  title: 'What is a Relational Database?',
                  type: 'video',
                  duration: '8:20',
                  videoId: 'UB1O30fR-EE',
                },
                {
                  id: 'l2',
                  title: 'Tables, Keys & Relationships',
                  type: 'video',
                  duration: '14:10',
                  videoId: 'PkZNo7MFNFg',
                },
                {
                  id: 'l3',
                  title: 'Normalisation (1NF–3NF)',
                  type: 'video',
                  duration: '12:35',
                  videoId: 'rfscVS0vtbw',
                },
                {
                  id: 'l4',
                  title: 'Schema Design Quiz',
                  type: 'quiz',
                  duration: '10 min',
                },
              ],
            },
            {
              id: 's2',
              title: 'SQL Mastery',
              lessons: [
                {
                  id: 'l5',
                  title: 'SELECT, WHERE & Aggregates',
                  type: 'video',
                  duration: '18:00',
                  videoId: 'W6NZfCO5SIk',
                },
                {
                  id: 'l6',
                  title: 'JOINs: Inner, Left, Right, Full',
                  type: 'video',
                  duration: '20:45',
                  videoId: 'yfoY53QXEnI',
                },
                {
                  id: 'l7',
                  title: 'Subqueries & CTEs',
                  type: 'video',
                  duration: '16:30',
                  videoId: 'Ke90Tje7VS0',
                },
                {
                  id: 'l8',
                  title: 'SQL Quiz',
                  type: 'quiz',
                  duration: '15 min',
                },
              ],
            },
            {
              id: 's3',
              title: 'PostgreSQL in Practice',
              lessons: [
                {
                  id: 'l9',
                  title: 'Indexes & Query Planning',
                  type: 'video',
                  duration: '15:20',
                  videoId: 'OtZJbNh77d0',
                },
                {
                  id: 'l10',
                  title: 'Transactions & ACID',
                  type: 'video',
                  duration: '11:55',
                  videoId: 'UB1O30fR-EE',
                },
                {
                  id: 'l11',
                  title: 'PostgreSQL Final Assessment',
                  type: 'quiz',
                  duration: '20 min',
                },
              ],
            },
          ],
        },
      },
      {
        title: 'Graphic Design Fundamentals',
        description:
          'Master typography, colour theory, layout composition, and brand identity using Figma and industry best practices.',
        price: 22.99,
        thumbnail:
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=60',
        category: graphicCat,
        isPublished: true,
        meta: {
          rating: 4.8,
          studentsCount: 34567,
          level: 'Beginner',
          hours: 18,
          sections: [
            {
              id: 's1',
              title: 'Design Principles',
              lessons: [
                {
                  id: 'l1',
                  title: 'Colour Theory Essentials',
                  type: 'video',
                  duration: '11:30',
                  videoId: 'PkZNo7MFNFg',
                },
                {
                  id: 'l2',
                  title: 'Typography & Hierarchy',
                  type: 'video',
                  duration: '14:00',
                  videoId: 'rfscVS0vtbw',
                },
                {
                  id: 'l3',
                  title: 'Composition & Grid Systems',
                  type: 'video',
                  duration: '12:20',
                  videoId: 'W6NZfCO5SIk',
                },
                {
                  id: 'l4',
                  title: 'Design Principles Quiz',
                  type: 'quiz',
                  duration: '10 min',
                },
              ],
            },
            {
              id: 's2',
              title: 'Figma for Graphic Design',
              lessons: [
                {
                  id: 'l5',
                  title: 'Figma Interface & Tools',
                  type: 'video',
                  duration: '13:45',
                  videoId: 'yfoY53QXEnI',
                },
                {
                  id: 'l6',
                  title: 'Vector Shapes & Pen Tool',
                  type: 'video',
                  duration: '16:10',
                  videoId: 'Ke90Tje7VS0',
                },
                {
                  id: 'l7',
                  title: 'Exporting & Handoff',
                  type: 'video',
                  duration: '9:50',
                  videoId: 'OtZJbNh77d0',
                },
                {
                  id: 'l8',
                  title: 'Figma Quiz',
                  type: 'quiz',
                  duration: '10 min',
                },
              ],
            },
            {
              id: 's3',
              title: 'Brand Identity Projects',
              lessons: [
                {
                  id: 'l9',
                  title: 'Logo Design Workflow',
                  type: 'video',
                  duration: '19:00',
                  videoId: 'UB1O30fR-EE',
                },
                {
                  id: 'l10',
                  title: 'Building a Brand Style Guide',
                  type: 'video',
                  duration: '17:25',
                  videoId: 'PkZNo7MFNFg',
                },
                {
                  id: 'l11',
                  title: 'Brand Identity Final Project',
                  type: 'quiz',
                  duration: '20 min',
                },
              ],
            },
          ],
        },
      },
    ];

    for (const course of courses) {
      const existing = await this.courseRepository.findOne({
        where: { title: course.title },
      });

      if (!existing) {
        await this.courseRepository.save(
          this.courseRepository.create({
            title: course.title,
            description: course.description,
            price: course.price,
            thumbnail: course.thumbnail,
            category: course.category,
            instructor: instructor,
            isPublished: course.isPublished,
            meta: course.meta,
          }),
        );
      } else if (!existing.meta?.sections) {
        await this.courseRepository.save({ ...existing, meta: course.meta });
      }
    }
  }
}

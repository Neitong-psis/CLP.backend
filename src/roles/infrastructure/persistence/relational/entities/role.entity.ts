import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'user_roles',
})
export class RoleEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid', { name: 'role_id' })
  id: string;

  @Column({ type: String, length: 100, name: 'role_name' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;
}

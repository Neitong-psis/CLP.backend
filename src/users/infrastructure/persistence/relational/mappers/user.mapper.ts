import { FileMapper } from '../../../../../files/infrastructure/persistence/relational/mappers/file.mapper';
import { RoleEntity } from '../../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { User } from '../../../../domain/user';
import { UserEntity } from '../entities/user.entity';
import { FileEntity } from '../../../../../files/infrastructure/persistence/relational/entities/file.entity';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';

export class UserMapper {
  static toDomain(raw: UserEntity): User {
    const domainEntity = new User();
    domainEntity.id = raw.id;
    domainEntity.email = raw.email;
    domainEntity.passwordHash = raw.passwordHash;
    domainEntity.firstName = raw.firstName;
    domainEntity.lastName = raw.lastName;
    domainEntity.photo = raw.photo ? FileMapper.toDomain(raw.photo) : null;
    domainEntity.socialId = raw.socialId;
    domainEntity.provider = raw.provider;
    domainEntity.roles = raw.roles;
    domainEntity.status = raw.status;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: User): UserEntity {
    let roles: RoleEntity[] = [];
    if (domainEntity.roles && domainEntity.roles.length > 0) {
      roles = domainEntity.roles.map((role) => {
        const roleEntity = new RoleEntity();
        roleEntity.id = role.id;
        return roleEntity;
      });
    }

    let photo: FileEntity | undefined | null = undefined;
    if (domainEntity.photo) {
      photo = new FileEntity();
      photo.id = domainEntity.photo.id;
      photo.path = domainEntity.photo.path;
    } else if (domainEntity.photo === null) {
      photo = null;
    }

    let status: StatusEntity | undefined = undefined;
    if (domainEntity.status) {
      status = new StatusEntity();
      status.id = Number(domainEntity.status.id);
      status.name = domainEntity.status.name;
    }

    const persistenceEntity = new UserEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.email = domainEntity.email;
    persistenceEntity.passwordHash = domainEntity.passwordHash;
    persistenceEntity.firstName = domainEntity.firstName;
    persistenceEntity.lastName = domainEntity.lastName;
    persistenceEntity.photo = photo;
    persistenceEntity.socialId = domainEntity.socialId;
    persistenceEntity.provider = domainEntity.provider;
    persistenceEntity.roles = roles;
    persistenceEntity.status = status;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.deletedAt = domainEntity.deletedAt;
    return persistenceEntity;
  }
}

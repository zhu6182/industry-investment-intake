import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async findAll() {
    const roles = await this.roleRepository.find({
      relations: { permissions: true },
      order: { id: 'ASC' },
    });
    return roles.map((r) => this.serialize(r));
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true },
    });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    return this.serialize(role);
  }

  async create(dto: { code: string; name: string; description?: string; dataScope?: 'self' | 'team' | 'region' | 'all'; permissionIds?: number[] }) {
    const existing = await this.roleRepository.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException('角色编码已存在');
    }
    const role = this.roleRepository.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      dataScope: dto.dataScope || 'self',
    });
    if (dto.permissionIds?.length) {
      role.permissions = await this.permissionRepository.findBy({ id: In(dto.permissionIds) });
    }
    const saved = await this.roleRepository.save(role);
    return this.serialize(saved);
  }

  async update(id: number, dto: { name?: string; description?: string; dataScope?: 'self' | 'team' | 'region' | 'all' }) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    Object.assign(role, dto);
    const saved = await this.roleRepository.save(role);
    return this.serialize(saved);
  }

  async remove(id: number) {
    const role = await this.roleRepository.findOne({ where: { id }, relations: { users: true } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    if (role.users?.length) {
      throw new ConflictException('该角色下还有用户，无法删除');
    }
    await this.roleRepository.remove(role);
    return { success: true };
  }

  async assignPermissions(id: number, permissionIds: number[]) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true },
    });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    role.permissions = await this.permissionRepository.findBy({ id: In(permissionIds) });
    const saved = await this.roleRepository.save(role);
    return this.serialize(saved);
  }

  async getAllPermissions() {
    return this.permissionRepository.find({
      order: { module: 'ASC', code: 'ASC' },
    });
  }

  serialize(role: Role) {
    return {
      id: role.id,
      code: role.code,
      name: role.name,
      description: role.description,
      dataScope: role.dataScope,
      permissions: role.permissions?.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        module: p.module,
      })) || [],
    };
  }
}

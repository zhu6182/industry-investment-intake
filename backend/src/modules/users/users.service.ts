import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(query: { page?: number; limit?: number; keyword?: string; roleId?: number; regionId?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.userRepository.createQueryBuilder('u');
    qb.leftJoinAndSelect('u.roles', 'r');
    qb.leftJoinAndSelect('u.region', 'region');

    if (query.keyword) {
      qb.andWhere('(u.phone LIKE :kw OR u.name LIKE :kw)', { kw: `%${query.keyword}%` });
    }
    if (query.regionId) {
      qb.andWhere('u.regionId = :regionId', { regionId: query.regionId });
    }
    if (query.roleId) {
      qb.andWhere('r.id = :roleId', { roleId: query.roleId });
    }

    qb.orderBy('u.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [list, total] = await qb.getManyAndCount();

    return {
      list: list.map((u) => this.serialize(u)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { roles: { permissions: true }, region: true },
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return this.serialize(user);
  }

  async create(dto: { phone: string; password: string; name: string; email?: string; regionId?: number; roleIds?: number[] }) {
    const existing = await this.userRepository.findOne({ where: { phone: dto.phone } });
    if (existing) {
      throw new ConflictException('手机号已注册');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      phone: dto.phone,
      password: hashed,
      name: dto.name,
      email: dto.email,
      regionId: dto.regionId,
      isActive: true,
    });

    if (dto.roleIds?.length) {
      const roles = await this.roleRepository.findBy({ id: In(dto.roleIds) });
      user.roles = roles;
    }

    const saved = await this.userRepository.save(user);
    return this.serialize(saved);
  }

  async update(id: number, dto: { name?: string; email?: string; avatar?: string; regionId?: number; isActive?: boolean; roleIds?: number[] }) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (dto.roleIds !== undefined) {
      const roles = await this.roleRepository.findBy({ id: In(dto.roleIds) });
      user.roles = roles;
    }

    const updatable: any = { ...dto };
    delete updatable.roleIds;
    Object.assign(user, updatable);

    const saved = await this.userRepository.save(user);
    return this.serialize(saved);
  }

  async softDelete(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    user.isActive = false;
    await this.userRepository.save(user);
    return { success: true };
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    await this.userRepository.remove(user);
    return { success: true };
  }

  async assignRoles(id: number, roleIds: number[]) {
    const user = await this.userRepository.findOne({ where: { id }, relations: { roles: true } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    const roles = await this.roleRepository.findBy({ id: In(roleIds) });
    user.roles = roles;
    const saved = await this.userRepository.save(user);
    return this.serialize(saved);
  }

  async resetPassword(id: number, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    return { success: true };
  }

  async findInvestmentStaff() {
    const staffRole = await this.roleRepository.findOne({
      where: { code: 'investment_staff' },
    });
    if (!staffRole) {
      return [];
    }

    const users = await this.userRepository
      .createQueryBuilder('u')
      .innerJoin('u.roles', 'r')
      .where('r.id = :roleId', { roleId: staffRole.id })
      .andWhere('u.isActive = :isActive', { isActive: true })
      .orderBy('u.name', 'ASC')
      .getMany();

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      phone: u.phone,
    }));
  }

  async findByRoleCodes(codes: string[]) {
    const users = await this.userRepository
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.roles', 'r')
      .where('r.code IN (:...codes)', { codes })
      .andWhere('u.isActive = :isActive', { isActive: true })
      .orderBy('u.name', 'ASC')
      .getMany();
    return users.map((u) => this.serialize(u));
  }

  serialize(user: User) {
    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isActive: user.isActive,
      regionId: user.regionId,
      region: user.region,
      roles: user.roles?.map((r) => ({ id: r.id, code: r.code, name: r.name })) || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

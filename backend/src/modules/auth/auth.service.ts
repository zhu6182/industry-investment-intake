import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException('手机号已注册');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      phone: dto.phone,
      password: hashed,
      name: dto.name,
      email: dto.email,
    });

    const memberRole = await this.roleRepository.findOne({
      where: { code: 'channel_specialist' },
    });
    if (memberRole) {
      user.roles = [memberRole];
    }

    const saved = await this.userRepository.save(user);
    return this.generateToken(saved);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { phone: dto.phone },
      relations: { roles: { permissions: true } },
    });
    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    return this.generateToken(user);
  }

  async generateToken(user: User) {
    const payload = { sub: user.id, phone: user.phone };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        regionId: user.regionId,
        roles: user.roles?.map((r) => ({ id: r.id, code: r.code, name: r.name, dataScope: r.dataScope })) || [],
        permissions: this.extractPermissions(user),
      },
    };
  }

  extractPermissions(user: User): string[] {
    const perms = new Set<string>();
    user.roles?.forEach((role) => {
      role.permissions?.forEach((p) => perms.add(p.code));
    });
    return Array.from(perms);
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { roles: { permissions: true }, region: true },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      regionId: user.regionId,
      roles: user.roles?.map((r) => ({ id: r.id, code: r.code, name: r.name, dataScope: r.dataScope })) || [],
      permissions: this.extractPermissions(user),
    };
  }
}

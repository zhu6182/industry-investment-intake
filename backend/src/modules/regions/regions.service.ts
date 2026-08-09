import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from '../../entities/region.entity';

export interface RegionTreeNode extends Region {
  children: RegionTreeNode[];
}

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(Region)
    private regionRepo: Repository<Region>,
  ) {}

  async findAll(): Promise<Region[]> {
    return this.regionRepo.find({
      order: { level: 'ASC', id: 'ASC' },
    });
  }

  async findTree(): Promise<RegionTreeNode[]> {
    const all = await this.regionRepo.find({
      order: { level: 'ASC', id: 'ASC' },
    });

    const map = new Map<number, RegionTreeNode>();
    for (const r of all) {
      map.set(r.id, { ...(r as any), children: [] });
    }

    const roots: RegionTreeNode[] = [];
    for (const node of map.values()) {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async findChildren(parentId: number): Promise<Region[]> {
    return this.regionRepo.find({
      where: { parentId: parentId as any },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Region> {
    const region = await this.regionRepo.findOne({ where: { id } });
    if (!region) throw new NotFoundException('区域不存在');
    return region;
  }

  async create(dto: { name: string; level: number; parentId?: number | null }): Promise<Region> {
    const region = new Region();
    region.name = dto.name;
    region.level = dto.level;
    region.parentId = dto.parentId ?? null;
    return this.regionRepo.save(region);
  }

  async update(id: number, dto: { name?: string; level?: number; parentId?: number | null }): Promise<Region> {
    const region = await this.findOne(id);
    Object.assign(region, dto);
    return this.regionRepo.save(region);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const region = await this.findOne(id);
    const children = await this.regionRepo.count({ where: { parentId: id as any } });
    if (children > 0) {
      throw new Error('存在子区域，无法删除');
    }
    await this.regionRepo.remove(region);
    return { success: true };
  }

  async findByLevel(level: number): Promise<Region[]> {
    return this.regionRepo.find({
      where: { level },
      order: { id: 'ASC' },
    });
  }
}

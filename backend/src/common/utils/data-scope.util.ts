import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

export interface UserWithRoles {
  id: number;
  regionId?: number | null;
  roles?: Array<{ code: string; dataScope: 'self' | 'team' | 'region' | 'all' }>;
}

function getUserDataScope(user: UserWithRoles): 'self' | 'team' | 'region' | 'all' {
  const scopes = user.roles?.map((r) => r.dataScope) || [];
  if (scopes.includes('all')) return 'all';
  if (scopes.includes('region')) return 'region';
  if (scopes.includes('team')) return 'team';
  return 'self';
}

/**
 * 通用数据范围过滤
 * @param qb 查询构造器
 * @param user 当前登录用户（含 roles）
 * @param alias 主表别名，默认 'entity'
 * @param options 可选配置
 *   - createdByColumn: 创建人字段名（默认 'createdBy'）
 *   - regionColumn: 区域字段名（默认 'regionId'）
 *   - teamMemberIds: team scope 时，团队成员 ID 列表
 */
export function applyDataScope<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  user: UserWithRoles,
  alias = 'entity',
  options: {
    createdByColumn?: string;
    regionColumn?: string;
    teamMemberIds?: number[];
  } = {},
): SelectQueryBuilder<T> {
  const scope = getUserDataScope(user);
  const createdByCol = options.createdByColumn || 'createdBy';
  const regionCol = options.regionColumn || 'regionId';

  if (scope === 'all') {
    return qb;
  }

  if (scope === 'self') {
    qb.andWhere(`${alias}.${createdByCol} = :currentUserId`, {
      currentUserId: user.id,
    });
    return qb;
  }

  if (scope === 'team') {
    const teamIds = options.teamMemberIds && options.teamMemberIds.length
      ? options.teamMemberIds
      : [user.id];
    qb.andWhere(`${alias}.${createdByCol} IN (:...teamIds)`, { teamIds });
    return qb;
  }

  // region
  if (user.regionId) {
    qb.andWhere(`${alias}.${regionCol} = :userRegionId`, {
      userRegionId: user.regionId,
    });
  } else {
    // 无 region 时降级为 self
    qb.andWhere(`${alias}.${createdByCol} = :currentUserId`, {
      currentUserId: user.id,
    });
  }
  return qb;
}

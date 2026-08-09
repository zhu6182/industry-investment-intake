"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyDataScope = applyDataScope;
function getUserDataScope(user) {
    const scopes = user.roles?.map((r) => r.dataScope) || [];
    if (scopes.includes('all'))
        return 'all';
    if (scopes.includes('region'))
        return 'region';
    if (scopes.includes('team'))
        return 'team';
    return 'self';
}
function applyDataScope(qb, user, alias = 'entity', options = {}) {
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
    if (user.regionId) {
        qb.andWhere(`${alias}.${regionCol} = :userRegionId`, {
            userRegionId: user.regionId,
        });
    }
    else {
        qb.andWhere(`${alias}.${createdByCol} = :currentUserId`, {
            currentUserId: user.id,
        });
    }
    return qb;
}
//# sourceMappingURL=data-scope.util.js.map
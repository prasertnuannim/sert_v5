using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;

namespace Server.Features.Roles;

public sealed class RoleQueryService(AppDbContext db)
{
    public async Task<IReadOnlyList<RoleResponseDto>> GetAllAsync(
        CancellationToken cancellationToken) =>
        await db.Roles
            .AsNoTracking()
            .OrderBy(role => role.Level)
            .Select(role => new RoleResponseDto(
                role.Name,
                role.DisplayName,
                role.Description,
                role.Level))
            .ToListAsync(cancellationToken);
}

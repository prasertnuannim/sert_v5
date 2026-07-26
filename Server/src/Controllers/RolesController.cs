using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs;
using Server.Security;

namespace Server.Controllers;

[ApiController]
[Authorize(Policy = AccessPolicies.UserAdministration)]
[Route("api/roles")]
public sealed class RolesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<RoleResponse>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var roles = await db.Roles
            .AsNoTracking()
            .OrderBy(x => x.Level)
            .Select(x => new RoleResponse(
                x.Name,
                x.DisplayName,
                x.Description,
                x.Level))
            .ToListAsync(cancellationToken);

        return Ok(roles);
    }
}

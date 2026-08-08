using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Server.DTOs;
using Server.Security;

namespace Server.Features.Roles;

[ApiController]
[Authorize(Policy = AccessPoliciesSecurity.UserAdministration)]
[Route("api/roles")]
public sealed class RolesController(RoleQueryService roles) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<RoleResponseDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await roles.GetAllAsync(cancellationToken));
    }
}

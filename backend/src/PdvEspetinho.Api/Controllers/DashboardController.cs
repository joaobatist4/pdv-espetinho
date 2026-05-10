using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PdvEspetinho.QueryStack.Queries.Dashboard;

namespace PdvEspetinho.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController(GetDashboardQuery getDashboardQuery) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string period = "hoje", CancellationToken ct = default)
    {
        var dashboard = await getDashboardQuery.ExecuteAsync(period, ct);
        return Ok(dashboard);
    }
}

using Microsoft.AspNetCore.Mvc;
using Splitzy.Database;
using Splitzy.Services;

namespace RetroKits.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SmartSearchController : ControllerBase
    {
        private readonly SmartSearchService _smartSearchService;

        // Inyección de dependencia para SmartSearchService
        public SmartSearchController(SmartSearchService smartSearchService)
        {
            _smartSearchService = smartSearchService;
        }

        // Endpoint para realizar búsqueda con filtro y ordenación
        [HttpGet]
        public ActionResult<IEnumerable<User>> Search([FromQuery] string? query, [FromQuery] string option = "none", [FromQuery] int page = 1, [FromQuery] int pageSize = 3)
        {
            var (products, totalPages) = _smartSearchService.Search(query);

            Response.Headers.Add("X-Total-Count", totalPages.ToString());
            Response.Headers.Add("Access-Control-Expose-Headers", "X-Total-Count");

            return Ok(products);
        }
    }
}

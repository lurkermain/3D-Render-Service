using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Practice.Configuration;
using Practice.Models;

namespace Practice.Controllers
{
    [ApiController]
    [Route("api/modeltypes")]
    public class ModelTypesController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var modelTypes = await _context.ModelTypes.ToListAsync();
            return Ok(modelTypes);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] string name)
        {
            var modelType = new ModelTypes { Name = name };
            _context.ModelTypes.Add(modelType);
            await _context.SaveChangesAsync();
            return Ok(modelType);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] string name)
        {
            var modelType = await _context.ModelTypes.FindAsync(id);
            if (modelType == null)
            {
                return NotFound();
            }

            modelType.Name = name;
            _context.Entry(modelType).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var modelType = await _context.ModelTypes.FindAsync(id);
            if (modelType == null) return NotFound();

            _context.ModelTypes.Remove(modelType);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

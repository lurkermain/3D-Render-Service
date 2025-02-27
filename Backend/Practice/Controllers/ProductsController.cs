using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Practice.Configuration;
using Practice.Enums;
using Practice.Helpers;
using Practice.Models;

namespace Practice.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductsController(ApplicationDbContext context, ILogger<ProductsController> logger) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ILogger<ProductsController> _logger = logger;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _context.Products
                .Include(p => p.ModelType) // Включаем связанные данные
                .Select(p => new ProductUrl
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    ModelType = p.ModelType.Name, // Используем имя типа модели
                    ImageUrl = Url.Action("GetImage", new { id = p.Id })
                })
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.ModelType) // Включаем связанные данные
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            var productDto = new ProductUrl
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                ModelType = product.ModelType.Name, // Используем имя типа модели
                ImageUrl = Url.Action("GetImage", new { id = product.Id })
            };

            return Ok(productDto);
        }

        [HttpGet("{id}/image")]
        public async Task<IActionResult> GetImage(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null || product.Image == null)
            {
                return NotFound();
            }

            return File(product.Image, "image/jpg");
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromForm] ProductCreate model)
        {
            try
            {
                if (model.Image == null || model.Image.Length == 0)
                {
                    return BadRequest("Image file is required.");
                }

                var modelType = await _context.ModelTypes.FirstOrDefaultAsync(mt => mt.Name == model.ModelType);
                if (modelType == null)
                {
                    return BadRequest("Invalid ModelType.");
                }

                var imageBytes = await FileHelper.ConvertToByteArrayAsync(model.Image);

                var product = new Product
                {
                    Name = model.Name,
                    Description = model.Description,
                    ModelTypeId = modelType.Id,
                    Image = imageBytes
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании продукта.");
                return StatusCode(500, new { error = "Внутренняя ошибка сервера." });
            }
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] string name, [FromForm] string description, [FromForm] int modelTypeId, IFormFile? image)
        {
            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null)
            {
                return NotFound();
            }

            var modelType = await _context.ModelTypes.FindAsync(modelTypeId);
            if (modelType == null)
            {
                return BadRequest("Invalid ModelTypeId.");
            }

            if (image != null && image.Length > 0)
            {
                var imageBytes = await FileHelper.ConvertToByteArrayAsync(image);
                existingProduct.Image = imageBytes;
            }

            existingProduct.Name = name;
            existingProduct.Description = description;
            existingProduct.ModelTypeId = modelTypeId;

            _context.Entry(existingProduct).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }


    }
}

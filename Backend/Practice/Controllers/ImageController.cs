using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Practice.Configuration;
using Practice.Models;
using System.Diagnostics;
using Practice.Helpers;
using Practice.Services;

namespace Practice.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ImageController(
        ApplicationDbContext context,
        ILogger<ImageController> logger,
        FileManager fileManager,
        DockerService dockerService) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ILogger<ImageController> _logger = logger;
        private readonly FileManager _fileManager = fileManager;
        private readonly DockerService _dockerService = dockerService;
        
        // Получение 3D-модели по ID продукта. Возвращает GLB-файл модели.
        [HttpGet("{id}/model")]
        public async Task<IActionResult> GetModel(int id)
        {
            // Поиск продукта по id
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                _logger.LogWarning($"Продукт с ID {id} не найден.");
                return NotFound(new { error = "Продукт не найден." });
            }

            // Поиск модели по типу, совпадающему с типом продукта
            var model = await _context.Blender.FirstOrDefaultAsync(p => p.ModelType != null && p.ModelType == product.ModelType.ToString());
            if (model == null)
            {
                _logger.LogWarning($"3D-модель для типа {product.ModelType} не найдена.");
                return NotFound(new { error = "3D-модель не найдена." });
            }

            string modelFilePath;

            if (model.IsGlb)
            {
                // Если это .glb, просто отдаем файл
                modelFilePath = _fileManager.SaveFile("/app/blender_files/", $"model_{id}.glb", model.Blender_file);
            }
            else
            {
                // Если это .blend, отправляем запрос в Python-сервис для наложения скина и конвертировать в .glb
                if (product.Image == null || product.Image.Length == 0)
                {
                    _logger.LogWarning($"Текстура не загружена для продукта с ID {id}.");
                    return BadRequest(new { error = "Текстура не загружена для данной модели." });
                }

                string blendPath = _fileManager.SaveFile("/app/blender_files/", $"model_{id}.blend", model.Blender_file);
                string skinPath = _fileManager.SaveFile("/app/skins/", $"skin_{id}.png", product.Image);
                modelFilePath = _fileManager.GetFilePath("/app/blender_files/", $"model_{id}.glb");

                // Отправка в докер на конвертацию
                var success = await _dockerService.ApplySkinAndConvertToGlb(id, blendPath, skinPath, modelFilePath);
                if (!success)
                {
                    return StatusCode(500, new { error = "Ошибка обработки Blender-модели." });
                }
            }
            // Существует ли glb файл после обработки
            if (!System.IO.File.Exists(modelFilePath))
            {
                _logger.LogWarning($"Файл модели {modelFilePath} не найден.");
                return NotFound(new { error = "Файл модели не найден." });
            }

            // Чтение и возврат GLB-файла как байтов
            byte[] modelBytes = await System.IO.File.ReadAllBytesAsync(modelFilePath);
            return File(modelBytes, "image/png");
        }

        [HttpGet("models")]
        public async Task<IActionResult> GetModels()
        {
            var list = await _context.Blender
                .Select(p => new Blender { Id = p.Id, ModelType = p.ModelType, IsGlb = p.IsGlb })
                .ToListAsync();

            return list.Any() ? Ok(list) : NotFound(new { message = "Модель не найдена" });
        }


        [HttpPatch("model/{id}")]
        public async Task<IActionResult> UpdateModel(int id, [FromForm] string modelTypeName, IFormFile? Blender_file, bool isGlb)
        {
            var existingModel = await _context.Blender.FirstOrDefaultAsync(m => m.Id == id);
            if (existingModel == null)
            {
                return NotFound(new { error = "Модель не найдена." });
            }

            try
            {
                if (Blender_file != null && Blender_file.Length > 0)
                {
                    using var blender_filebytes = new MemoryStream();
                    await Blender_file.CopyToAsync(blender_filebytes);
                    existingModel.Blender_file = blender_filebytes.ToArray();
                }
                string oldModelType = existingModel.ModelType;
                existingModel.ModelType = modelTypeName;
                existingModel.IsGlb = isGlb;

                var productUpdate = await _context.Products.Where(w => w.ModelType == oldModelType).ToListAsync();

                foreach (var product in productUpdate)
                {
                    product.ModelType = modelTypeName;
                }

                _context.Blender.Update(existingModel);
                _context.Products.UpdateRange(productUpdate);
                await _context.SaveChangesAsync();

                return Ok(new { id = existingModel.Id, message = "Модель успешно обновлена." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Ошибка при обновлении модели: {ex.Message}" });
            }
        }


        [HttpPost("model")]
        public async Task<IActionResult> AddModel([FromForm] string modelTypeName, IFormFile Blender_file, bool isGlb)
        {
            if (Blender_file == null || Blender_file.Length == 0)
            {
                return BadRequest(new { error = "Необходимо загрузить .blend" });
            }

            try
            {
                using var blender_filebytes = new MemoryStream();
                await Blender_file.CopyToAsync(blender_filebytes);
                byte[] fileBytes = blender_filebytes.ToArray();

                var newModel = new Blender
                {
                    ModelType = modelTypeName,
                    Blender_file = fileBytes,
                    IsGlb = isGlb,
                };

                _context.Blender.Add(newModel);
                await _context.SaveChangesAsync();

                return Ok(new { id = newModel.Id, message = "Модель успешно добавлена." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Ошибка при добавлении модели: {ex.Message}" });
            }
        }

        [HttpDelete("{id}/model")]
        public async Task<IActionResult> DeleteModel(int id)
        {
            var renderItem = await _context.Blender.FindAsync(id);
            if (renderItem == null)
            {
                return NotFound(new { error = "Модель с указанным идентификатором не найдена." });
            }

            try
            {
                _context.Blender.Remove(renderItem);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Модель успешно удалена." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Ошибка при удалении модели: {ex.Message}" });
            }
        }

    }
}

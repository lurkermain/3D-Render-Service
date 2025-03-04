using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Practice.Configuration;
using Practice.Models;
using System;
using System.Diagnostics;
using System.Text;
using Practice.Helpers;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using System.Reflection.Metadata;
using Docker.DotNet.Models;
using Docker.DotNet;
using Practice.Services;
using Microsoft.Extensions.Logging;

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

        [HttpPut("{id}/render")]
        public async Task<IActionResult> RenderModel(
    int id,
    [FromQuery] int angle_horizontal = 0,
    [FromQuery] int angle_vertical = 0,
    [FromQuery] int lightEnergy = 50,
    [FromQuery] int angle_light = 0)
        {
            try
            {
                _logger.LogInformation($"Начало рендера для продукта с ID: {id}");

                var skin = await _context.Products.FindAsync(id);
                if (skin == null)
                {
                    _logger.LogWarning($"Продукт с ID {id} не найден.");
                    return NotFound(new { error = "Продукт не найден." });
                }

                var blend_file = await _context.Blender.FirstOrDefaultAsync(p => p.ModelType != null && p.ModelType == skin.ModelType.ToString());
                if (blend_file == null)
                {
                    _logger.LogWarning($"Blender файл для типа модели {skin.ModelType} не найден.");
                    return NotFound(new { error = "Blender файл не найден." });
                }

                string hostModelPath;
                if (blend_file.IsGlb)
                {
                    hostModelPath = _fileManager.SaveFile("blender_files", $"model_{id}.glb", blend_file.Blender_file);
                    _logger.LogInformation($"GLB файл сохранен по пути: {hostModelPath}");
                }
                else
                {
                    if (skin.Image == null || skin.Image.Length == 0)
                    {
                        _logger.LogWarning($"Текстура не загружена для продукта с ID {id}.");
                        return BadRequest(new { error = "Текстура не загружена для данной модели." });
                    }

                    hostModelPath = _fileManager.SaveFile("blender_files", $"model_{id}.blend", blend_file.Blender_file);
                    _logger.LogInformation($"Blender файл сохранен по пути: {hostModelPath}");
                }

                string hostSkinPath = null;
                if (!blend_file.IsGlb)
                {
                    hostSkinPath = _fileManager.SaveFile("skins", $"skin_{id}.png", skin.Image);
                    _logger.LogInformation($"Текстура сохранена по пути: {hostSkinPath}");
                }

                string hostOutputPath = _fileManager.GetFilePath("output", $"rendered_image_{id}.png");
                _logger.LogInformation($"Выходной файл будет сохранен по пути: {hostOutputPath}");

                bool renderSuccess = await _dockerService.RenderModelInContainer(id, angle_horizontal, angle_vertical, angle_light, lightEnergy, blend_file.IsGlb);

                if (!renderSuccess || !System.IO.File.Exists(hostOutputPath))
                {
                    _logger.LogError($"Ошибка рендера для продукта с ID {id}. Файл не найден или рендер не удался.");
                    return StatusCode(500, new { error = "Ошибка рендера или файл не найден." });
                }

                var renderedBytes = await System.IO.File.ReadAllBytesAsync(hostOutputPath);
                _logger.LogInformation($"Рендер успешно завершен для продукта с ID {id}.");

                return File(renderedBytes, "image/png");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при рендере продукта с ID {id}: {ex.Message}");
                return StatusCode(500, new { error = "Внутренняя ошибка сервера." });
            }
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

                existingModel.ModelType = modelTypeName;
                existingModel.IsGlb = isGlb;

                _context.Blender.Update(existingModel);
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


        // Метод для удаления модели из базы данных
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

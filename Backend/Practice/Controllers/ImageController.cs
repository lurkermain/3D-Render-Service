using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Practice.Configuration;
using Practice.Models;
using System;
using System.Diagnostics;
using System.Text;
using Practice.Helpers;
using Practice.Enums;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using System.Reflection.Metadata;
using Docker.DotNet.Models;
using Docker.DotNet;
using Practice.Services;

namespace Practice.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ImageController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;


        [HttpPut("{id}/render")]
        public async Task<IActionResult> RenderModel(
            int id,
            [FromQuery, SwaggerParameter("Угол поворота камеры в градусах по горизонтали"), DefaultValue(0), Range(-90, 90)] int angle_horizontal,
            [FromQuery, SwaggerParameter("Угол поворота камеры в градусах по вертикали"), DefaultValue(0), Range(-90, 90)] int angle_vertical,
            [FromQuery, SwaggerParameter("Интенсивность света (0-100)"), DefaultValue(50), Range(0, 100)] int lightEnergy,
            [FromQuery, SwaggerParameter("Угол поворота света в градусах по горизонтали"), DefaultValue(0), Range(-180, 180)] int angle_light)
        {
            var skin = await _context.Products.FindAsync(id);
            var blend_file = await _context.Blender.FirstOrDefaultAsync(p => p.ModelType == skin.ModelType.ToString());
            if (!blend_file.IsGlb)
            {
                if (skin?.Image == null || skin.Image.Length == 0)
                {
                    return BadRequest(new { error = "Текстура не загружена для данной модели." });
                }
            }

            if (blend_file?.Blender_file == null)
            {
                return NotFound(new { error = "Blender файл не найден." });
            }
            

            var fileManager = new FileManager();
            string hostBlenderPath = fileManager.SaveFile("blender_files", $"model_{id}.blend", blend_file.Blender_file);
            string hostSkinPath = fileManager.SaveFile("skins", $"skin_{id}.png", skin.Image);
            string hostOutputPath = fileManager.GetFilePath("output", $"rendered_image_{id}.png");

            var dockerService = new DockerService();
            bool renderSuccess = await dockerService.RenderModelInContainer(id, angle_horizontal, angle_vertical, angle_light, lightEnergy, blend_file.IsGlb);

            if (!renderSuccess || !System.IO.File.Exists(hostOutputPath))
            {
                return StatusCode(500, new { error = "Ошибка рендера или файл не найден." });
            }

            var renderedBytes = await System.IO.File.ReadAllBytesAsync(hostOutputPath);
            return File(renderedBytes, "image/png");
        }

        [HttpGet("models")]
        public async Task<IActionResult> GetModels()
        {
            var list = await _context.Blender
                .Select(p => new Blender { Id = p.Id, ModelType = p.ModelType })
                .ToListAsync();

            return list.Any() ? Ok(list) : NotFound(new { message = "Модель не найдена" });
        }

        [HttpGet("renders")]
        public async Task<IActionResult> GetRenders()
        {
            var list = await _context.Render.ToListAsync();
            return list.Any() ? Ok(list) : NotFound(new { message = "Модель не найдена" });
        }

        [HttpPost("model")]
        public async Task<IActionResult> AddModel([FromForm] string modelTypeName, IFormFile Blender_file, bool isGlb)
        {
            if (Blender_file == null || Blender_file.Length == 0)
            {
                return BadRequest(new { error = "Необходимо загрузить .blend" });
            }

            var modelType = await _context.ModelTypes.FirstOrDefaultAsync(m => m.Name == modelTypeName);
            if (modelType == null)
            {
                return BadRequest(new { error = "Тип модели не найден в базе данных." });
            }

            try
            {
                using var blender_filebytes = new MemoryStream();
                await Blender_file.CopyToAsync(blender_filebytes);
                byte[] fileBytes = blender_filebytes.ToArray();

                var newModel = new Blender
                {
                    ModelType = modelType.Name,
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



        [HttpGet("{id}/rendered-image")]
        public async Task<IActionResult> GetImage(int id)
        {
            var product = await _context.Render.FindAsync(id);
            if (product == null || product.RenderedImage == null)
            {
                return NotFound();
            }

            return File(product.RenderedImage, "image/png");
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

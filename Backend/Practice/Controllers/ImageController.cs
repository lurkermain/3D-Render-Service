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
            if (skin == null)
            {
                return NotFound(new { error = "Не найдено" });
            }

            var renderedItem = new Render()
            {
                Angle_vertical = angle_vertical,
                Angle_horizontal = angle_horizontal,
                Light = lightEnergy,
                Skin = skin.Image,
                Angle_light = angle_light
            };

            if (skin.Image == null || skin.Image.Length == 0)
            {
                return BadRequest(new { error = "Текстура не была загружена." });
            }

            var blend_file = await _context.Blender.FirstOrDefaultAsync(p => p.ModelType == skin.ModelType.ToString());
            var blend_bytes = blend_file.Blender_file;

            try
            {
                // Папки для монтирования в контейнер
                string blenderFilesDir = Path.Combine(Directory.GetCurrentDirectory(), "blender_files");
                string skinsDir = Path.Combine(Directory.GetCurrentDirectory(), "skins");
                string outputDir = Path.Combine(Directory.GetCurrentDirectory(), "output");

                Directory.CreateDirectory(blenderFilesDir);
                Directory.CreateDirectory(skinsDir);
                Directory.CreateDirectory(outputDir);

                // Пути к файлам в хостовой системе
                string hostBlenderPath = Path.Combine(blenderFilesDir, $"model_{id}.blend");
                string hostSkinPath = Path.Combine(skinsDir, $"skin_{id}.png");
                string hostOutputPath = Path.Combine(outputDir, $"rendered_image_{id}.png");

                // Запись файлов на хосте
                await System.IO.File.WriteAllBytesAsync(hostBlenderPath, blend_bytes);
                await System.IO.File.WriteAllBytesAsync(hostSkinPath, skin.Image);

                // Имя контейнера (уже запущенного)
                string containerName = "practicdocker-main-blender-1";

                // Команда для рендеринга
                string command =
                    $"blender -b /app/blender_files/model_{id}.blend -P /app/scripts/script3.py -- " +
                    $"--skin /app/skins/skin_{id}.png " +
                    $"--output /app/output/rendered_image_{id}.png " +
                    $"--angle_light {angle_light} --angle_vertical {angle_vertical} " +
                    $"--angle_horizontal {angle_horizontal} --lightEnergy {lightEnergy}";

                // Подключение к Docker API
                var client = new DockerClientConfiguration(new Uri("unix:///var/run/docker.sock")).CreateClient();

                // Проверяем, запущен ли контейнер
                var containers = await client.Containers.ListContainersAsync(new ContainersListParameters { All = true });
                var blenderContainer = containers.FirstOrDefault(c => c.Names.Contains("/" + containerName));

                if (blenderContainer == null)
                {
                    // Если контейнер не найден — создаем и запускаем его
                    var config = new CreateContainerParameters
                    {
                        Image = "linuxserver/blender:latest",
                        HostConfig = new HostConfig
                        {
                            Runtime = "nvidia", // Включаем GPU
                            Devices = new List<DeviceMapping>
        {
            new() { PathOnHost = "/dev/nvidia0", PathInContainer = "/dev/nvidia0", CgroupPermissions = "rwm" },
            new() { PathOnHost = "/dev/nvidiactl", PathInContainer = "/dev/nvidiactl", CgroupPermissions = "rwm" }
        }
                        },
                        Env = new List<string>
    {
        "NVIDIA_VISIBLE_DEVICES=all",
        "NVIDIA_DRIVER_CAPABILITIES=all"
    },
                        Cmd = new List<string>
    {
        "blender", "-b", $"/app/blender_files/model_{id}.blend",
        "-P", "/app/scripts/script3.py",
        "--",
        "--skin", $"/app/skins/skin_{id}.png",
        "--output", $"/app/output/rendered_image_{id}.png",
        "--angle_light", $"{angle_light}",
        "--angle_vertical", $"{angle_vertical}",
        "--angle_horizontal", $"{angle_horizontal}",
        "--lightEnergy", $"{lightEnergy}"
    }
                    };

                    var createdContainer = await client.Containers.CreateContainerAsync(config);
                    await client.Containers.StartContainerAsync(createdContainer.ID, new ContainerStartParameters());
                }

                if (System.IO.File.Exists(hostOutputPath))
                {
                    System.IO.File.Delete(hostOutputPath);
                }

                // Выполняем команду внутри контейнера
                var execCreateResponse = await client.Exec.ExecCreateContainerAsync(blenderContainer.ID, new ContainerExecCreateParameters
                {
                    Cmd = new List<string> { "sh", "-c", command },
                    AttachStdout = true,
                    AttachStderr = true
                });

                await client.Exec.StartContainerExecAsync(execCreateResponse.ID, CancellationToken.None);

                // Ожидаем завершения рендера
                var execInspect = await client.Exec.InspectContainerExecAsync(execCreateResponse.ID);
                while (execInspect.Running)
                {
                    Console.WriteLine("Ожидание завершения рендера...");
                    await Task.Delay(500);
                    execInspect = await client.Exec.InspectContainerExecAsync(execCreateResponse.ID);
                }

                // Проверяем, появился ли файл рендера
                if (!System.IO.File.Exists(hostOutputPath))
                {
                    Console.WriteLine("Файл рендера не найден!");
                    return StatusCode(500, new { error = "Ошибка: Файл рендера отсутствует." });
                }

                // Читаем рендер
                var renderedBytes = await System.IO.File.ReadAllBytesAsync(hostOutputPath);
                /*                renderedItem.RenderedImage = renderedBytes;*/

                // Удаляем временные файлы
                /* System.IO.File.Delete(hostBlenderPath);
                 System.IO.File.Delete(hostSkinPath);
 */
                return File(renderedBytes, "image/png");

            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Произошла ошибка: {ex.Message}", stackTrace = ex.StackTrace });
            }
        }

        [HttpGet("models")]
        public async Task<IActionResult> GetModels()
        {
            // Поиск записи по полю ModelType
            var list = await _context.Blender.Select(p => new Blender { Id = p.Id, ModelType = p.ModelType }).ToListAsync();

            // Проверяем, найден ли объект
            if (list == null)
            {
                return NotFound(new { message = "Модель не найдена" });
            }

            return Ok(list);
        }

        [HttpGet("renders")]
        public async Task<IActionResult> GetRenders()
        {
            // Поиск записи по полю ModelType
            var list = await _context.Render.ToListAsync();

            // Проверяем, найден ли объект
            if (list == null)
            {
                return NotFound(new { message = "Модель не найдена" });
            }

            return Ok(list);
        }

        [HttpPost("model")]
        public async Task<IActionResult> AddModel([FromForm] ModelType modeltype, IFormFile Blender_file)
        {
            if (Blender_file == null || Blender_file.Length == 0)
            {
                return BadRequest(new { error = "Необходимо загрузить .blend" });
            }

            try
            {
                // Сохранение .gltf файла во временный массив
                using var blender_filebytes = new MemoryStream();
                await Blender_file.CopyToAsync(blender_filebytes);
                byte[] fileBytes = blender_filebytes.ToArray();

                // Создание новой записи модели
                var newModel = new Blender
                {
                    ModelType = modeltype.ToString(),
                    Blender_file = fileBytes,
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

            return File(product.RenderedImage, "image/jpg");
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

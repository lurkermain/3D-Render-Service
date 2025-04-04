using Docker.DotNet.Models;
using Docker.DotNet;
using System.Diagnostics;

namespace Practice.Services
{
    public class DockerService
    {
        private readonly DockerClient _client;
        private readonly ILogger<DockerService> _logger;

        public DockerService(ILogger<DockerService> logger)
        {
            _client = new DockerClientConfiguration(new Uri("unix:///var/run/docker.sock")).CreateClient();
            _logger = logger;
        }
        private async Task<string> FindContainerIdAsync()
        {
            var containers = await _client.Containers.ListContainersAsync(new ContainersListParameters { All = true });

            var container = containers.FirstOrDefault(c =>
                c.Names.Any(n => n.Contains("blender", StringComparison.OrdinalIgnoreCase)));

            if (container == null)
            {
                _logger.LogError("Контейнер с именем, содержащим 'blender', не найден.");
                return null;
            }

            _logger.LogInformation($"Найден контейнер {string.Join(", ", container.Names)} с ID {container.ID}");
            return container.ID;
        }

        public async Task<bool> ApplySkinAndConvertToGlb(int id, string blendPath, string skinPath, string outputPath)
        {
            try
            {
                string containerId = await FindContainerIdAsync();
                if (string.IsNullOrEmpty(containerId))
                {
                    return false;
                }

                _logger.LogInformation($"Обработка модели с ID {id}: применение скина и конвертация в GLB.");

                string command = $"blender -noaudio -b {blendPath} -P /app/scripts/apply_skin.py -- " +
                                 $"--skin {skinPath} --output {outputPath}";

                var execCreateResponse = await _client.Exec.ExecCreateContainerAsync(containerId, new ContainerExecCreateParameters
                {
                    Cmd = new List<string> { "sh", "-c", command },
                    AttachStdout = true,
                    AttachStderr = true
                });

                await _client.Exec.StartContainerExecAsync(execCreateResponse.ID, CancellationToken.None);

                _logger.LogInformation($"Запущена обработка модели с ID {id}, ожидание завершения...");

                return await WaitForFileAsync(outputPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при обработке модели {id}");
                return false;
            }
        }

        async Task<bool> WaitForFileAsync(string path, int timeoutMs = 10000)
        {
            var sw = Stopwatch.StartNew();
            while (!System.IO.File.Exists(path))
            {
                if (sw.ElapsedMilliseconds > timeoutMs)
                    return false;
                await Task.Delay(100);
            }
            return true;
        }
    }
}
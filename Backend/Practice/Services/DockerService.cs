using Docker.DotNet.Models;
using Docker.DotNet;
using System.Diagnostics;

namespace Practice.Services
{
    public class DockerService
    {
        private readonly DockerClient _client;
        private readonly ILogger<DockerService> _logger;
        private const string ContainerName = "practicdocker-main-blender-1";
        private const string ContainerId = "656a60613185ec5d44004a1bdb35c19f1b897caf9093020909579222d23b37ed";

        public DockerService(ILogger<DockerService> logger)
        {
            _client = new DockerClientConfiguration(new Uri("unix:///var/run/docker.sock")).CreateClient();
            _logger = logger;
        }

        public async Task<bool> RenderModelInContainer(int id, int angleHorizontal, int angleVertical, int angleLight, int lightEnergy, bool isGlb)
        {
            try
            {
                _logger.LogInformation($"Начало рендера модели с ID: {id}, IsGlb: {isGlb}");

                string scriptName = isGlb ? "script_glb.py" : "script3.py";
                string modelPath = $"/app/blender_files/model_{id}.{(isGlb ? "glb" : "blend")}";

                string command = isGlb
                    ? $"blender -noaudio -b -P /app/scripts/{scriptName} -- " +
                      $"--input {modelPath} " +
                      $"--output /app/output/rendered_image_{id}.webp " +
                      $"--angle_light {angleLight} --angle_vertical {angleVertical} " +
                      $"--angle_horizontal {angleHorizontal} --lightEnergy {lightEnergy}"
                    : $"blender -noaudio -b {modelPath} -P /app/scripts/{scriptName} -- " +
                      $"--skin /app/skins/skin_{id}.png --output /app/output/rendered_image_{id}.webp " +
                      $"--angle_light {angleLight} --angle_vertical {angleVertical} " +
                      $"--angle_horizontal {angleHorizontal} --lightEnergy {lightEnergy}";

                _logger.LogInformation($"Команда для выполнения в контейнере: {command}");

                var sw = Stopwatch.StartNew();

                // 1. Запуск команды
                sw.Restart();
                var execCreateResponse = await _client.Exec.ExecCreateContainerAsync(ContainerId, new ContainerExecCreateParameters
                {
                    Cmd = new List<string> { "sh", "-c", command },
                    AttachStdout = true,
                    AttachStderr = true
                });
                sw.Stop();
                _logger.LogInformation($"Создание exec-команды заняло: {sw.ElapsedMilliseconds} мс");

                _logger.LogInformation($"Создана команда для выполнения в контейнере: ExecID = {execCreateResponse.ID}");

                await _client.Exec.StartContainerExecAsync(execCreateResponse.ID, CancellationToken.None);
                sw.Restart();
                await _client.Exec.InspectContainerExecAsync(execCreateResponse.ID);

                // 3. Ожидание завершения

                // 4. Ожидание завершения
                /*while (true)
                {
                    await Task.Delay(100); // Динамическое ожидание*/


                /*if (!execInspect.Running)
                {
                    _logger.LogInformation($"Команда завершена: ExitCode = {execInspect.ExitCode}");

                    if (execInspect.ExitCode != 0)
                    {
                        _logger.LogError($"Ошибка выполнения команды: ExitCode = {execInspect.ExitCode}");
                        return false;
                    }

                    break;
                }
            }*/

                sw.Stop();
                _logger.LogInformation($"Ожидание завершения заняло: {sw.ElapsedMilliseconds} мс");

                /*_logger.LogInformation($"Команда завершена: ExecID = {execCreateResponse.ID}, ExitCode = {execInspect.ExitCode}");

                if (execInspect.ExitCode != 0)
                {
                    _logger.LogError($"Ошибка выполнения команды: ExitCode = {execInspect.ExitCode}");
                    return false;
                }*/

                _logger.LogInformation($"Рендер успешно завершен для модели с ID: {id}");

                _logger.LogInformation($"Ожидание завершения заняло: {sw.ElapsedMilliseconds} мс");
                _logger.LogInformation($"Рендер успешно завершен для модели с ID: {id}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при выполнении рендера модели с ID: {id}");
                return false;
            }
        }
    }
}

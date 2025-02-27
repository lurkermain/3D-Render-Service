using Docker.DotNet.Models;
using Docker.DotNet;

namespace Practice.Services
{
    public class DockerService
    {
        private readonly DockerClient _client;
        private readonly ILogger<DockerService> _logger;
        private const string ContainerName = "practicdocker-main-blender-1";

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
                string command = isGlb
                    ? $"blender -b /app/blender_files/model_{id}.blend -P /app/scripts/{scriptName} -- " +
                      $"--output /app/output/rendered_image_{id}.png " +
                      $"--angle_light {angleLight} --angle_vertical {angleVertical} " +
                      $"--angle_horizontal {angleHorizontal} --lightEnergy {lightEnergy}"
                    : $"blender -b /app/blender_files/model_{id}.blend -P /app/scripts/{scriptName} -- " +
                      $"--skin /app/skins/skin_{id}.png --output /app/output/rendered_image_{id}.png " +
                      $"--angle_light {angleLight} --angle_vertical {angleVertical} " +
                      $"--angle_horizontal {angleHorizontal} --lightEnergy {lightEnergy}";

                _logger.LogInformation($"Команда для выполнения в контейнере: {command}");

                var containers = await _client.Containers.ListContainersAsync(new ContainersListParameters { All = true });
                var container = containers.FirstOrDefault(c => c.Names.Contains("/" + ContainerName));
                if (container == null)
                {
                    _logger.LogError($"Контейнер с именем {ContainerName} не найден.");
                    return false;
                }

                _logger.LogInformation($"Контейнер найден: ID = {container.ID}, Status = {container.Status}");

                var execCreateResponse = await _client.Exec.ExecCreateContainerAsync(container.ID, new ContainerExecCreateParameters
                {
                    Cmd = new List<string> { "sh", "-c", command },
                    AttachStdout = true,
                    AttachStderr = true
                });

                _logger.LogInformation($"Создана команда для выполнения в контейнере: ExecID = {execCreateResponse.ID}");

                await _client.Exec.StartContainerExecAsync(execCreateResponse.ID, CancellationToken.None);

                var execInspect = await _client.Exec.InspectContainerExecAsync(execCreateResponse.ID);
                while (execInspect.Running)
                {
                    _logger.LogInformation($"Команда выполняется: ExecID = {execCreateResponse.ID}, Running = {execInspect.Running}");
                    await Task.Delay(500);
                    execInspect = await _client.Exec.InspectContainerExecAsync(execCreateResponse.ID);
                }

                _logger.LogInformation($"Команда завершена: ExecID = {execCreateResponse.ID}, ExitCode = {execInspect.ExitCode}");

                if (execInspect.ExitCode != 0)
                {
                    _logger.LogError($"Ошибка выполнения команды: ExitCode = {execInspect.ExitCode}");
                    return false;
                }

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

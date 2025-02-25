using Docker.DotNet.Models;
using Docker.DotNet;

namespace Practice.Services
{
    public class DockerService
    {
        private readonly DockerClient _client;
        private const string ContainerName = "practicdocker-main-blender-1";

        public DockerService()
        {
            _client = new DockerClientConfiguration(new Uri("unix:///var/run/docker.sock")).CreateClient();
        }

        public async Task<bool> RenderModelInContainer(int id, int angleHorizontal, int angleVertical, int angleLight, int lightEnergy)
        {
            string command = $"blender -b /app/blender_files/model_{id}.blend -P /app/scripts/script3.py -- " +
                             $"--skin /app/skins/skin_{id}.png --output /app/output/rendered_image_{id}.png " +
                             $"--angle_light {angleLight} --angle_vertical {angleVertical} " +
                             $"--angle_horizontal {angleHorizontal} --lightEnergy {lightEnergy}";

            var containers = await _client.Containers.ListContainersAsync(new ContainersListParameters { All = true });
            var container = containers.FirstOrDefault(c => c.Names.Contains("/" + ContainerName));
            if (container == null)
            {
                return false;
            }

            var execCreateResponse = await _client.Exec.ExecCreateContainerAsync(container.ID, new ContainerExecCreateParameters
            {
                Cmd = new List<string> { "sh", "-c", command },
                AttachStdout = true,
                AttachStderr = true
            });

            await _client.Exec.StartContainerExecAsync(execCreateResponse.ID, CancellationToken.None);

            var execInspect = await _client.Exec.InspectContainerExecAsync(execCreateResponse.ID);
            while (execInspect.Running)
            {
                await Task.Delay(500);
                execInspect = await _client.Exec.InspectContainerExecAsync(execCreateResponse.ID);
            }

            return true;
        }
    }
}

using Microsoft.Extensions.Logging;
using Practice.Configuration;
using Practice.Controllers;

namespace Practice.Helpers
{
    public class FileManager(ILogger<FileManager> logger)
    {
        private readonly ILogger<FileManager> _logger = logger;
        public string SaveFile(string folder, string fileName, byte[] fileBytes)
        {
            try
            {
                var directoryPath = Path.Combine(Directory.GetCurrentDirectory(), folder);
                if (!Directory.Exists(directoryPath))
                {
                    Directory.CreateDirectory(directoryPath);
                }

                var filePath = Path.Combine(directoryPath, fileName);
                System.IO.File.WriteAllBytes(filePath, fileBytes);

                return filePath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при сохранении файла {fileName} в папку {folder}");
                throw; // Перебросьте исключение, чтобы оно было обработано в контроллере
            }
        }

        public string GetFilePath(string folder, string fileName)
        {
            return Path.Combine(Directory.GetCurrentDirectory(), folder, fileName);
        }
    }
}

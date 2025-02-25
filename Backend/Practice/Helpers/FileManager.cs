namespace Practice.Helpers
{
    public class FileManager
    {
        public string SaveFile(string directory, string fileName, byte[] fileData)
        {
            string dirPath = Path.Combine(Directory.GetCurrentDirectory(), directory);
            Directory.CreateDirectory(dirPath);
            string filePath = Path.Combine(dirPath, fileName);
            File.WriteAllBytes(filePath, fileData);
            return filePath;
        }

        public string GetFilePath(string directory, string fileName)
        {
            return Path.Combine(Directory.GetCurrentDirectory(), directory, fileName);
        }
    }
}

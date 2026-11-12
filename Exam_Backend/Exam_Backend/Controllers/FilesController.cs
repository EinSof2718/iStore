using Microsoft.AspNetCore.Mvc;

namespace Exam_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public FilesController(IWebHostEnvironment env)
        {
            _env = env;
        }

        // GET: api/Files/products
        // Возвращает список папок в wwwroot/products
        [HttpGet("products")]
        public IActionResult GetProductFolders()
        {
            var productsPath = Path.Combine(_env.WebRootPath, "products");

            if (!Directory.Exists(productsPath))
                return Ok(new List<string>());

            var folders = Directory.GetDirectories(productsPath).Select(Path.GetFileName).Where(f => f != null).OrderBy(f => f).ToList();

            return Ok(folders);
        }//GetProductFolders


        // GET: api/Files/products/{folderName}
        // Возвращает список файлов изображений в папке
        [HttpGet("products/{folderName}")]
        public IActionResult GetProductFiles(string folderName)
        {
            var folderPath = Path.Combine(_env.WebRootPath, "products", folderName);

            if (!Directory.Exists(folderPath))
                return NotFound(new { error = $"Папка '{folderName}' не найдена" });

            var extensions = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".mp4", ".mkv", ".webm", ".avi", ".mov"};

            var files = Directory.GetFiles(folderPath).Where(f => extensions.Contains(Path.GetExtension(f).ToLower())).Select(f => new {
                fileName = Path.GetFileName(f),
                url = $"/products/{folderName}/{Path.GetFileName(f)}",
            }).OrderBy(f => f.fileName).ToList();
                
            return Ok(files);
        }//GetProductFiles
    }
}
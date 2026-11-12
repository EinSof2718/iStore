using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Exam_Backend.Data;
using OfficeOpenXml;
using Microsoft.EntityFrameworkCore;

namespace Exam_Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImportPriceController : ControllerBase
    {
        private readonly Exam_BackendContext _context;

        public ImportPriceController(Exam_BackendContext context)
        {
            _context = context;
        }

        [HttpPost("prices")]
        public async Task<IActionResult> ImportPrice(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "Файл не выбран" });

            var extension = Path.GetExtension(file.FileName).ToLower();
            if (extension != ".xls" && extension != ".xlsx")
                return BadRequest(new { error = "Допустимы только файлы .xls и .xlsx" });

            ExcelPackage.License.SetNonCommercialOrganization("Maxim Morozov");

            var results = new List<object>();
            var errors = new List<object>();
            int updatedCnt = 0;

            try
            {
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);
                using var package = new ExcelPackage(stream);

                var sheet = package.Workbook.Worksheets.FirstOrDefault();
                if (sheet == null)
                    return BadRequest(new { error = "Файл не содержит листов" });

                int colProductId = -1;
                int colPrice = -1;

                for (int col = 1; col <= sheet.Dimension?.Columns; col++)
                {
                    var header = sheet.Cells[1, col].Text?.Trim().ToLower();
                    switch (header)
                    {
                        case "productid":
                        case "id":
                            colProductId = col;
                            break;

                        case "price":
                        case "цена":
                            colPrice = col;
                            break;
                    }//switch
                }//for col

                if (colProductId == -1)
                    return BadRequest(new { error = "Столбец с id товаров не найден" });
                if (colPrice == -1)
                    return BadRequest(new { error = "Столбец с ценой товаров не найден" });

                int rows = sheet.Dimension?.Rows ?? 0;

                for (int row = 2; row <= rows; row++)
                {
                    var idCell = sheet.Cells[row, colProductId].Text?.Trim();
                    var priceCell = sheet.Cells[row, colPrice].Text?.Trim();

                    if (string.IsNullOrWhiteSpace(idCell))
                        continue;

                    if (!int.TryParse(idCell, out int productId))
                    {
                        errors.Add(new { row, error = $"Некорректный ProductId: '{idCell}'" });
                        continue;
                    }//if

                    if (!int.TryParse(priceCell, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out int price) || price <= 0)
                    {
                        errors.Add(new { row, error = $"Некорректная цена: '{priceCell}' для товара #{productId}" });
                        continue;
                    }//if

                    var product = await _context.Products.FindAsync(productId);
                    if (product == null)
                    {
                        errors.Add(new { row, error = $"Товар #{productId} не найден" });
                        continue;
                    }//if


                    var oldPrice = product.Price;
                    product.Price = price;

                    results.Add(new
                    {
                        row,
                        productId,
                        name = product.Name,
                        oldPrice,
                        newPrice = price
                    });
                    updatedCnt++;
                }//for row

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Обновлено {updatedCnt} товаров",
                    updatedCnt,
                    errorsCnt = errors.Count,
                    results,
                    errors,
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Ошибка обработки файла: " + ex.Message });
            }//try-catchh
        }//ImportPrice


        [HttpGet("template")]
        public async Task<IActionResult> DownloadTemplate()
        {
            ExcelPackage.License.SetNonCommercialOrganization("Maxim Morozov");

            var products = await _context.Products.Select(p => new
            {
                p.ProductId,
                p.Name,
                p.Price,
            }).OrderBy(p => p.ProductId).ToListAsync();

            using var package = new ExcelPackage();
            var sheet = package.Workbook.Worksheets.Add("Цены");

            sheet.Cells[1, 1].Value = "ProductId";
            sheet.Cells[1, 2].Value = "Name";
            sheet.Cells[1, 3].Value = "Price";

            for (int i = 0; i < products.Count; i++)
            {
                var p = products[i];
                sheet.Cells[i + 2, 1].Value = p.ProductId;
                sheet.Cells[i + 2, 2].Value = p.Name;
                sheet.Cells[i + 2, 3].Value = p.Price;
            }//for i

            sheet.Column(1).Width = 10;
            sheet.Column(2).Width = 80;
            sheet.Column(3).Width = 15;

            sheet.Protection.IsProtected = true;
            sheet.Protection.AllowSelectLockedCells = true;

            sheet.Column(1).Style.Locked = true;
            sheet.Column(3).Style.Locked = true;

            var bytes = package.GetAsByteArray();
            return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"istore_prices_{DateTime.Now:yyyy-MM-dd}.xlsx");
        }//DownloadTemplate
    }
}

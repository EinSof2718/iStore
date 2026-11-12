using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Exam_Backend.Models
{
    public class SpecificationsProduct
    {
        [Key]
        public int SpecificationsProductId { get; set; }

        [Required]
        public int ProductId { get; set; }


        [ForeignKey(nameof(ProductId))]
        public Product? Product { get; set; }

        [Required]
        public string SpecificationsKey { get; set; }
        
        [Required]
        public string SpecificationsValue { get; set; }
        
        public int SortOrder { get; set; }
    }
}

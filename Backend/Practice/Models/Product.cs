using Microsoft.EntityFrameworkCore;
using Practice.Enums;

namespace Practice.Models
{
    public class Product
    {
        public int Id { get; set; } 
        public string ?Name { get; set; }
        public string ?Description { get; set; }

        public byte[] ?Image { get; set; }

        public int ModelTypeId { get; set; }

        public ModelTypes ModelType { get; set; }
    }
}

using Practice.Models;

namespace Practice.Enums
{
    public class ModelTypes
    {

        public int Id { get; set; }
        public string? Name { get; set; }

        public ICollection<Product> Products { get; set; }

    }

}

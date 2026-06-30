using System.ComponentModel.DataAnnotations;

namespace ForensicApi.Models;

public class Investigation
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign Key
    public int UserId { get; set; }
    public User? User { get; set; }
    
    public ICollection<UploadedImage> UploadedImages { get; set; } = new List<UploadedImage>();
}

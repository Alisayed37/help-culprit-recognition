using System.ComponentModel.DataAnnotations;

namespace ForensicApi.Models;

public class UploadedImage
{
    public int Id { get; set; }
    
    [Required]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    public string FilePath { get; set; } = string.Empty;
    
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign Key
    public int InvestigationId { get; set; }
    public Investigation? Investigation { get; set; }
    
    public ICollection<ImageEmbedding> Embeddings { get; set; } = new List<ImageEmbedding>();
}

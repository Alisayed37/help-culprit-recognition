using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ForensicApi.Models;

public class ImageEmbedding
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string ModelVersion { get; set; } = string.Empty; // e.g. "epoch_3"
    
    [Required]
    public string VectorData { get; set; } = string.Empty; // Store as JSON array or binary string
    
    // Foreign Key
    public int UploadedImageId { get; set; }
    public UploadedImage? UploadedImage { get; set; }
}

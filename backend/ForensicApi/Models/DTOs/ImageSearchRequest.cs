using System.ComponentModel.DataAnnotations;

namespace ForensicApi.Models.DTOs;

public class ImageSearchRequest
{
    [Required]
    public int InvestigationId { get; set; }

    [Required]
    public IFormFile QueryImage { get; set; } = null!;

    [MaxLength(50)]
    public string Model { get; set; } = "epoch_3";

    [MaxLength(20)]
    public string Metric { get; set; } = "cosine";

    [Range(1, 200)]
    public int TopK { get; set; } = 5;
}

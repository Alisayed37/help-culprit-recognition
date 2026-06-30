using System.ComponentModel.DataAnnotations;

namespace ForensicApi.Models.DTOs;

public class TextSearchRequest
{
    [Required]
    public int InvestigationId { get; set; }

    [Required]
    [MinLength(1)]
    public string Query { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Model { get; set; } = "epoch_3";

    [MaxLength(20)]
    public string Metric { get; set; } = "cosine";

    // Number of matches to return (clamped server-side).
    [Range(1, 200)]
    public int TopK { get; set; } = 5;
}

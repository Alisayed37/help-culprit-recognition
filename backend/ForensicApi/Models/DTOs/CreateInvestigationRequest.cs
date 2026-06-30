using System.ComponentModel.DataAnnotations;

namespace ForensicApi.Models.DTOs;

public class CreateInvestigationRequest
{
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
}

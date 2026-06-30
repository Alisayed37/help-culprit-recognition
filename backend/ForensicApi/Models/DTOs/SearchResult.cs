namespace ForensicApi.Models.DTOs;

public class SearchResult
{
    public int InvestigationId { get; set; }
    public List<MatchResult> Matches { get; set; } = new List<MatchResult>();
}

public class MatchResult
{
    public string Filename { get; set; } = string.Empty;
    public double MatchScore { get; set; }
    public double MatchPercentage { get; set; }
}

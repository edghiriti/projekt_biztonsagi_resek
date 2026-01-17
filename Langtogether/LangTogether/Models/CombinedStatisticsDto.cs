namespace LangTogether.Models
{
    public class CombinedStatisticsDto
    {
        public DateTime Date { get; set; }
        public int NewWordsLearned { get; set; }
        public int WordsReviewed { get; set; }
        public string UserName { get; set; }
    }
}

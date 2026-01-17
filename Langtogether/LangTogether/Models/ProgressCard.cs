namespace LangTogether.Models
{
    public class ProgressCard
    {
        public Guid ProgressCardId { get; set; }
        public Guid ProgressDeckId { get; set; }
        public virtual ProgressDeck ProgressDeck { get; set; }

        public string Front { get; set; }
        public string Back { get; set; }

        public int Repetitions { get; set; } = 0;
        public double Interval { get; set; } = 1;
        public double EasinessFactor { get; set; } = 2.5;
        public DateTime LastReviewedDate { get; set; } = DateTime.MinValue;
        public DateTime NextReviewDate { get; set; } = DateTime.MaxValue;

        public int QualityOfRecall { get; set; }
        public DateTime TimeStamp { get; set; }
    }
}
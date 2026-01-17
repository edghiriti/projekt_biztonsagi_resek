using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace LangTogether.Models
{
    public class ProgressStatistics
    {
        public Guid ProgressStatisticsId { get; set; }

        public Guid ProgressDeckId { get; set; }
        public virtual ProgressDeck ProgressDeck { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public int NewWordsLearned { get; set; } = 0;

        [Required]
        public int WordsReviewed { get; set; } = 0;
    }
}

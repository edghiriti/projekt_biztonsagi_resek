namespace LangTogether.Models
{
    public class ProgressDeck
    {
        public Guid ProgressDeckId { get; set; }
        public string ProgressDeckName { get; set; }
        public string ProgressDeckDescription { get; set; }

        public Guid DeckId { get; set; }
        public virtual Deck Deck { get; set; }

        public string UserId { get; set; }
        public virtual ApplicationUser User { get; set; }

        public Guid? GroupId { get; set; }
        public virtual Group Group { get; set; }

        public virtual IList<ProgressCard> ProgressCards { get; set; }

        public int DailyCardLimit { get; set; }

        public ICollection<ProgressStatistics> ProgressStatistics { get; set; }
    }
}

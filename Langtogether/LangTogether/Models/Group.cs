namespace LangTogether.Models
{
    public class Group
    {
        public Guid GroupId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string OwnerName { get; set; }
        public virtual ICollection<ProgressDeck> ProgressDecks { get; set; }
    }


}

namespace LangTogether.Models
{
    public class Invitation
    {
        public Guid InvitationId { get; set; }

        public string UserId { get; set; }
        public virtual ApplicationUser User { get; set; }

        public Guid DeckId { get; set; }
        public Guid GroupId { get; set; }
        public DateTime InvitationDate { get; set; }
        public string SenderName { get; set; }

        public string DeckName { get; set; }
        public string DeckDescription { get; set; }
        public int NumberOfCards { get; set; }
        public string GroupName { get; set; }
        public string GroupDescription { get; set; }
    }
}

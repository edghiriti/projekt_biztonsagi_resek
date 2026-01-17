namespace LangTogether.Models
{
    public class InvitationDto
    {
        public Guid InvitationId { get; set; }
        public string UserName { get; set; }
        public string GroupName { get; set; }
        public string GroupDescription { get; set; }
        public string DeckName { get; set; }
        public string DeckDescription { get; set; }
        public int NumberOfCards { get; set; }
        public DateTime InvitationDate { get; set; }
        public string SenderName { get; set; }
    }

}

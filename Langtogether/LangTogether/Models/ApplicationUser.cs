using Microsoft.AspNetCore.Identity;

namespace LangTogether.Models
{
    public class ApplicationUser : IdentityUser
    {
        public virtual ICollection<ProgressDeck> ProgressDecks { get; set; }
        public virtual ICollection<Invitation> Invitations { get; set;}
    }
}

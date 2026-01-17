using System.Text.Json.Serialization;

namespace LangTogether.Models
{
    public class Deck
    {
        [JsonPropertyName("deckId")]
        public Guid DeckId { get; set; }
        [JsonPropertyName("deckName")]
        public string DeckName { get; set;}
        [JsonPropertyName("deckDescription")]
        public string DeckDescription { get; set;}
        [JsonPropertyName("cards")]
        public virtual ICollection<Card> Cards { get; set; }
        public virtual ICollection<ProgressDeck> ProgressDecks { get; set; }
        public string UserId { get; set; }
        [JsonPropertyName("isPublished")]
        public bool isPublished { get; set; }
    }
}

using System.Text.Json.Serialization;

namespace LangTogether.Models
{
    public class Card
    {
        [JsonPropertyName("cardId")]
        public Guid CardId { get; set; }
        [JsonPropertyName("cardIndex")]
        public int CardIndex { get; set; }

        public Guid DeckId {  get; set; }
        public virtual Deck Deck { get; set; }

        [JsonPropertyName("front")]
        public string Front {  get; set; }
        [JsonPropertyName("back")]
        public string Back { get; set; }
    }
}

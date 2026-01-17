using LangTogether.Models;
using Microsoft.AspNetCore.Mvc;

namespace LangTogether.Adapters
{
    public interface IDeckAdapter
    {
        Task<IList<Deck>> GetDecks();
        Task<Deck?> GetDeck(Guid deckId);
        Task<Guid> CreateDeck(Deck deck, string userId);
        Task<bool> AddCardToDeck(Guid deckId, Card card);
        Task<bool> DeleteCard(Guid cardId);
        Task<bool> DeleteDeck(Guid deckId);
        Task<bool> UpdateCard(Card updatedCard);
        Task<bool> UpdateDeck(Deck updatedDeck);
        Task UpdatePublishStatus(Guid deckId, bool isPublished);
        Task<IList<Deck>> GetPublishedDecks(string userId);
        Task<IList<Deck>> GetUserDecks(string userId);
    }
}

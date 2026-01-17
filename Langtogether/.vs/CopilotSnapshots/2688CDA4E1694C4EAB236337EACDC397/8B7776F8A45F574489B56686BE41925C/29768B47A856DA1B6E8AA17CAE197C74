using LangTogether.Data;
using LangTogether.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace LangTogether.Adapters
{
    public class DeckAdapter : IDeckAdapter
    {
        private AppDbContext _context;

        public DeckAdapter(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Deck?> GetDeck(Guid deckId)
        {
            return await GetDeckByIdAsync(deckId);
        }

        public async Task<IList<Deck>> GetDecks()
        {
            return await _context.Decks.ToListAsync();
        }

        public async Task<bool> AddCardToDeck(Guid deckId, Card card)
        {
            var deck = await GetDeckByIdAsync(deckId);
            if (deck == null)
            {
                return false;
            }

            deck.Cards.Add(card);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Guid> CreateDeck(Deck deck, string userId)
        {
            deck.UserId = userId;
            await _context.Decks.AddAsync(deck);
            await _context.SaveChangesAsync();
            return deck.DeckId;
        }

        public async Task<bool> DeleteCard(Guid cardId)
        {
            var card = await _context.Cards.FindAsync(cardId);
            if (card == null)
                return false;

            _context.Cards.Remove(card);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteDeck(Guid deckId)
        {
            var deck = await GetDeckByIdAsync(deckId);
            if (deck == null)
                return false;

            _context.Decks.Remove(deck);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateCard(Card updatedCard)
        {
            var card = await _context.Cards.FindAsync(updatedCard.CardId);
            if (card == null)
                return false;

            card.Front = updatedCard.Front;
            card.Back = updatedCard.Back;
            _context.Cards.Update(card);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateDeck(Deck updatedDeck)
        {
            var deck = await GetDeckByIdAsync(updatedDeck.DeckId);
            if (deck == null)
                return false;

            deck.DeckName = updatedDeck.DeckName;
            deck.DeckDescription = updatedDeck.DeckDescription;
            deck.Cards = updatedDeck.Cards;
            _context.Decks.Update(deck);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task<Deck?> GetDeckByIdAsync(Guid deckId)
        {
            return await _context.Decks
                                 .Include(d => d.Cards)
                                 .FirstOrDefaultAsync(d => d.DeckId == deckId);
        }

        public async Task<IList<Deck>> GetUserDecks(string userId)
        {
            return await _context.Decks
                .Where(d => d.UserId == userId)
                .ToListAsync();
        }

        public async Task<IList<Deck>> GetPublishedDecks(string userId)
        {
            return await _context.Decks
                .Where(d => d.isPublished && d.UserId != userId)
                .ToListAsync();
        }

        public async Task UpdatePublishStatus(Guid deckId, bool isPublished)
        {
            var deck = await _context.Decks.FirstOrDefaultAsync(d => d.DeckId == deckId);

            if (deck == null)
            {
                throw new NullReferenceException("Deck was not found");
            }

            deck.isPublished = isPublished;
            await _context.SaveChangesAsync();
        }
    }
}

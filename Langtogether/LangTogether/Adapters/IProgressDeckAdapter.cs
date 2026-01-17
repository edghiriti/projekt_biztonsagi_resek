using LangTogether.Models;

public interface IProgressDeckAdapter
{
    Task<IList<ProgressDeck>> GetProgressDecks();
    Task<ProgressDeck?> GetProgressDeck(Guid progressDeckId);
    Task<bool> UpdateDailyCardLimit(Guid progressDeckId, int dailyCardLimit);
    Task<Guid> CreateProgressDeck(ProgressDeck progressDeck);
    Task<bool> DeleteProgressDeck(Guid progressDeckId);
    Task AddProgressCards(List<ProgressCard> progressCards);
    Task<Guid> CreateProgressDeckWithCards(Guid deckId, string userId, string name, string description, List<Card> cards, int dailyCardLimit);
    Task<ProgressCard> UpdateProgressCard(Guid progressCardId, int quality);
    Task<ProgressDeck?> GetFilteredProgressDeck(Guid progressDeckId);
    Task<(int newCards, int learningCards, int reviewCards)> GetCardCounts(Guid progressDeckId);
    Task<List<ProgressStatistics>> GetProgressDeckStatistics(Guid progressDeckId);
    Task<IEnumerable<CombinedStatisticsDto>> GetCombinedStatistics(string userId);
}

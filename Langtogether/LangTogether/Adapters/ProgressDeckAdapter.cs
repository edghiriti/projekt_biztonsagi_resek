using LangTogether.Data;
using LangTogether.Models;
using LangTogether.Services;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LangTogether.Adapters
{
    public class ProgressDeckAdapter : IProgressDeckAdapter
    {
        private readonly AppDbContext _context;
        private readonly ISM2Service _sm2Service;

        public ProgressDeckAdapter(AppDbContext context, ISM2Service sm2Service)
        {
            _context = context;
            _sm2Service = sm2Service;
        }

        public async Task<IList<ProgressDeck>> GetProgressDecks()
        {
            return await _context.ProgressDecks.Include(pd => pd.ProgressCards).ToListAsync();
        }

        public async Task<ProgressDeck?> GetProgressDeck(Guid progressDeckId)
        {
            return await _context.ProgressDecks.Include(pd => pd.ProgressCards)
                                               .FirstOrDefaultAsync(pd => pd.ProgressDeckId == progressDeckId);
        }

        public async Task<ProgressDeck?> GetFilteredProgressDeck(Guid progressDeckId)
        {
            var progressDeck = await _context.ProgressDecks
                .Include(pd => pd.ProgressCards)
                .FirstOrDefaultAsync(pd => pd.ProgressDeckId == progressDeckId);

            if (progressDeck == null)
            {
                return null;
            }

            progressDeck.ProgressCards = await GetCardsForLearning(progressDeckId);

            return progressDeck;
        }

        public async Task<(int newCards, int learningCards, int reviewCards)> GetCardCounts(Guid progressDeckId)
        {
            var progressDeck = await _context.ProgressDecks
                .Include(pd => pd.ProgressCards.OrderBy(pc => pc.NextReviewDate))
                .FirstOrDefaultAsync(pd => pd.ProgressDeckId == progressDeckId);

            if (progressDeck == null)
            {
                throw new Exception("Progress deck not found");
            }

            var today = DateTime.Now.Date;
            var dailyStatistics = await _context.ProgressStatistics
                .FirstOrDefaultAsync(ps => ps.ProgressDeckId == progressDeckId && ps.Date == today);

            int newWordsLearned = dailyStatistics?.NewWordsLearned ?? 0;
            int newCards = Math.Max(0, progressDeck.DailyCardLimit - newWordsLearned);

            int learningCards = progressDeck.ProgressCards.Count(pc => pc.QualityOfRecall == 0 && pc.LastReviewedDate != DateTime.MinValue);

            int reviewCards = progressDeck.ProgressCards
                .Count(pc => pc.QualityOfRecall > 0 && pc.NextReviewDate.Date <= today);

            return (newCards, learningCards, reviewCards);
        }

        public async Task<List<ProgressStatistics>> GetProgressDeckStatistics(Guid progressDeckId)
        {
            return await _context.ProgressStatistics
                                 .Where(ps => ps.ProgressDeckId == progressDeckId)
                                 .OrderBy(ps => ps.Date)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<CombinedStatisticsDto>> GetCombinedStatistics(string userId)
        {
            var progressDecks = await _context.ProgressDecks
                .Include(pd => pd.ProgressStatistics)
                .Where(pd => pd.UserId == userId)
                .ToListAsync();

            var combinedStatistics = new Dictionary<DateTime, CombinedStatisticsDto>();

            foreach (var deck in progressDecks)
            {
                foreach (var stat in deck.ProgressStatistics)
                {
                    if (combinedStatistics.TryGetValue(stat.Date, out var existingEntry))
                    {
                        existingEntry.NewWordsLearned += stat.NewWordsLearned;
                        existingEntry.WordsReviewed += stat.WordsReviewed;
                    }
                    else
                    {
                        combinedStatistics[stat.Date] = new CombinedStatisticsDto
                        {
                            Date = stat.Date,
                            NewWordsLearned = stat.NewWordsLearned,
                            WordsReviewed = stat.WordsReviewed
                        };
                    }
                }
            }

            return combinedStatistics.Values.OrderBy(cs => cs.Date).ToList();
        }

        public async Task<bool> UpdateDailyCardLimit(Guid progressDeckId, int dailyCardLimit)
        {
            var progressDeck = await GetProgressDeck(progressDeckId);

            if (progressDeck == null)
            {
                return false;
            }

            progressDeck.DailyCardLimit = dailyCardLimit;
            _context.ProgressDecks.Update(progressDeck);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Guid> CreateProgressDeck(ProgressDeck progressDeck)
        {
            var deckExists = await _context.Decks.AnyAsync(d => d.DeckId == progressDeck.DeckId);
            if (!deckExists)
            {
                throw new Exception("Deck does not exist");
            }

            var result = await _context.ProgressDecks.AddAsync(progressDeck);
            await _context.SaveChangesAsync();
            return result.Entity.ProgressDeckId;
        }

        public async Task AddProgressCards(List<ProgressCard> progressCards)
        {
            foreach (var progressCard in progressCards)
            {
                var progressDeckExists = await _context.ProgressDecks.AnyAsync(pd => pd.ProgressDeckId == progressCard.ProgressDeckId);
                if (!progressDeckExists)
                {
                    throw new Exception("ProgressDeck does not exist");
                }

                await _context.ProgressCards.AddAsync(progressCard);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<Guid> CreateProgressDeckWithCards(Guid deckId, string userId, string name, string description, List<Card> cards, int dailyCardLimit)
        {
            var progressDeck = new ProgressDeck
            {
                DeckId = deckId,
                UserId = userId,
                ProgressDeckName = name,
                ProgressDeckDescription = description,
                DailyCardLimit = dailyCardLimit
            };

            var progressDeckId = await CreateProgressDeck(progressDeck);

            var progressCards = cards.Select(card => new ProgressCard
            {
                ProgressDeckId = progressDeckId,
                Front = card.Front,
                Back = card.Back,
                NextReviewDate = DateTime.MaxValue,
                LastReviewedDate = DateTime.MinValue,
            }).ToList();

            await AddProgressCards(progressCards);

            return progressDeckId;
        }

        public async Task<ProgressCard> UpdateProgressCard(Guid progressCardId, int quality)
        {
            var progressCard = await _context.ProgressCards
                                             .FirstOrDefaultAsync(pc => pc.ProgressCardId == progressCardId);

            if (progressCard == null)
            {
                throw new ArgumentNullException("Progress card not found.");
            }

            var progressDeck = await _context.ProgressDecks.FirstOrDefaultAsync(pd => pd.ProgressDeckId == progressCard.ProgressDeckId);

            if (progressDeck == null)
            {
                throw new ArgumentNullException("Progress deck not found.");
            }

            var today = DateTime.Now.Date;
            var statistics = await _context.ProgressStatistics
                                           .FirstOrDefaultAsync(ps => ps.ProgressDeckId == progressDeck.ProgressDeckId && ps.Date == today);

            if (statistics == null)
            {
                statistics = new ProgressStatistics
                {
                    ProgressStatisticsId = Guid.NewGuid(),
                    ProgressDeckId = progressDeck.ProgressDeckId,
                    Date = today,
                    NewWordsLearned = 0,
                    WordsReviewed = 0,
                };
                if (progressCard.LastReviewedDate == DateTime.MinValue)
                {
                    statistics.NewWordsLearned += 1;
                }
                else if (progressCard.Repetitions > 0 && quality > 0)
                {
                    statistics.WordsReviewed += 1;
                }
                _context.ProgressStatistics.Add(statistics);
            }
            else
            {
                if (progressCard.LastReviewedDate == DateTime.MinValue)
                {
                    statistics.NewWordsLearned += 1;
                }
                else if (progressCard.Repetitions > 0 && quality > 0)
                {
                    statistics.WordsReviewed += 1;
                }
                _context.ProgressStatistics.Update(statistics);
            }

            _sm2Service.UpdateProgressCard(progressCard, quality);
            _context.ProgressCards.Update(progressCard);
            await _context.SaveChangesAsync();

            return progressCard;
        }

        public async Task<bool> DeleteProgressDeck(Guid progressDeckId)
        {
            var progressDeck = await _context.ProgressDecks.FindAsync(progressDeckId);
            if (progressDeck != null)
            {
                _context.ProgressDecks.Remove(progressDeck);
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        private async Task<IList<ProgressCard>> GetCardsForLearning(Guid progressDeckId)
        {
            var progressDeck = await _context.ProgressDecks
                .Include(pd => pd.ProgressCards.OrderBy(pc => pc.NextReviewDate))
                .FirstOrDefaultAsync(pd => pd.ProgressDeckId == progressDeckId);

            if (progressDeck == null)
            {
                throw new ArgumentException("Progress deck not found.");
            }

            var today = DateTime.Now.Date;
            var dailyStatistics = await _context.ProgressStatistics
                .FirstOrDefaultAsync(ps => ps.ProgressDeckId == progressDeckId && ps.Date == today);
            var newWordsLearned = dailyStatistics != null ?  dailyStatistics.NewWordsLearned : 0;

            var newCards = progressDeck.ProgressCards
                                      .Where(pc => pc.Repetitions == 0 && pc.LastReviewedDate == DateTime.MinValue)
                                      .Take(Math.Max(0, progressDeck.DailyCardLimit - newWordsLearned))
                                      .ToList();

            var reviewCards = progressDeck.ProgressCards
                                         .Where(pc => pc.NextReviewDate.Date <= today && pc.Repetitions > 0 && pc.QualityOfRecall > 0)
                                         .OrderBy(pc => pc.NextReviewDate)
                                         .ToList();

            var failedCards = progressDeck.ProgressCards
                                         .Where(pc => pc.QualityOfRecall == 0 && pc.LastReviewedDate > DateTime.MinValue)
                                         .ToList();
            
            var total = newCards.Concat(reviewCards).Concat(failedCards);

            return total.ToList();
        }
    }
}

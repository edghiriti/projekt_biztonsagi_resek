using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LangTogether.Models;
using LangTogether.Adapters;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace LangTogether.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProgressDecksController : ControllerBase
    {
        private readonly IProgressDeckAdapter _progressDeckAdapter;
        private readonly IDeckAdapter _deckAdapter;

        public ProgressDecksController(IProgressDeckAdapter progressDeckAdapter, IDeckAdapter deckAdapter)
        {
            _progressDeckAdapter = progressDeckAdapter;
            _deckAdapter = deckAdapter;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProgressDeck>>> GetProgressDecks()
        {
            try
            {
                var progressDecks = await _progressDeckAdapter.GetProgressDecks();
                var progressDeckDtos = progressDecks.Select(pd => new
                {
                    pd.ProgressDeckId,
                    pd.ProgressDeckName,
                    pd.ProgressDeckDescription,
                    pd.DeckId,
                    pd.UserId,
                    pd.GroupId,
                    pd.DailyCardLimit
                });

                return Ok(progressDeckDtos);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProgressDeck>> GetProgressDeck(Guid id)
        {
            try
            {
                var progressDeck = await _progressDeckAdapter.GetProgressDeck(id);
                if (progressDeck == null)
                {
                    return NotFound();
                }
                return progressDeck;
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpPut("{progressDeckId}")]
        public async Task<IActionResult> UpdateDailyCardLimit(Guid progressDeckId, [FromBody] JsonElement requestData)
        {
            try
            {
                var dailyCardLimit = requestData.GetProperty("dailyCardLimit").GetInt32();
                var success = await _progressDeckAdapter.UpdateDailyCardLimit(progressDeckId, dailyCardLimit);
                if (!success)
                {
                    return NotFound("Progress deck not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpGet("{id}/filtered")]
        public async Task<ActionResult<ProgressDeck>> GetFilteredProgressDeck(Guid id)
        {
            try
            {
                var progressDeck = await _progressDeckAdapter.GetFilteredProgressDeck(id);
                if (progressDeck == null)
                {
                    return NotFound();
                }
                return Ok(progressDeck);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpGet("{id}/counts")]
        public async Task<ActionResult> GetCardCounts(Guid id)
        {
            try
            {
                var (newCards, learningCards, reviewCards) = await _progressDeckAdapter.GetCardCounts(id);
                return Ok(new { newCards, learningCards, reviewCards });
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpGet("{id}/statistics")]
        public async Task<ActionResult<IEnumerable<ProgressStatistics>>> GetProgressDeckStatistics(Guid id)
        {
            try
            {
                var statistics = await _progressDeckAdapter.GetProgressDeckStatistics(id);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpGet("combined-statistics")]
        public async Task<ActionResult<IEnumerable<CombinedStatisticsDto>>> GetCombinedStatistics()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var statistics = await _progressDeckAdapter.GetCombinedStatistics(userId);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error: " + ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateProgressDeckWithCards([FromBody] JsonElement requestData)
        {
            try
            {
                var deckId = requestData.GetProperty("deckId").GetGuid();
                var name = requestData.GetProperty("name").GetString();
                var description = requestData.GetProperty("description").GetString();
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var dailyCardLimit = requestData.GetProperty("dailyCardLimit").GetInt32();

                var deck = await _deckAdapter.GetDeck(deckId);
                var cards = deck.Cards.ToList();

                if (cards == null || !cards.Any())
                {
                    return BadRequest("No cards found for the specified deckId.");
                }

                var progressDeckId = await _progressDeckAdapter.CreateProgressDeckWithCards(deckId, userId, name, description, cards, dailyCardLimit);
                return Ok(new { ProgressDeckId = progressDeckId });
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpPut("UpdateProgressCard")]
        public async Task<IActionResult> UpdateProgressCard([FromBody] JsonElement requestData)
        {
            try
            {
                var progressCardId = requestData.GetProperty("progressCardId").GetGuid();
                var quality = requestData.GetProperty("quality").GetInt32();

                var progressCard = await _progressDeckAdapter.UpdateProgressCard(progressCardId, quality);
                return Ok(progressCard);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProgressDeck(Guid id)
        {
            try
            {
                var success = await _progressDeckAdapter.DeleteProgressDeck(id);
                if (!success)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }
    }
}

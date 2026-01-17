using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LangTogether.Models;
using LangTogether.Adapters;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace LangTogether.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DecksController : ControllerBase
    {
        private readonly IDeckAdapter _deckAdapter;

        public DecksController(IDeckAdapter deckAdapter)
        {
            _deckAdapter = deckAdapter;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Deck>>> GetDecks()
        {
            try
            {
                var decks = await _deckAdapter.GetDecks();
                return Ok(decks);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Deck>> GetDeck(Guid id)
        {
            try
            {
                var deck = await _deckAdapter.GetDeck(id);
                if (deck == null)
                {
                    return NotFound();
                }
                deck.Cards = deck.Cards.OrderBy(x => x.CardIndex).ToList();
                return deck;
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateDeck([FromBody] JsonElement deckData)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var deck = deckData.Deserialize<Deck>();

                if (deck == null)
                {
                    return BadRequest("Invalid JSON data");
                }

                var deckId = await _deckAdapter.CreateDeck(deck, userId);
                return Ok();
            }
            catch (JsonException ex)
            {
                return BadRequest("JSON formatting error: " + ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDeck(Guid id, [FromBody] JsonElement deckData)
        {
            try
            {
                var deck = deckData.Deserialize<Deck>();

                if (deck == null)
                {
                    return BadRequest("Invalid JSON data");
                }

                if (id != deck.DeckId)
                {
                    return BadRequest("Deck ID mismatch");
                }

                var success = await _deckAdapter.UpdateDeck(deck);
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

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDeck(Guid id)
        {
            try
            {
                var success = await _deckAdapter.DeleteDeck(id);
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

        [HttpPost("{deckId}/cards")]
        public async Task<ActionResult> AddCardToDeck(Guid deckId, Card card)
        {
            try
            {
                var success = await _deckAdapter.AddCardToDeck(deckId, card);
                if (!success)
                {
                    return BadRequest("Failed to add card to deck");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpPut("cards/{cardId}")]
        public async Task<IActionResult> UpdateCard(Guid cardId, Card card)
        {
            try
            {
                if (cardId != card.CardId)
                {
                    return BadRequest("Card ID mismatch");
                }

                var success = await _deckAdapter.UpdateCard(card);
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

        [HttpDelete("cards/{cardId}")]
        public async Task<IActionResult> DeleteCard(Guid cardId)
        {
            try
            {
                var success = await _deckAdapter.DeleteCard(cardId);
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

        [HttpGet("MyDecks")]
        public async Task<ActionResult<IEnumerable<Deck>>> GetMyDecks()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var decks = await _deckAdapter.GetUserDecks(userId);
                return Ok(decks);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpGet("PublishedDecks")]
        public async Task<ActionResult<IEnumerable<Deck>>> GetPublishedDecks()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var decks = await _deckAdapter.GetPublishedDecks(userId);
                return Ok(decks);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpPut("Publish")]
        public async Task<IActionResult> PublishDeck([FromQuery] Guid deckId, bool isPublished)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                await _deckAdapter.UpdatePublishStatus(deckId, isPublished);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }
    }
}

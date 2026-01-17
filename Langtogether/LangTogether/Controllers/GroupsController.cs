using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LangTogether.Models;
using LangTogether.Adapters;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace LangTogether.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GroupsController : ControllerBase
    {
        private readonly IGroupAdapter _groupAdapter;

        public GroupsController(IGroupAdapter groupAdapter)
        {
            _groupAdapter = groupAdapter;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Group>>> GetGroups()
        {
            try
            {
                var groups = await _groupAdapter.GetGroups();
                return Ok(groups);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Group>> GetGroup(Guid id)
        {
            try
            {
                var group = await _groupAdapter.GetGroup(id);
                if (group == null)
                {
                    return NotFound();
                }
                return group;
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpGet("{id}/users")]
        public async Task<ActionResult<IEnumerable<ApplicationUser>>> GetUsersOfGroup(Guid id)
        {
            try
            {
                var users = await _groupAdapter.GetUsersOfGroup(id);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpGet("{id}/progressdecks")]
        public async Task<ActionResult<IEnumerable<ProgressDeck>>> GetProgressDecksOfGroup(Guid id)
        {
            try
            {
                var progressDecks = await _groupAdapter.GetProgressDecksOfGroup(id);
                return Ok(progressDecks);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpPost("{groupId}/adduser")]
        public async Task<IActionResult> AddUserToGroup(Guid groupId, [FromBody] JsonElement requestData)
        {
            try
            {
                string userName = requestData.GetProperty("userName").GetString();
                await _groupAdapter.AddUserToGroup(groupId, userName);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest("User could not be added to the group. " + ex.Message);
            }
        }

        [HttpPost("CreateGroupWithInvitations")]
        public async Task<IActionResult> CreateGroupWithInvitations([FromBody] JsonElement requestData)
        {
            try
            {
                var name = requestData.GetProperty("name").GetString();
                var description = requestData.GetProperty("description").GetString();
                var members = requestData.GetProperty("members").EnumerateArray().Select(m => m.GetString()).ToList();
                var progressDeckId = requestData.GetProperty("progressDeckId").GetGuid();

                var group = await _groupAdapter.CreateGroupWithInvitations(name, description, progressDeckId, members);
                return Ok(group);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpDelete("{groupId}/users/{userName}")]
        public async Task<IActionResult> RemoveUserFromGroup(Guid groupId, string userName)
        {
            try
            {
                var success = await _groupAdapter.RemoveUserFromGroup(groupId, userName);

                if (success)
                {
                    return NoContent();
                }

                return NotFound("User could not be found in the group or error in removal.");
            }
            catch (Exception ex)
            {
                return BadRequest("User could not be removed from the group. " + ex.Message);
            }
        }

        [HttpGet("invitations")]
        public async Task<ActionResult<IEnumerable<InvitationDto>>> GetAllInvitations()
        {
            try
            {
                var invitations = await _groupAdapter.GetAllInvitations();
                return Ok(invitations);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpPost("{invitationId}/accept")]
        public async Task<IActionResult> AcceptInvitation(Guid invitationId)
        {
            try
            {
                var progressDeckId = await _groupAdapter.AcceptInvitation(invitationId);
                return Ok(new { ProgressDeckId = progressDeckId });
            }
            catch (NullReferenceException ex)
            {
                return BadRequest("Error: Deck was not found, cannot join to group");
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpDelete("{invitationId}/decline")]
        public async Task<IActionResult> DeclineInvitation(Guid invitationId)
        {
            try
            {
                await _groupAdapter.DeclineInvitation(invitationId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }

        [HttpGet("{groupId}/statistics")]
        public async Task<IActionResult> GetGroupStatistics(Guid groupId)
        {
            try
            {
                var statistics = await _groupAdapter.GetGroupStatistics(groupId);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return BadRequest("Error: " + ex.Message);
            }
        }
    }
}

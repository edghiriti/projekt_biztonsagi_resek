using LangTogether.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LangTogether.Adapters
{
    public interface IGroupAdapter
    {
        Task<IEnumerable<Group>> GetGroups();
        Task<Group?> GetGroup(Guid groupId);
        Task<IEnumerable<ApplicationUser>> GetUsersOfGroup(Guid groupId);
        Task<IEnumerable<ProgressDeck>> GetProgressDecksOfGroup(Guid groupId);
        Task AddUserToGroup(Guid groupId, string userId);
        Task<bool> RemoveUserFromGroup(Guid groupId, string userId);
        Task<Group> CreateGroupWithInvitations(string name, string description, Guid progressDeckId, List<string> members);
        Task<IEnumerable<InvitationDto>> GetAllInvitations();
        Task<bool> AcceptInvitation(Guid invitationId);
        Task DeclineInvitation(Guid invitationId);
        Task<IEnumerable<CombinedStatisticsDto>> GetGroupStatistics(Guid groupId);
    }
}

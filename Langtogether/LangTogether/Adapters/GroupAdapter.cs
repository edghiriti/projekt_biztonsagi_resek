using LangTogether.Data;
using LangTogether.Models;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LangTogether.Adapters
{
    public class GroupAdapter : IGroupAdapter
    {
        private readonly AppDbContext _context;

        public GroupAdapter(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Group>> GetGroups()
        {
            return await _context.Groups.ToListAsync();
        }

        public async Task<Group?> GetGroup(Guid groupId)
        {
            return await _context.Groups.FindAsync(groupId);
        }

        public async Task<IEnumerable<ApplicationUser>> GetUsersOfGroup(Guid groupId)
        {
            var users = await _context.ProgressDecks.IgnoreQueryFilters().Include(pd => pd.User).Where(pd => pd.GroupId == groupId).Select(pd => pd.User).ToListAsync();

            return users;
        }

        public async Task<IEnumerable<ProgressDeck>> GetProgressDecksOfGroup(Guid groupId)
        {
            var group = await _context.Groups.Include(g => g.ProgressDecks)
                                             .FirstOrDefaultAsync(g => g.GroupId == groupId);
            return group?.ProgressDecks ?? new List<ProgressDeck>();
        }

        public async Task AddUserToGroup(Guid groupId, string userName)
        {
            var group = await _context.Groups.Include(g => g.ProgressDecks).FirstOrDefaultAsync(g => g.GroupId == groupId);
            var user = await _context.Users.FirstOrDefaultAsync(g => g.UserName == userName);
            var deck = await _context.Decks.Include(d => d.Cards).FirstOrDefaultAsync(d => d.DeckId == group.ProgressDecks.First().DeckId);

            if (group == null || user == null || deck == null)
            {
                throw new NullReferenceException();
            }

            var invitation = new Invitation
            {
                UserId = user.Id,
                DeckId = deck.DeckId,
                GroupId = group.GroupId,
                InvitationDate = DateTime.Now,
                SenderName = group.OwnerName,
                DeckName = deck.DeckName,
                DeckDescription = deck.DeckDescription,
                NumberOfCards = deck.Cards.Count(),
                GroupName = group.Name,
                GroupDescription = group.Description
            };

            _context.Invitations.Add(invitation);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> RemoveUserFromGroup(Guid groupId, string userName)
        {
            var progressDeck = await _context.ProgressDecks.IgnoreQueryFilters().FirstOrDefaultAsync(pd => pd.GroupId == groupId && pd.User.UserName == userName);
            if (progressDeck != null)
            {
                progressDeck.GroupId = null;
                progressDeck.Group = null;

                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }

        public async Task<Group> CreateGroupWithInvitations(string name, string description, Guid progressDeckId, List<string> members)
        {
            var progressDeck = await _context.ProgressDecks
                                             .Include(pd => pd.User)
                                             .Include(pd => pd.Deck).ThenInclude(d => d.Cards)
                                             .FirstOrDefaultAsync(pd => pd.ProgressDeckId == progressDeckId);

            if (progressDeck == null)
            {
                throw new Exception("Progress deck not found or user does not own the deck.");
            }

            var owner = progressDeck.User;
            if (owner == null)
            {
                throw new Exception("Group owner not found.");
            }
            var ownerUserName = owner.UserName;

            var deck = progressDeck.Deck;
            if (deck == null)
            {
                throw new Exception("Deck not found.");
            }

            var group = new Group
            {
                GroupId = Guid.NewGuid(),
                Name = name,
                Description = description,
                OwnerName = ownerUserName
            };

            _context.Groups.Add(group);

            progressDeck.GroupId = group.GroupId;
            _context.ProgressDecks.Update(progressDeck);

            foreach (var userName in members)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
                if (user == null)
                {
                    continue;
                }

                var invitation = new Invitation
                {
                    UserId = user.Id,
                    DeckId = deck.DeckId,
                    GroupId = group.GroupId,
                    InvitationDate = DateTime.Now,
                    SenderName = ownerUserName,
                    DeckName = deck.DeckName,
                    DeckDescription = deck.DeckDescription,
                    NumberOfCards = deck.Cards.Count(),
                    GroupName = group.Name,
                    GroupDescription = group.Description
                };

                _context.Invitations.Add(invitation);
            }

            await _context.SaveChangesAsync();
            return group;
        }


        public async Task<IEnumerable<InvitationDto>> GetAllInvitations()
        {
            var invitations = await _context.Invitations
                .Include(inv => inv.User)
                .ToListAsync();

            var invitationDtos = new List<InvitationDto>();

            foreach (var invitation in invitations)
            {
                var dto = new InvitationDto
                {
                    InvitationId = invitation.InvitationId,
                    UserName = invitation.User.UserName,
                    GroupName = invitation.GroupName ?? "Unknown Group",
                    GroupDescription = invitation.GroupDescription ?? "No description",
                    DeckName = invitation.DeckName ?? "Unknown Deck",
                    DeckDescription = invitation.DeckDescription ?? "No description",
                    NumberOfCards = invitation.NumberOfCards,
                    InvitationDate = invitation.InvitationDate,
                    SenderName = invitation.SenderName
                };

                invitationDtos.Add(dto);
            }

            return invitationDtos;
        }

        public async Task<bool> AcceptInvitation(Guid invitationId)
        {
            var invitation = await _context.Invitations
                .FirstOrDefaultAsync(inv => inv.InvitationId == invitationId);

            if (invitation == null)
            {
                throw new Exception("Invitation not found.");
            }

            var deck = await _context.Decks
                .Include(d => d.Cards)
                .FirstOrDefaultAsync(d => d.DeckId == invitation.DeckId);

            if (deck == null)
            {
               await  DeclineInvitation(invitationId);
               throw new NullReferenceException("Deck was not found");
            }

            ProgressDeck newProgressDeck;

            newProgressDeck = new ProgressDeck
            {
                UserId = invitation.UserId,
                DeckId = deck.DeckId,
                ProgressDeckName = deck.DeckName + " - created from group: " + invitation.GroupName,
                ProgressDeckDescription = deck.DeckDescription,
                GroupId = invitation.GroupId,
                DailyCardLimit = 20,
                ProgressCards = deck.Cards.Select(card => new ProgressCard
                {
                    ProgressCardId = Guid.NewGuid(),
                    Front = card.Front,
                    Back = card.Back,
                    NextReviewDate = DateTime.MaxValue,
                    LastReviewedDate = DateTime.MinValue,
                }).ToList()
            };

            _context.ProgressDecks.Add(newProgressDeck);

            _context.Invitations.Remove(invitation);

            await _context.SaveChangesAsync();

            return true;
        }


        public async Task DeclineInvitation(Guid invitationId)
        {
            var invitation = await _context.Invitations
                .FirstOrDefaultAsync(inv => inv.InvitationId == invitationId);

            if (invitation == null)
            {
                throw new Exception("Invitation not found.");
            }

            _context.Invitations.Remove(invitation);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<CombinedStatisticsDto>> GetGroupStatistics(Guid groupId)
        {
            var progressDecks =  await _context.ProgressDecks
                .IgnoreQueryFilters()
                .Where(pd => pd.GroupId == groupId)
                .Include(pd => pd.User)
                .Include(pd => pd.ProgressStatistics)
                .ToListAsync();

            var statistics = new List<CombinedStatisticsDto>();

            foreach (var deck in progressDecks)
            {
                foreach (var stat in deck.ProgressStatistics)
                {
                    statistics.Add(new CombinedStatisticsDto
                    {
                        Date = stat.Date,
                        NewWordsLearned = stat.NewWordsLearned,
                        WordsReviewed = stat.WordsReviewed,
                        UserName = deck.User.UserName
                    });
                }
            }

            return statistics;
        }

    }
}

using LangTogether.Models;
using LangTogether.Services;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LangTogether.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        private readonly IUserContextService _userContextService;

        public AppDbContext(DbContextOptions<AppDbContext> options, IUserContextService userContextService)
            : base(options)
        {
            _userContextService = userContextService;
        }

        public DbSet<Group> Groups { get; set; }
        public DbSet<ProgressDeck> ProgressDecks { get; set; }
        public DbSet<ProgressStatistics> ProgressStatistics { get; set; }
        public DbSet<ProgressCard> ProgressCards { get; set; }
        public DbSet<Deck> Decks { get; set; }
        public DbSet<Card> Cards { get; set; }
        public DbSet<Invitation> Invitations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            ApplyQueryFilters(modelBuilder);

            modelBuilder.Entity<Card>()
                .HasOne(c => c.Deck)
                .WithMany(d => d.Cards)
                .HasForeignKey(c => c.DeckId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProgressDeck>()
                .HasOne(pd => pd.Deck)
                .WithMany(d => d.ProgressDecks)
                .HasForeignKey(pd => pd.DeckId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProgressDeck>()
                .HasOne(pd => pd.User)
                .WithMany(u => u.ProgressDecks)
                .HasForeignKey(pd => pd.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProgressDeck>()
                .HasOne(pd => pd.Group)
                .WithMany(g => g.ProgressDecks)
                .HasForeignKey(pd => pd.GroupId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProgressDeck>()
                .HasMany(pd => pd.ProgressStatistics)
                .WithOne(ps => ps.ProgressDeck)
                .HasForeignKey(ps => ps.ProgressDeckId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Invitation>()
                .HasOne(i => i.User)
                .WithMany(u => u.Invitations)
                .HasForeignKey(i => i.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProgressCard>()
                .HasOne(pc => pc.ProgressDeck)
                .WithMany(pd => pd.ProgressCards)
                .HasForeignKey(pc => pc.ProgressDeckId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProgressCard>()
                .Property(pc => pc.EasinessFactor)
                .HasPrecision(3, 2);
        }

        private void ApplyQueryFilters(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ProgressDeck>().HasQueryFilter(pd => pd.UserId == _userContextService.UserId);
            modelBuilder.Entity<ProgressCard>().HasQueryFilter(pc => pc.ProgressDeck.UserId == _userContextService.UserId);
            modelBuilder.Entity<Group>().HasQueryFilter(g => g.ProgressDecks.Any(pd => pd.UserId == _userContextService.UserId));
            modelBuilder.Entity<Invitation>().HasQueryFilter(i => i.UserId == _userContextService.UserId);
        }
    }
}

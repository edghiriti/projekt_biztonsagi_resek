using LangTogether.Models;

namespace LangTogether.Services
{
    public interface ISM2Service
    {
        void UpdateProgressCard(ProgressCard progressCard, int quality);
    }
}

using LangTogether.Models;

namespace LangTogether.Services
{
    public class SM2Service : ISM2Service
    {
        public void UpdateProgressCard(ProgressCard progressCard, int quality)
        {
            if (quality < 1)
            {
                progressCard.Repetitions = 0;
                progressCard.Interval = 0.01;
            }
            else
            {
                progressCard.QualityOfRecall = quality;
                double ef = progressCard.EasinessFactor;
                progressCard.EasinessFactor = Math.Max(1.3, ef + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

                progressCard.Repetitions += 1;

                if (progressCard.Repetitions == 1)
                {
                    progressCard.Interval = 1;
                }
                else if (progressCard.Repetitions == 2)
                {
                    progressCard.Interval = 6;
                }
                else
                {
                    progressCard.Interval = progressCard.Interval * progressCard.EasinessFactor;
                }
            }

            progressCard.NextReviewDate = DateTime.Now.AddDays(progressCard.Interval);
            progressCard.LastReviewedDate = DateTime.Now;
        }
    }
}

using LangTogether.Services;
using System.Security.Claims;

namespace LangTogether.Middlewares
{
    public class UserContextMiddleware
    {
        private readonly RequestDelegate _next;

        public UserContextMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IUserContextService userContextService)
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            userContextService.UserId = userId;

            await _next(context);
        }
    }
}

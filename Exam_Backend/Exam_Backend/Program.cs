using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Exam_Backend.Data;
using Exam_Backend.Areas.Identity.Data;
using Yandex.Checkout.V3;

namespace Exam_Backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);


            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                {
                    policy.WithOrigins(
                        "https://localhost:5173",
                        "http://localhost:5173",
                        "https://localhost:3000",
                        "http://localhost:3000"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
                });
            });

            var connectionString = builder.Configuration.GetConnectionString("Exam_BackendContextConnection")
                ?? throw new InvalidOperationException("Connection string 'Exam_BackendContextConnection' not found.");

            builder.Services.AddDbContext<Exam_BackendContext>(options =>
                options.UseSqlServer(connectionString));

            //НАСТРОЙКА IDENTITY (УЖЕ ВКЛЮЧАЕТ АУТЕНТИФИКАЦИЮ) 
            builder.Services.AddIdentity<Exam_BackendUser, IdentityRole>(options =>
            {
                // Настройки пароля
                options.Password.RequireDigit = false;
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;

                // Настройки входа
                options.SignIn.RequireConfirmedAccount = false;
                options.SignIn.RequireConfirmedEmail = false;
                options.SignIn.RequireConfirmedPhoneNumber = false;

                // Настройки пользователя
                options.User.RequireUniqueEmail = true;
            })
            .AddEntityFrameworkStores<Exam_BackendContext>()
            .AddDefaultTokenProviders()
            .AddRoleManager<RoleManager<IdentityRole>>()
            .AddUserManager<UserManager<Exam_BackendUser>>()
            .AddSignInManager<SignInManager<Exam_BackendUser>>();


            builder.Services.Configure<SecurityStampValidatorOptions>(options =>
            {
                options.ValidationInterval = TimeSpan.FromMinutes(30);
                options.OnRefreshingPrincipal = context =>
                {
                    //_logger.LogInformation($"Security stamp refreshed for: {context.CurrentPrincipal?.Identity?.Name}");
                    return Task.CompletedTask;
                };
            });

            //НАСТРОЙКА КУК
            builder.Services.ConfigureApplicationCookie(options =>
            {
                // Основные настройки куки
                options.Cookie.Name = ".AspNetCore.Identity.Application";
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.None;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.IsEssential = true;
                options.Cookie.MaxAge = TimeSpan.FromDays(30);

                // Настройки сессии
                options.ExpireTimeSpan = TimeSpan.FromDays(30);
                options.SlidingExpiration = true;

                // Пути для страниц Identity (Razor Pages)
                options.LoginPath = "/Identity/Account/Login";
                options.LogoutPath = "/Identity/Account/Logout";
                options.AccessDeniedPath = "/Identity/Account/AccessDenied";


                options.Events.OnRedirectToLogin = context =>
                {
                    if (context.Request.Path.StartsWithSegments("/api"))
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        return Task.CompletedTask;
                    }
                    context.Response.Redirect(context.RedirectUri);
                    return Task.CompletedTask;
                };

                options.Events.OnRedirectToAccessDenied = context =>
                {
                    if (context.Request.Path.StartsWithSegments("/api"))
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                        return Task.CompletedTask;
                    }
                    context.Response.Redirect(context.RedirectUri);
                    return Task.CompletedTask;
                };
            });

            //НАСТРОЙКА АВТОРИЗАЦИИ
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("AdminPolicy", policy => policy.RequireRole("Admin"));
                options.AddPolicy("ManagerPolicy", policy => policy.RequireRole("Manager", "Admin"));
                options.AddPolicy("ModeratorPolicy", policy => policy.RequireRole("Moderator", "Admin"));
                options.AddPolicy("UserPolicy", policy => policy.RequireRole("User", "Admin"));
            });


            builder.Services.AddControllers();
            builder.Services.AddHttpContextAccessor();


            builder.Services.AddRazorPages();

            var app = builder.Build();

            if (app.Environment.IsDevelopment())    
                app.UseDeveloperExceptionPage();
            

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseRouting();

            app.UseCors("AllowReactApp");
            app.UseAuthentication(); 
            app.UseAuthorization();


            app.MapControllers();
            app.MapRazorPages();

            app.Run();
        }
    }
}
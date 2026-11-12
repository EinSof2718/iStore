using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Exam_Backend.Migrations
{
    /// <inheritdoc />
    public partial class SeedUser : Migration
    {
        /// <inheritdoc />

        // admin@istore.ru (Admin123!)
        // manager1@istore.ru (Manager123!)
        // manager2@istore.ru (Manager123!)
        // user1@mail.ru (User123!)
        // user2@gmail.com (User123!)
        // user3@yandex.ru (User123!)
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
INSERT INTO [dbo].[AspNetUsers] ([Id], [FullName], [isManager], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES (N'00db3061-d5df-437e-aa30-26125fee0ff3', N'Анна Козлова', 1, N'manager1@istore.ru', N'MANAGER1@ISTORE.RU', N'manager1@istore.ru', N'MANAGER1@ISTORE.RU', 1, N'AQAAAAIAAYagAAAAEGa4BhYIlOve87rvWk/ZJAjNoy52mzn6qay2SB7skBUh5bk5QOkevOinTCovi7EOrw==', N'W54TAB7HR5Q722RVHOKCNGE5JNTIVFS5', N'9fe9485b-101b-4cf8-b4da-aa94e8161834', N'+7 (900) 444-55-66', 1, 0, NULL, 1, 0)
INSERT INTO [dbo].[AspNetUsers] ([Id], [FullName], [isManager], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES (N'bb22178d-4a38-4f06-990a-10e0c3135762', N'Иван Иванов', 0, N'testing@example.com', N'TESTING@EXAMPLE.COM', N'testing@example.com', N'TESTING@EXAMPLE.COM', 1, N'AQAAAAIAAYagAAAAEPaoeomOceSW3ViTIgmEZuugFH2Rv76B4wuRmsMU2hiSy34jSlqT6Nv2LdDaKb4NMg==', N'7K5VU3HZVI7SJWFJHAFI47OUM46CB72K', N'4fcae340-1070-4f23-ac25-1b3647a708e8', N'+7 (900) 123-12-23', 0, 0, NULL, 1, 0)
INSERT INTO [dbo].[AspNetUsers] ([Id], [FullName], [isManager], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES (N'c5bddc72-568b-43b0-94ae-35dae1ab3684', N'Мария Иванова', 0, N'demo@example.com', N'DEMO@EXAMPLE.COM', N'demo@example.com', N'DEMO@EXAMPLE.COM', 1, N'AQAAAAIAAYagAAAAEMVNmQ9KCbL7/xqRD2Oor5AgxcKkAeP5FjwM2JpA699apzfid7YS3SDGLjXphAYDrQ==', N'2LHCM75SFW475OJIE2QW77ODRYKXVCGF', N'fb89f057-ed0d-4528-afc1-02b18db82199', N'+74951234568', 0, 0, NULL, 1, 0)
INSERT INTO [dbo].[AspNetUsers] ([Id], [FullName], [isManager], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES (N'c5e8d3bb-1d61-4be3-8b34-36c85b6f8b3b', N'Администратор Системы', 1, N'admin@istore.ru', N'ADMIN@ISTORE.RU', N'admin@istore.ru', N'ADMIN@ISTORE.RU', 1, N'AQAAAAIAAYagAAAAEJ4NF7WmeUbyVFaltUqS6cS2GmlKc6xUJCp5tTdDSTyk1DMxv8K2H93aYg6dt/Vfdw==', N'7KSQKCP45CW5Y4GOSPOW5FA4I6LQ5SFM', N'6d5e7ff4-ec78-447a-841e-33f6e94ea32a', N'+7 (949) 697-00-64', 1, 0, NULL, 1, 0)
INSERT INTO [dbo].[AspNetUsers] ([Id], [FullName], [isManager], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumber], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnd], [LockoutEnabled], [AccessFailedCount]) VALUES (N'c92435b6-8a54-48ce-8bf8-76e0205761ae', N'Александр Петрович', 0, N'test3@example.com', N'TEST3@EXAMPLE.COM', N'test3@example.com', N'TEST3@EXAMPLE.COM', 1, N'AQAAAAIAAYagAAAAEIHlLa1JJ09g46XBgNtti1d7wy4fjjmKc9/0YgPLmH4hCv163q8p79U55vpqqp/O1Q==', N'UYTKWFNGLEC3W64RH55MLITCCSQTDVLO', N'793059a5-6388-47a7-b9a5-a9db7e73dd68', NULL, 0, 0, NULL, 1, 0)
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}

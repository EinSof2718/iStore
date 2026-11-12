using Exam_Backend.Areas.Identity.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Exam_Backend.Models;

namespace Exam_Backend.Data;

public class Exam_BackendContext : IdentityDbContext<Exam_BackendUser>
{
    public Exam_BackendContext(DbContextOptions<Exam_BackendContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        // Customize the ASP.NET Identity model and override the defaults if needed.
        // For example, you can rename the ASP.NET Identity table names and more.
        // Add your customizations after calling base.OnModelCreating(builder);
    }

    public DbSet<Brand> Brands { get; set; }

    public DbSet<Category> Categories { get; set; }

    public DbSet<Product> Products { get; set; }

    public DbSet<Basket> Baskets { get; set; }

    public DbSet<Order> Orders { get; set; }

    public DbSet<PhotosProduct> PhotosProducts { get; set; }

    public DbSet<SpecificationsProduct> SpecificationsProducts { get; set; }

    public DbSet<Review> Reviews { get; set; }

    public DbSet<ParentCategory> ParentCategories { get; set; }

    public DbSet<OrderItem> OrderItems { get; set; }

    public DbSet<PhotosReview> PhotosReviews { get; set; }

    public DbSet<ReviewReply> ReviewReplys { get; set; }
}

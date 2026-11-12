using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Exam_Backend.Models;
using Microsoft.AspNetCore.Identity;

namespace Exam_Backend.Areas.Identity.Data;

// Add profile data for application users by adding properties to the Exam_BackendUser class
public class Exam_BackendUser : IdentityUser
{
    public string FullName { get; set; }
    public bool isManager {  get; set; }
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}


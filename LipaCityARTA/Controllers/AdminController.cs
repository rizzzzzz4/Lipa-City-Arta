using LipaCityARTA.Models;
using LipaCityARTA.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace LipaCityARTA.Controllers
{
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Login(string username, string password)
        {
            var user = _context.AdminUsers.FirstOrDefault(u => u.Username == username);

            if (user == null)
            {
                ViewBag.Error = "Username not found";
                return View();
            }

            if (user.Password != password)
            {
                ViewBag.Error = "Incorrect password";
                return View();
            }

            HttpContext.Session.SetString("Admin", user.Username ?? string.Empty);
            return RedirectToAction("Dashboard");
        }

        public IActionResult Dashboard()
        {
            if (!IsAdminLoggedIn())
                return RedirectToAction("Login");

            var surveys = _context.SurveyResponses;
            var complaints = _context.Complaints;

            var totalSurveys = surveys.Count();
            var totalComplaints = complaints.Count();
            var totalSubmissions = totalSurveys + totalComplaints;

            var activeUsers = surveys
                .Where(x => !string.IsNullOrEmpty(x.Email))
                .Select(x => x.Email!)
                .Distinct()
                .Count();

            var pendingComplaints = complaints
                .Where(c => c.Status == "Pending")
                .Count();

            var officeBreakdown = surveys
                .Where(x => !string.IsNullOrEmpty(x.Office))
                .GroupBy(x => x.Office!)
                .Select(g => new OfficeCount
                {
                    Office = g.Key,
                    Count = g.Count()
                })
                .ToList();

            var mostVisitedOffice = officeBreakdown
                .OrderByDescending(o => o.Count)
                .Select(o => o.Office)
                .FirstOrDefault() ?? "N/A";

            double[] avgSQDs = new double[9];

            if (totalSurveys > 0)
            {
                avgSQDs[0] = surveys.Average(x => x.SQD0);
                avgSQDs[1] = surveys.Average(x => x.SQD1);
                avgSQDs[2] = surveys.Average(x => x.SQD2);
                avgSQDs[3] = surveys.Average(x => x.SQD3);
                avgSQDs[4] = surveys.Average(x => x.SQD4);
                avgSQDs[5] = surveys.Average(x => x.SQD5);
                avgSQDs[6] = surveys.Average(x => x.SQD6);
                avgSQDs[7] = surveys.Average(x => x.SQD7);
                avgSQDs[8] = surveys.Average(x => x.SQD8);
            }

            List<string> trendDates = new List<string>();
            List<int> trendCounts = new List<int>();

            if (totalSurveys > 0)
            {
                var minDate = surveys.Min(x => x.DateSubmitted);
                var maxDate = surveys.Max(x => x.DateSubmitted);
                var totalDays = (maxDate - minDate).TotalDays;

                if (totalDays <= 30)
                {
                    var trendData = surveys
                        .GroupBy(x => x.DateSubmitted.Date)
                        .Select(g => new
                        {
                            Label = g.Key.ToString("MMM dd"),
                            Count = g.Count(),
                            Date = g.Key
                        })
                        .OrderBy(x => x.Date)
                        .ToList();

                    trendDates = trendData.Select(x => x.Label).ToList();
                    trendCounts = trendData.Select(x => x.Count).ToList();
                }
                else if (totalDays <= 90)
                {
                    var trendData = surveys
                        .AsEnumerable() 
                        .GroupBy(x => new
                        {
                            Year = x.DateSubmitted.Year,
                            Week = System.Globalization.CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
                                x.DateSubmitted,
                                System.Globalization.CalendarWeekRule.FirstDay,
                                DayOfWeek.Monday)
                        })
                        .Select(g => new
                        {
                            Label = $"{g.Min(x => x.DateSubmitted):MMM dd} - {g.Max(x => x.DateSubmitted):MMM dd}",
                            Count = g.Count(),
                            Year = g.Key.Year,
                            Week = g.Key.Week
                        })
                        .OrderBy(x => x.Year)
                        .ThenBy(x => x.Week)
                        .ToList();

                    trendDates = trendData.Select(x => x.Label).ToList();
                    trendCounts = trendData.Select(x => x.Count).ToList();
                }
                else
                {
                    var trendData = surveys
                        .GroupBy(x => new
                        {
                            x.DateSubmitted.Year,
                            x.DateSubmitted.Month
                        })
                        .Select(g => new
                        {
                            Label = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                            Count = g.Count(),
                            Year = g.Key.Year,
                            Month = g.Key.Month
                        })
                        .OrderBy(x => x.Year).ThenBy(x => x.Month)
                        .ToList();

                    trendDates = trendData.Select(x => x.Label).ToList();
                    trendCounts = trendData.Select(x => x.Count).ToList();
                }
            }

            var recentComplaints = complaints
                .OrderByDescending(c => c.DateSubmitted)
                .Take(5)
                .ToList();

            var model = new DashboardViewModel
            {
                TotalSurveys = totalSurveys,
                TotalComplaints = totalComplaints,
                TotalSubmissions = totalSubmissions,
                ActiveUsers = activeUsers,
                PendingComplaints = pendingComplaints,
                OfficeBreakdown = officeBreakdown,
                MostVisitedOffice = mostVisitedOffice,
                AvgSQDs = avgSQDs,
                TrendDates = trendDates,
                TrendCounts = trendCounts,
                RecentComplaints = recentComplaints
            };

            return View(model);
        }

        public IActionResult AnalyticsReports(string? office, DateTime? from, DateTime? to)
        {
            if (!IsAdminLoggedIn())
                return RedirectToAction("Login");

            var start = from?.Date ?? DateTime.Today.AddDays(-30);
            var endDisplay = to?.Date ?? DateTime.Today;
            var end = endDisplay.AddDays(1);

            var surveysQ = _context.SurveyResponses
                .Where(s => s.DateSubmitted >= start && s.DateSubmitted < end);

            var complaintsQ = _context.Complaints
                .Where(c => c.DateSubmitted >= start && c.DateSubmitted < end);

            if (!string.IsNullOrWhiteSpace(office))
            {
                surveysQ = surveysQ.Where(s => s.Office == office);
                complaintsQ = complaintsQ.Where(c => c.Office == office);
            }

            double RowSatisfaction(SurveyResponse s) =>
                (s.SQD0 + s.SQD1 + s.SQD2 + s.SQD3 + s.SQD4 + s.SQD5 + s.SQD6 + s.SQD7 + s.SQD8) / 9.0;

            var totalDays = (endDisplay - start).TotalDays;

            List<string> labels;
            List<double> satTrend;
            List<int> cmpTrend;

            if (totalDays <= 30)
            {
                var sat = surveysQ
                    .AsEnumerable()
                    .GroupBy(s => s.DateSubmitted.Date)
                    .Select(g => new { Date = g.Key, Avg = g.Average(RowSatisfaction) })
                    .ToList();

                var cmp = complaintsQ
                    .GroupBy(c => c.DateSubmitted.Date)
                    .Select(g => new { Date = g.Key, Count = g.Count() })
                    .ToList();

                labels = sat.Select(x => x.Date.ToString("yyyy-MM-dd")).ToList();
                satTrend = sat.Select(x => x.Avg).ToList();
                cmpTrend = cmp.Select(x => x.Count).ToList();
            }
            else if (totalDays <= 90)
            {
                var sat = surveysQ
                    .AsEnumerable()
                    .GroupBy(s => new
                    {
                        Year = s.DateSubmitted.Year,
                        Week = System.Globalization.CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
                            s.DateSubmitted,
                            System.Globalization.CalendarWeekRule.FirstDay,
                            DayOfWeek.Monday)
                    })
                    .Select(g => new
                    {
                        Label = $"{g.Min(x => x.DateSubmitted):MMM dd} - {g.Max(x => x.DateSubmitted):MMM dd}",
                        Avg = g.Average(RowSatisfaction)
                    })
                    .ToList();

                var cmp = complaintsQ
                    .AsEnumerable()
                    .GroupBy(c => new
                    {
                        Year = c.DateSubmitted.Year,
                        Week = System.Globalization.CultureInfo.CurrentCulture.Calendar.GetWeekOfYear(
                            c.DateSubmitted,
                            System.Globalization.CalendarWeekRule.FirstDay,
                            DayOfWeek.Monday)
                    })
                    .Select(g => new
                    {
                        Label = $"{g.Min(x => x.DateSubmitted):MMM dd} - {g.Max(x => x.DateSubmitted):MMM dd}",
                        Count = g.Count()
                    })
                    .ToList();

                labels = sat.Select(x => x.Label).ToList();
                satTrend = sat.Select(x => x.Avg).ToList();
                cmpTrend = cmp.Select(x => x.Count).ToList();
            }
            else
            {
                var sat = surveysQ
                    .AsEnumerable()
                    .GroupBy(s => new { s.DateSubmitted.Year, s.DateSubmitted.Month })
                    .Select(g => new
                    {
                        Label = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                        Avg = g.Average(RowSatisfaction)
                    })
                    .ToList();

                var cmp = complaintsQ
                    .GroupBy(c => new { c.DateSubmitted.Year, c.DateSubmitted.Month })
                    .Select(g => new
                    {
                        Label = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy"),
                        Count = g.Count()
                    })
                    .ToList();

                labels = sat.Select(x => x.Label).ToList();
                satTrend = sat.Select(x => x.Avg).ToList();
                cmpTrend = cmp.Select(x => x.Count).ToList();
            }

            var offices = _context.SurveyResponses
                .Where(s => !string.IsNullOrEmpty(s.Office))
                .Select(s => s.Office!)
                .Union(_context.Complaints
                    .Where(c => !string.IsNullOrEmpty(c.Office))
                    .Select(c => c.Office!))
                .Distinct()
                .ToList();

            offices = offices
                .Take(8) 
                .ToList();

            var officeSat = surveysQ
                .AsEnumerable()
                .Where(s => !string.IsNullOrEmpty(s.Office))
                .GroupBy(s => s.Office!)
                .ToDictionary(g => g.Key, g => g.Average(RowSatisfaction));

            var officeCmp = complaintsQ
                .Where(c => !string.IsNullOrEmpty(c.Office))
                .GroupBy(c => c.Office!)
                .ToDictionary(g => g.Key, g => g.Count());

            var officeSatList = offices.Select(o => officeSat.ContainsKey(o) ? officeSat[o] : 0).ToList();
            var officeCmpList = offices.Select(o => officeCmp.ContainsKey(o) ? officeCmp[o] : 0).ToList();

            var ranked = officeSat
                .OrderByDescending(kv => kv.Value)
                .Select(kv => new OfficeMetric
                {
                    Office = kv.Key,
                    Score = kv.Value
                })
                .ToList();

            var topOffices = ranked.Take(5).ToList();
            var bottomOffices = ranked.OrderBy(x => x.Score).Take(5).ToList();

            double AvgQ(Func<SurveyResponse, int> selector) =>
                surveysQ.Any() ? surveysQ.Average(selector) : 0;

            var questionAverages = new List<QuestionMetric>
            {
                new() { Question = "SQD0", Score = AvgQ(s => s.SQD0) },
                new() { Question = "SQD1", Score = AvgQ(s => s.SQD1) },
                new() { Question = "SQD2", Score = AvgQ(s => s.SQD2) },
                new() { Question = "SQD3", Score = AvgQ(s => s.SQD3) },
                new() { Question = "SQD4", Score = AvgQ(s => s.SQD4) },
                new() { Question = "SQD5", Score = AvgQ(s => s.SQD5) },
                new() { Question = "SQD6", Score = AvgQ(s => s.SQD6) },
                new() { Question = "SQD7", Score = AvgQ(s => s.SQD7) },
                new() { Question = "SQD8", Score = AvgQ(s => s.SQD8) }
            };

            var lowestQuestions = questionAverages
                .OrderBy(x => x.Score)
                .Take(3)
                .ToList();

            var sqdLabels = new List<string>
            {
                "SQD0 – Overall Satisfaction",
                "SQD1 – Time Efficiency",
                "SQD2 – Process Compliance",
                "SQD3 – Process Simplicity",
                "SQD4 – Information Accessibility",
                "SQD5 – Reasonable Fees",
                "SQD6 – Fairness",
                "SQD7 – Staff Courtesy",
                "SQD8 – Service Outcome"
            };

            var sqdScores = new List<double>
            {
                AvgQ(s => s.SQD0),
                AvgQ(s => s.SQD1),
                AvgQ(s => s.SQD2),
                AvgQ(s => s.SQD3),
                AvgQ(s => s.SQD4),
                AvgQ(s => s.SQD5),
                AvgQ(s => s.SQD6),
                AvgQ(s => s.SQD7),
                AvgQ(s => s.SQD8)
            };

            double avgSat = surveysQ.Any()
                ? surveysQ.AsEnumerable().Average(RowSatisfaction)
                : 0;

            var vm = new AnalyticsDashboardViewModel
            {
                Office = office,
                From = start,
                To = endDisplay,

                TotalSurveys = surveysQ.Count(),
                TotalComplaints = complaintsQ.Count(),
                AvgSatisfaction = avgSat,

                Labels = labels,
                SatisfactionTrend = satTrend,
                ComplaintTrend = cmpTrend,

                Offices = offices,
                OfficeSatisfaction = officeSatList,
                OfficeComplaints = officeCmpList,

                TopOffices = topOffices,
                BottomOffices = bottomOffices,
                LowestQuestions = lowestQuestions,

                SQDLabels = sqdLabels,
                SQDScores = sqdScores
            };

            return View(vm);
        }

        public IActionResult SurveyReports(string? office, DateTime? dateFrom, DateTime? dateTo, int page = 1, int pageSize = 10)
        {
            if (!IsAdminLoggedIn())
                return RedirectToAction("Login");

            var query = _context.SurveyResponses.AsQueryable();

            if (!string.IsNullOrWhiteSpace(office))
            {
                query = query.Where(s => s.Office == office);
            }

            if (dateFrom.HasValue)
            {
                query = query.Where(s => s.DateSubmitted >= dateFrom.Value.Date);
            }

            if (dateTo.HasValue)
            {
                var end = dateTo.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(s => s.DateSubmitted <= end);
            }

            var allData = query
                .OrderByDescending(s => s.DateSubmitted)
                .ToList();

            var pagedData = allData
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var model = new SurveyReportsViewModel
            {
                Surveys = pagedData,
                AllSurveys = allData, 
                CurrentPage = page,
                PageSize = pageSize,
                TotalRecords = allData.Count,
                Office = office,
                DateFrom = dateFrom,
                DateTo = dateTo
            };

            return View(model);
        }

        public IActionResult Complaints(string? office, string? status,
                                        DateTime? dateFrom, DateTime? dateTo, string? search)
        {
            if (!IsAdminLoggedIn())
                return RedirectToAction("Login");

            var q = _context.Complaints
                .Include(c => c.ActionHistories)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(office) && office != "All")
                q = q.Where(c => c.Office == office);

            if (dateFrom.HasValue)
                q = q.Where(c => c.DateSubmitted >= dateFrom.Value.Date);

            if (dateTo.HasValue)
                q = q.Where(c => c.DateSubmitted < dateTo.Value.Date.AddDays(1));

            if (!string.IsNullOrWhiteSpace(search))
                q = q.Where(c =>
                    (c.Office ?? "").Contains(search) ||
                    (c.Reason ?? "").Contains(search) ||
                    (c.Message ?? "").Contains(search) ||
                    (c.Email ?? "").Contains(search));

            var list = q
                .OrderByDescending(c => c.DateSubmitted)
                .ToList();

            int overdueDays = 3;

            string EffectiveStatus(Complaint complaint)
            {
                var currentStatus = (complaint.Status ?? "Pending").Trim();

                if (currentStatus != "Resolved" &&
                    currentStatus != "Escalated" &&
                    complaint.DateSubmitted <= DateTime.Now.AddDays(-overdueDays))
                {
                    return "Overdue";
                }

                return currentStatus;
            }

            if (!string.IsNullOrWhiteSpace(status) && status != "All")
            {
                list = list
                    .Where(c => EffectiveStatus(c) == status)
                    .ToList();
            }

            var vm = new ComplaintListViewModel
            {
                Complaints = list,

                Office = office,
                Status = status,
                DateFrom = dateFrom,
                DateTo = dateTo,
                Search = search,

                Total = list.Count,

                Pending = list.Count(c => EffectiveStatus(c) == "Pending"),
                InProgress = list.Count(c => EffectiveStatus(c) == "In Progress"),
                Resolved = list.Count(c => EffectiveStatus(c) == "Resolved"),
                Escalated = list.Count(c => EffectiveStatus(c) == "Escalated"),

                OpenCount = list.Count(c =>
                    EffectiveStatus(c) == "Pending" ||
                    EffectiveStatus(c) == "In Progress" ||
                    EffectiveStatus(c) == "Overdue" ||
                    EffectiveStatus(c) == "Escalated"),

                OverdueCount = list.Count(c => EffectiveStatus(c) == "Overdue"),
                UnassignedCount = 0,

                NewComplaints = list.Count(c => c.DateSubmitted >= DateTime.Today.AddDays(-7)),
                ResolvedCount = list.Count(c => EffectiveStatus(c) == "Resolved"),

                BacklogAvg = list.Count(c =>
                    EffectiveStatus(c) == "Pending" ||
                    EffectiveStatus(c) == "In Progress" ||
                    EffectiveStatus(c) == "Overdue" ||
                    EffectiveStatus(c) == "Escalated"),

                ByOffice = list
                    .GroupBy(c => string.IsNullOrWhiteSpace(c.Office) ? "Unknown" : c.Office)
                    .OrderByDescending(g => g.Count())
                    .ToDictionary(g => g.Key, g => g.Count()),

                ByReason = list
                    .SelectMany(c => (c.Reason ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries))
                    .Select(x => x.Trim())
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .GroupBy(x => x)
                    .OrderByDescending(g => g.Count())
                    .ToDictionary(g => g.Key, g => g.Count()),

                ByDate = list
                    .GroupBy(c => c.DateSubmitted.Date)
                    .OrderBy(g => g.Key)
                    .ToDictionary(g => g.Key.ToString("yyyy-MM-dd"), g => g.Count())
            };

            return View(vm);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult UpdateStatus(int id, string status)
        {
            if (!IsAdminLoggedIn())
                return RedirectToAction("Login");

            var complaint = _context.Complaints.FirstOrDefault(c => c.Id == id);
            if (complaint == null) return RedirectToAction("Complaints");

            complaint.Status = status;

            _context.SaveChanges();
            return RedirectToAction("Complaints");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult AdvanceComplaintStatus(int id)
        {
            if (!IsAdminLoggedIn())
                return RedirectToAction("Login");

            var complaint = _context.Complaints.FirstOrDefault(c => c.Id == id);

            if (complaint == null)
                return NotFound();

            var status = (complaint.Status ?? "Pending").Trim();

            if (status == "Pending")
                complaint.Status = "In Progress";
            else if (status == "In Progress" || status == "Overdue" || status == "Escalated")
                complaint.Status = "Resolved";

            _context.SaveChanges();

            return RedirectToAction("Complaints");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult UpdateComplaintStatus(int id, string status, string? adminActionNote, bool isCaseClosed = false)
        {
            if (!IsAdminLoggedIn())
                return RedirectToAction("Login");

            var complaint = _context.Complaints
                .Include(c => c.ActionHistories)
                .FirstOrDefault(c => c.Id == id);

            if (complaint == null)
            {
                return NotFound();
            }

            var currentStatus = (complaint.Status ?? "").Trim();

            if (status == "In Progress")
            {
                if (string.IsNullOrWhiteSpace(adminActionNote))
                {
                    TempData["Error"] = "Please enter an action note before marking this complaint as In Progress.";
                    return RedirectToAction("Complaints");
                }

                complaint.Status = "In Progress";
                complaint.IsCaseClosed = false;
                complaint.ResolvedAt = null;

                // keep latest note in main complaint if you still want it
                complaint.AdminActionNote = adminActionNote.Trim();

                _context.ComplaintActionHistories.Add(new ComplaintActionHistory
                {
                    ComplaintId = complaint.Id,
                    ActionNote = adminActionNote.Trim(),
                    StatusAtThatTime = "In Progress",
                    CreatedAt = DateTime.Now
                });
            }
            else if (status == "Resolved")
            {
                if (currentStatus != "In Progress" && currentStatus != "Overdue" && currentStatus != "Escalated")
                {
                    TempData["Error"] = "Complaint must first be in progress before it can be resolved.";
                    return RedirectToAction("Complaints");
                }

                if (!isCaseClosed)
                {
                    TempData["Error"] = "Please confirm that the case is closed before resolving the complaint.";
                    return RedirectToAction("Complaints");
                }

                if (string.IsNullOrWhiteSpace(adminActionNote))
                {
                    TempData["Error"] = "Please enter a final action note before resolving the complaint.";
                    return RedirectToAction("Complaints");
                }

                complaint.Status = "Resolved";
                complaint.IsCaseClosed = true;
                complaint.ResolvedAt = DateTime.Now;

                // keep latest note in main complaint if you still want it
                complaint.AdminActionNote = adminActionNote.Trim();

                _context.ComplaintActionHistories.Add(new ComplaintActionHistory
                {
                    ComplaintId = complaint.Id,
                    ActionNote = adminActionNote.Trim(),
                    StatusAtThatTime = "Resolved",
                    CreatedAt = DateTime.Now
                });
            }
            else
            {
                TempData["Error"] = "Invalid complaint status update.";
                return RedirectToAction("Complaints");
            }

            _context.SaveChanges();

            TempData["Success"] = "Complaint updated successfully.";
            return RedirectToAction("Complaints");
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Login");
        }

        private bool IsAdminLoggedIn()
        {
            return !string.IsNullOrEmpty(HttpContext.Session.GetString("Admin"));
        }
    }
}
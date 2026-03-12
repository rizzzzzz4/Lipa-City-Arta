using Microsoft.AspNetCore.Mvc;
using LipaCityARTA.Models;
using System;

namespace LipaCityARTA.Controllers
{
    public class PublicController : Controller
    {
        private readonly ApplicationDbContext _context;

        public PublicController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult Choose()
        {
            return View();
        }

        [HttpGet]
        public IActionResult Surveys()
        {
            return View(new SurveyResponse());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Surveys(SurveyResponse model)
        {
            if (ModelState.IsValid)
            {
                model.DateSubmitted = DateTime.Now;
                _context.SurveyResponses.Add(model);    
                _context.SaveChanges();

                // Optionally pass data to ThankYou page
                return RedirectToAction("ThankYou", new { id = model.Id });
            }

            return View("Surveys", model);
        }


        [HttpGet]
        public IActionResult Complaint()
        {
            return View();
        }

        // ===============================
        // Complaint Submit (POST)
        // ===============================
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Complaint(Complaint model)
        {
            if (ModelState.IsValid)
            {
                model.TrackingId = GenerateTrackingId();
                model.Status = "Pending";
                model.DateSubmitted = DateTime.Now;

                _context.Complaints.Add(model);
                _context.SaveChanges();

                TempData["TrackingId"] = model.TrackingId;   // IMPORTANT

                return RedirectToAction("ThankYou");
            }

            return View(model);
        }


        [HttpGet]
        public IActionResult ThankYou()
        {
            return View();
        }

        private string GenerateTrackingId()
        {
            return "ARTA-" + Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
        }

        [HttpGet]
        public IActionResult TrackComplaint()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult TrackComplaint(string trackingId)
        {
            if (string.IsNullOrWhiteSpace(trackingId))
            {
                ViewBag.Error = "Please enter your tracking ID.";
                return View();
            }

            trackingId = trackingId.Trim();

            var complaint = _context.Complaints
                .FirstOrDefault(c => c.TrackingId == trackingId);

            if (complaint == null)
            {
                ViewBag.Error = "Tracking ID not found.";
                return View();
            }

            return View("TrackComplaintResult", complaint);
        }
    }
}
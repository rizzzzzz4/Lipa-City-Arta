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


        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Complaint(Complaint model)
        {
            if (ModelState.IsValid)
            {
                _context.Complaints.Add(model);
                _context.SaveChanges();

                return RedirectToAction("ThankYou");
            }

            return View(model);
        }

        [HttpGet]
        public IActionResult ThankYou()
        {
            return View();
        }

        public IActionResult Consent()
        {
            return View();
        }
    }
}


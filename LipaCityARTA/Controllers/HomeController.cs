using LipaCityARTA.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace LipaCityARTA.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View("~/Views/Public/Choose.cshtml");
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}

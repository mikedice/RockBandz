using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using gal = InTheFrontRow.Models.Views.Home;

namespace InTheFrontRow.Models.Views.Home
{
    public class HomeModel
    {
        public IEnumerable<gal.Gallery> Galleries { get; set; }
    }
}
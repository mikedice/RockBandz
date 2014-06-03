using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;
using InTheFrontRow.Models;
using InTheFrontRow.Models.Gallery;

namespace InTheFrontRowUnitTest
{
    [TestClass]
    public class ControllerTests
    {
        [TestMethod]
        public void TestMethod1()
        {
            var gallery = new Gallery()
            {
                Metadata = new GalleryMetadata()
                {
                    Description = "test description",
                    Title = "test title",
                    Id = Guid.NewGuid().ToString()
                },
                ImageUrls = new String[] {"", ""}
            };
            var stringified = JsonConvert.SerializeObject(gallery);
            System.Diagnostics.Debug.WriteLine(stringified);

        }
    }
}

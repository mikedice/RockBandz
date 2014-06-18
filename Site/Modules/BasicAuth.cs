using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Threading;
using System.Security;
using System.Security.Principal;
using System.Text;
using System.Net.Http.Headers;

namespace InTheFrontRow.Modules
{
    public class BasicAuth : IHttpModule
    {
        private const string Realm = "in-the-frontrow";

        public void Init(HttpApplication context)
        {
            // Register event handlers
            context.AuthenticateRequest += OnApplicationAuthenticateRequest;
            context.EndRequest += OnApplicationEndRequest;
        }

        private static void SetPrincipal(IPrincipal principal)
        {
            Thread.CurrentPrincipal = principal;
            if (HttpContext.Current != null)
            {
                HttpContext.Current.User = principal;
            }
        }

        private static bool CheckPassword(string username, string password)
        {
            bool result = false;
            try
            {
                NameValueCollection section = (NameValueCollection)ConfigurationManager.GetSection("Users");
                string pwd = section[username];
                result = !string.IsNullOrEmpty(pwd);
            }
            catch { }
            return result;
        }

        private static bool AuthenticateUser(string credentials)
        {
            bool validated = false;
            try
            {
                var encoding = Encoding.GetEncoding("iso-8859-1");
                credentials = encoding.GetString(Convert.FromBase64String(credentials));

                int separator = credentials.IndexOf(':');
                string name = credentials.Substring(0, separator);
                string password = credentials.Substring(separator + 1);

                validated = CheckPassword(name, password);
                if (validated)
                {
                    var identity = new GenericIdentity(name);
                    SetPrincipal(new GenericPrincipal(identity, null));
                }
            }
            catch (FormatException)
            {
                // Credentials were not formatted correctly.
                validated = false;

            }
            return validated;
        }

        private static void OnApplicationAuthenticateRequest(object sender, EventArgs e)
        {
            if (!UrlHasSegment("Mgmt") && !UrlHasSegment("api"))
            {
                Trace.WriteLine("[NoAuthN] " + HttpContext.Current.Request.Url);
                return;
            }

            Trace.WriteLine("[RequireAuthN] " + HttpContext.Current.Request.Url);
            var request = HttpContext.Current.Request;
            var authHeader = request.Headers["Authorization"];
            if (authHeader != null)
            {
                var authHeaderVal = AuthenticationHeaderValue.Parse(authHeader);

                // RFC 2617 sec 1.2, "scheme" name is case-insensitive
                if (authHeaderVal.Scheme.Equals("basic",
                        StringComparison.OrdinalIgnoreCase) &&
                    authHeaderVal.Parameter != null)
                {
                    if (!AuthenticateUser(authHeaderVal.Parameter))
                    {
                        
                        HttpContext.Current.Response.StatusCode = 401;
                        HttpContext.Current.Response.End();
                        

                    }
                }
            }
            else
            {
                HttpContext.Current.Response.StatusCode = 401;
                HttpContext.Current.Response.End();
            }
        }

        // If the request was unauthorized, add the WWW-Authenticate header 
        // to the response.
        private static void OnApplicationEndRequest(object sender, EventArgs e)
        {
            var response = HttpContext.Current.Response;
            if (response.StatusCode == 401)
            {
                response.Headers.Add("WWW-Authenticate",
                    string.Format("Basic realm=\"{0}\"", Realm));
            }
        }

        private static bool UrlHasSegment(string segment)
        {
            return HttpContext.Current.Request.Url.Segments.Where(
                s => s.Equals(segment + "/", StringComparison.OrdinalIgnoreCase))
                .Any();
        }
        public void Dispose()
        {
        }
    }
 
}
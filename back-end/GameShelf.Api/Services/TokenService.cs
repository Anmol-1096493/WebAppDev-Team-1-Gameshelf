using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace GameShelf.Api.Services;

/// <summary>
/// Creates and validates HMAC-SHA256 signed bearer tokens for the prototype.
/// A token is <c>memberId.signature</c> (base64url); the signature prevents a
/// member from forging another member's id without the server secret.
/// </summary>
public sealed class TokenService
{
    // Prototype-only secret. Move to configuration before production.
    private const string Secret = "gameshelf-prototype-secret-do-not-use-in-production";

    public string Create(Guid memberId)
    {
        var payload = memberId.ToString();
        var sig = Sign(payload);
        return Base64UrlEncode(Encoding.UTF8.GetBytes($"{payload}.{sig}"));
    }

    public Guid? Validate(string token)
    {
        string payload;
        string sig;
        try
        {
            var decoded = Encoding.UTF8.GetString(Base64UrlDecode(token));
            var parts = decoded.Split('.');
            if (parts.Length != 2) return null;
            payload = parts[0];
            sig = parts[1];
        }
        catch { return null; }

        if (!Guid.TryParse(payload, out var memberId)) return null;
        if (!FixedTimeEquals(sig, Sign(payload))) return null;
        return memberId;
    }

    private static string Sign(string payload)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(Secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Base64UrlEncode(hash);
    }

    private static bool FixedTimeEquals(string a, string b)
    {
        var ab = Encoding.UTF8.GetBytes(a);
        var bb = Encoding.UTF8.GetBytes(b);
        return ab.Length == bb.Length && CryptographicOperations.FixedTimeEquals(ab, bb);
    }

    private static string Base64UrlEncode(byte[] bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static byte[] Base64UrlDecode(string s)
    {
        var padded = s.Replace('-', '+').Replace('_', '/');
        padded = padded.PadRight(padded.Length + ((4 - padded.Length % 4) % 4), '=');
        return Convert.FromBase64String(padded);
    }
}

public sealed class BearerAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger, UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var auth = Request.Headers.Authorization.ToString();
        if (!auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return Task.FromResult(AuthenticateResult.NoResult());

        var token = auth["Bearer ".Length..].Trim();
        var memberId = new TokenService().Validate(token);
        if (memberId is null)
            return Task.FromResult(AuthenticateResult.Fail("Invalid token"));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, memberId.Value.ToString()),
        };
        var identity = new ClaimsIdentity(claims, "Bearer");
        return Task.FromResult(AuthenticateResult.Success(
            new AuthenticationTicket(new ClaimsPrincipal(identity), "Bearer")));
    }
}
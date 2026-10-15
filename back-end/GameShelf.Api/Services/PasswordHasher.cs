using System.Security.Cryptography;
using System.Text;

namespace GameShelf.Api.Services;

/// <summary>
/// PBKDF2-HMAC-SHA256 password hashing. Salts are stored alongside the hash in
/// the format <c>iterations.saltBase64.hashBase64</c>.
/// </summary>
public static class PasswordHasher
{
    private const int Iterations = 600_000;
    private const int SaltBytes = 16;
    private const int HashBytes = 32;

    public static string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltBytes);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password), salt, Iterations, HashAlgorithmName.SHA256, HashBytes);
        return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public static bool Verify(string password, string stored)
    {
        var parts = stored.Split('.');
        if (parts.Length != 3 || !int.TryParse(parts[0], out var iterations) || iterations < 1 || iterations > 2_000_000)
            return false;
        try
        {
            var salt = Convert.FromBase64String(parts[1]);
            var expected = Convert.FromBase64String(parts[2]);
            if (salt.Length < SaltBytes || expected.Length != HashBytes) return false;
            var actual = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password), salt, iterations, HashAlgorithmName.SHA256, HashBytes);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch (FormatException)
        {
            return false;
        }
    }

    // Upgrade older hashes after a successful login without changing the password.
    public static bool NeedsRehash(string stored)
        => !int.TryParse(stored.Split('.')[0], out var iterations) || iterations < Iterations;
}

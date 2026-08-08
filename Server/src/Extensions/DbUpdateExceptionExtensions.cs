using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Server.Extensions;

internal static class DbUpdateExceptionExtensions
{
    public static bool IsUniqueViolation(
        this DbUpdateException exception,
        string constraintName) =>
        exception.InnerException is PostgresException
        {
            SqlState: PostgresErrorCodes.UniqueViolation
        } postgresException &&
        string.Equals(
            postgresException.ConstraintName,
            constraintName,
            StringComparison.Ordinal);
}

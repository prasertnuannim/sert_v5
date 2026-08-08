namespace Server.DTOs;

public sealed record RoleResponseDto(
    string Name,
    string DisplayName,
    string Description,
    int Level);

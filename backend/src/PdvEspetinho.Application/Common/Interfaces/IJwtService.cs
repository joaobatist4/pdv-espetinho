using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Application.Common.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}

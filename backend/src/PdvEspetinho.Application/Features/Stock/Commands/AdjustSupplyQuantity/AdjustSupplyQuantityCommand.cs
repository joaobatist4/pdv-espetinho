using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Application.Features.Stock.Commands.AdjustSupplyQuantity;

public record AdjustSupplyQuantityCommand(Guid SupplyId, decimal Delta, MovementType Type) : IRequest<Result>;

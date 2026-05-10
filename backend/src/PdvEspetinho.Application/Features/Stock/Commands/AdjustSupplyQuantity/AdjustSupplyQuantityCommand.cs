using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Stock.Commands.AdjustSupplyQuantity;

public record AdjustSupplyQuantityCommand(Guid SupplyId, decimal Delta) : IRequest<Result>;

using FluentResults;
using FluentValidation;
using MediatR;

namespace PdvEspetinho.Application.Common.Behaviors;

public class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (!validators.Any())
            return await next(ct);

        var context = new ValidationContext<TRequest>(request);
        var failures = validators
            .Select(v => v.Validate(context))
            .SelectMany(r => r.Errors)
            .Where(e => e is not null)
            .Select(e => new Error(e.ErrorMessage))
            .ToList();

        if (failures.Count == 0)
            return await next(ct);

        return CreateFailedResult(failures);
    }

    private static TResponse CreateFailedResult(List<Error> errors)
    {
        var responseType = typeof(TResponse);

        if (responseType == typeof(Result))
            return (TResponse)(object)Result.Fail(errors);

        if (responseType.IsGenericType && responseType.GetGenericTypeDefinition() == typeof(Result<>))
        {
            var innerType = responseType.GetGenericArguments()[0];
            var failMethod = typeof(Result)
                .GetMethods()
                .First(m => m.Name == "Fail" && m.IsGenericMethod && m.GetParameters().Length == 1
                            && m.GetParameters()[0].ParameterType == typeof(IEnumerable<IError>))
                .MakeGenericMethod(innerType);
            return (TResponse)failMethod.Invoke(null, [errors.Cast<IError>().ToList()])!;
        }

        throw new InvalidOperationException($"TResponse {responseType.Name} is not a FluentResults Result type.");
    }
}

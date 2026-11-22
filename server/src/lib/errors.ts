/**
 * RFC 7807 problem+json envelope — every error the API returns has this shape.
 * Server-side twin of `Problem` in @resona/api-types.
 */
import type { NextFunction, Request, Response } from 'express';
import type { ZodError } from 'zod';

const PROBLEM_BASE = 'https://resona.dev/problems';

export class ApiError extends Error {
  constructor(
    public status: number,
    public type: string,
    public title: string,
    public detail?: string,
    public errors?: { path: string; message: string }[],
  ) {
    super(title);
    this.name = 'ApiError';
  }
}

export const badRequest = (detail: string) =>
  new ApiError(400, `${PROBLEM_BASE}/bad-request`, 'Bad request', detail);

export const notFound = () =>
  new ApiError(404, `${PROBLEM_BASE}/not-found`, 'Not found', 'The requested resource does not exist.');

export const validationFailed = (zerr: ZodError) =>
  new ApiError(
    422,
    `${PROBLEM_BASE}/validation`,
    'Validation failed',
    'One or more fields are invalid.',
    zerr.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
  );

/** Terminal middleware — must be registered last. */
export function problemHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (res.headersSent) return;

  let problem: ApiError;
  if (err instanceof ApiError) {
    problem = err;
  } else if (err instanceof SyntaxError && 'body' in err) {
    problem = badRequest('Request body is not valid JSON.');
  } else if (err instanceof Error && err.name === 'ZodError') {
    problem = new ApiError(422, `${PROBLEM_BASE}/validation`, 'Validation failed', 'One or more fields are invalid.');
  } else {
    // Unknown: log it, leak nothing.
    console.error('[unhandled]', err);
    problem = new ApiError(500, `${PROBLEM_BASE}/internal`, 'Internal server error');
  }

  res
    .status(problem.status)
    .type('application/problem+json')
    .json({
      type: problem.type,
      title: problem.title,
      status: problem.status,
      ...(problem.detail ? { detail: problem.detail } : {}),
      ...(problem.errors ? { errors: problem.errors } : {}),
      trace_id: res.locals.traceId,
    });
}

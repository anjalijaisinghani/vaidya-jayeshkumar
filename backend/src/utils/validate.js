import { HttpError } from './httpError.js';

export function parse(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`)
      .join('; ');
    throw new HttpError(400, `Invalid request: ${message}`);
  }
  return result.data;
}
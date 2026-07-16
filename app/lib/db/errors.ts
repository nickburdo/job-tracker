export class RepositoryError extends Error {
  data?: { fieldErrors: Record<string, string> };

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'RepositoryError';

    if (fieldErrors) {
      this.data = { fieldErrors };
    }
  }
}

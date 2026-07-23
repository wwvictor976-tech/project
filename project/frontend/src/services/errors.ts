export class BackendNotImplementedError extends Error {
  constructor(serviceName: string) {
    super(`${serviceName}: backend não implementado`);
    this.name = 'BackendNotImplementedError';
  }
}

export const backendNotImplemented = (serviceName: string) => new BackendNotImplementedError(serviceName);

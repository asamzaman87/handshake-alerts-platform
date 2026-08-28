export async function loadWithRetries<T>(
  load: () => Promise<T>,
  retries = 2,
  delayMs = 400
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await load();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) =>
          window.setTimeout(resolve, delayMs * (attempt + 1))
        );
      }
    }
  }
  throw lastError;
}

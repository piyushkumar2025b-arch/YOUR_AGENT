let sharedStorageLock: Promise<void> = Promise.resolve();

export async function withSharedStorageLock<T>(fn: () => Promise<T>): Promise<T> {
  const previous = sharedStorageLock;
  let release!: () => void;

  sharedStorageLock = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;
  try {
    return await fn();
  } finally {
    release();
  }
}

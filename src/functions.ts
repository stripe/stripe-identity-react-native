export function init(options: Options): void {
  console.log(options);
}

export function present(
  sessionId: string,
  ephemeralKeySecret: string
): Promise<{ status: IdentityStatus }> {
  console.log(sessionId);
  console.log(ephemeralKeySecret);
  return new Promise((resolve) => {
    resolve({ status: 'Completed' });
  });
}

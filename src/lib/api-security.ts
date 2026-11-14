export function hasAdminRole(roles: { role: string }[] | null | undefined): boolean {
  return roles?.some((row) => row.role === "admin") === true;
}

export function credentialStatus(configured: boolean, updatedAt: string | null) {
  return { configured, updatedAt };
}

export function validCredential(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 256 && !/[\s\r\n]/.test(value);
}
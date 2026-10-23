/** Never serialize an exception: database errors can contain passwords, SQL or rows. */
export function migrationFailure(stage: string, error: unknown) {
  const knownStages = ['configuration', 'connection', 'schema-check', 'backup-check', 'apply'];
  const candidate = error as { code?: unknown; driverError?: { code?: unknown } } | null;
  const rawCode = candidate?.driverError?.code ?? candidate?.code;
  const allowedNetworkCodes = [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNRESET',
    'SELF_SIGNED_CERT_IN_CHAIN',
    'DEPTH_ZERO_SELF_SIGNED_CERT',
    'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  ];
  const code =
    typeof rawCode === 'string' && (/^[0-9A-Z]{5}$/.test(rawCode) || allowedNetworkCodes.includes(rawCode)) ? rawCode : 'UNCLASSIFIED';
  return {
    event: 'security_migration_failed',
    stage: knownStages.includes(stage) ? stage : 'unknown',
    code,
    hint: 'Check required variables, trusted TLS certificate, database permissions and existing schema. No credentials or SQL are logged.',
  };
}

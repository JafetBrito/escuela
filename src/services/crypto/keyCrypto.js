// Mock license key generation/validation.
// Production: replace with server-issued, asymmetrically-signed licenses
// (see architecture notes — Stripe webhook signs payload with a private key,
// client verifies with an embedded public key via Web Crypto SubtleCrypto).

const MOCK_SIGNING_SECRET = 'mock-dev-secret-do-not-use-in-prod'

// `type` controls course access:
//   'single' -> only unlocks `courseId`
//   'full'   -> unlocks every course in courses.json
// (Enforcement of 'single' is not yet implemented — everything stays
// unlocked for now, but the field is here so the UI/data model is ready.)
export function generateMockLicense({ courseId = 'course-001', role, type = 'single' } = {}) {
  const payload = {
    courseId,
    licenseId: crypto.randomUUID(),
    minimaxApiKey: 'mx-mock-api-key-placeholder',
    issuedAt: new Date().toISOString(),
    type,
    ...(role ? { role } : {}),
  }
  const signature = btoa(
    `${MOCK_SIGNING_SECRET}:${JSON.stringify(payload)}`,
  ).slice(0, 32)
  return { ...payload, signature }
}

export function validateLicense(license) {
  if (!license || typeof license !== 'object') return false
  const { signature, ...payload } = license
  const expected = btoa(
    `${MOCK_SIGNING_SECRET}:${JSON.stringify(payload)}`,
  ).slice(0, 32)
  return signature === expected
}

export function downloadLicenseFile(license, filename = 'license.key') {
  const blob = new Blob([JSON.stringify(license, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

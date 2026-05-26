<?php
// ============================================================
// helpers/jwt.php
// Pure-PHP JWT implementation (HS256)
// No external library required.
// ============================================================

class JWT {

    // ── Encode ───────────────────────────────────────────────
    public static function encode(array $payload): string {
        $header = self::base64UrlEncode(json_encode([
            'typ' => 'JWT',
            'alg' => JWT_ALGORITHM,
        ]));

        // Add standard claims
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRY;

        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payloadEncoded", JWT_SECRET, true)
        );

        return "$header.$payloadEncoded.$signature";
    }

    // ── Decode & Verify ──────────────────────────────────────
    public static function decode(string $token): ?array {
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        [$headerB64, $payloadB64, $signatureB64] = $parts;

        // Verify signature
        $expectedSig = self::base64UrlEncode(
            hash_hmac('sha256', "$headerB64.$payloadB64", JWT_SECRET, true)
        );

        if (!hash_equals($expectedSig, $signatureB64)) {
            return null;  // Tampered token
        }

        $payload = json_decode(self::base64UrlDecode($payloadB64), true);

        if (!$payload) {
            return null;
        }

        // Check expiry
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null;  // Expired token
        }

        return $payload;
    }

    // ── Extract token from Authorization header ───────────────
    public static function getBearerToken(): ?string {
        $headers = $_SERVER['HTTP_AUTHORIZATION']
                ?? getallheaders()['Authorization']
                ?? getallheaders()['authorization']
                ?? null;

        if ($headers && preg_match('/^Bearer\s+(.+)$/i', $headers, $matches)) {
            return $matches[1];
        }

        return null;
    }

    // ── Private helpers ──────────────────────────────────────
    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
    }
}

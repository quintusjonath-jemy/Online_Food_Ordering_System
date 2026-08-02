<?php
ini_set('display_errors', '0');
error_reporting(E_ALL);

/**
 * Load Environment Variables from .env file
 */
function loadBackendEnv(string $path): void {
    if (!file_exists($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (str_contains($line, '=')) {
            [$name, $value] = explode('=', $line, 2);
            $name  = trim($name);
            $value = trim($value);
            if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
                $value = substr($value, 1, -1);
            }
            if (!getenv($name)) {
                putenv("$name=$value");
                $_ENV[$name]    = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

// Load backend/.env
loadBackendEnv(__DIR__ . '/../.env');

/**
 * Database Configuration Class
 * Provides PDO database connection using OOP principles
 */
class Database {
    private string $host;
    private string $db_name;
    private string $username;
    private string $password;
    private ?PDO   $conn = null;

    public function __construct() {
        $this->host     = getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? 'localhost');
        $this->db_name  = getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? 'food_ordering_db');
        $this->username = getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? 'root');
        $this->password = getenv('DB_PASS') ?: ($_ENV['DB_PASS'] ?? '');
    }

    /**
     * Get database connection (singleton pattern)
     */
    public function getConnection(): PDO {
        if ($this->conn === null) {
            try {
                if (str_contains($this->host, ':')) {
                    [$hostName, $port] = explode(':', $this->host, 2);
                    $dsn = "mysql:host={$hostName};port={$port};dbname={$this->db_name};charset=utf8mb4";
                } else {
                    $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
                }

                $this->conn = new PDO($dsn, $this->username, $this->password, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e) {
                setCorsHeaders();
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
                exit;
            }
        }
        return $this->conn;
    }
}

/**
 * Set CORS and JSON response headers
 */
function setCorsHeaders(): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (!empty($origin)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
    } else {
        header("Access-Control-Allow-Origin: *");
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
    header('Access-Control-Max-Age: 3600');
    header('Content-Type: application/json; charset=utf-8');

    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * Get request body as decoded JSON array
 */
function getRequestBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

/**
 * Send a JSON response and exit
 */
function sendResponse(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

/**
 * Verify JWT token from Authorization header and return payload
 * Returns null if invalid
 */
function verifyToken(): ?array {
    $headers = getallheaders();
    $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!str_starts_with($auth, 'Bearer ')) {
        return null;
    }
    $token = substr($auth, 7);
    return decodeJWT($token);
}

/**
 * Require authenticated user; abort with 401 if not authenticated
 */
function requireAuth(): array {
    $payload = verifyToken();
    if (!$payload) {
        sendResponse(['success' => false, 'message' => 'Unauthorized. Please log in.'], 401);
    }
    return $payload;
}

/**
 * Require admin role; abort with 403 if not admin
 */
function requireAdmin(): array {
    $payload = requireAuth();
    if ($payload['role'] !== 'admin') {
        sendResponse(['success' => false, 'message' => 'Forbidden. Admin access required.'], 403);
    }
    return $payload;
}

// ── JWT Helpers ──────────────────────────────────────────────────────────────
$jwtSecret = getenv('JWT_SECRET') ?: ($_ENV['JWT_SECRET'] ?? 'food_ordering_secret_key_2024_very_secure');
if (!defined('JWT_SECRET')) {
    define('JWT_SECRET', $jwtSecret);
}
if (!defined('JWT_EXPIRY')) {
    define('JWT_EXPIRY', 86400); // 24 hours
}

function base64UrlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
}

function createJWT(array $payload): string {
    $header    = base64UrlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    $body      = base64UrlEncode(json_encode($payload));
    $signature = base64UrlEncode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    return "$header.$body.$signature";
}

function decodeJWT(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$header, $body, $signature] = $parts;
    $expectedSig = base64UrlEncode(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    if (!hash_equals($expectedSig, $signature)) return null;
    $payload = json_decode(base64UrlDecode($body), true);
    if (!$payload || $payload['exp'] < time()) return null;
    return $payload;
}

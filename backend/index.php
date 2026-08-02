<?php
// If running PHP dev server in backend/ root and request URI starts with /backend/, route to target file
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
if (is_string($uri) && str_starts_with($uri, '/backend/')) {
    $targetFile = __DIR__ . substr($uri, 8);
    if (file_exists($targetFile) && is_file($targetFile)) {
        require $targetFile;
        exit;
    }
}

require_once __DIR__ . '/config/database.php';

// Try to check database status
$db_status = "Connected";
$db_error = "";
try {
    $db = (new Database())->getConnection();
} catch (Exception $e) {
    $db_status = "Disconnected";
    $db_error = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SaveurEats API - Status Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --clr-primary: #8B0000;
            --clr-gold: #D4AF37;
            --clr-bg: #FAF7F2;
            --clr-white: #ffffff;
            --clr-text: #222222;
            --clr-text-muted: #6B7280;
            --clr-border: #E5E7EB;
            --clr-success: #22C55E;
            --clr-error: #DC2626;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Poppins', sans-serif;
            background-color: var(--clr-bg);
            color: var(--clr-text);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            background-color: var(--clr-white);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(139, 0, 0, 0.05);
            border: 1px solid var(--clr-border);
            max-width: 600px;
            width: 100%;
            padding: 40px;
            text-align: center;
        }

        .logo {
            font-size: 28px;
            font-weight: 800;
            color: var(--clr-primary);
            margin-bottom: 10px;
        }

        .logo span {
            color: var(--clr-gold);
        }

        h1 {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 25px;
            color: var(--clr-text);
        }

        .status-box {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 8px 16px;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 30px;
        }

        .status-online {
            background-color: rgba(34, 197, 94, 0.1);
            color: var(--clr-success);
        }

        .status-offline {
            background-color: rgba(220, 38, 38, 0.1);
            color: var(--clr-error);
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: currentColor;
            animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
            0% { opacity: 0.4; }
            50% { opacity: 1; }
            100% { opacity: 0.4; }
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            text-align: left;
            margin-bottom: 30px;
        }

        .info-card {
            background-color: var(--clr-bg);
            padding: 15px 20px;
            border-radius: 10px;
            border: 1px solid var(--clr-border);
        }

        .info-label {
            font-size: 12px;
            color: var(--clr-text-muted);
            font-weight: 500;
            margin-bottom: 5px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .info-val {
            font-size: 14px;
            font-weight: 600;
        }

        .links-container {
            border-top: 1px solid var(--clr-border);
            padding-top: 25px;
        }

        .links-title {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--clr-text-muted);
            letter-spacing: 0.05em;
            margin-bottom: 15px;
        }

        .links-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .api-link {
            display: block;
            padding: 10px;
            background-color: var(--clr-white);
            border: 1px solid var(--clr-border);
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            color: var(--clr-primary);
            text-decoration: none;
            transition: all 0.2s ease;
        }

        .api-link:hover {
            background-color: var(--clr-primary);
            color: var(--clr-white);
            border-color: var(--clr-primary);
            transform: translateY(-2px);
        }

        .footer {
            margin-top: 30px;
            font-size: 11px;
            color: var(--clr-text-muted);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">Saveur<span>Eats</span> API</div>
        <h1>REST API Backend Status</h1>

        <div class="status-box <?php echo $db_status === 'Connected' ? 'status-online' : 'status-offline'; ?>">
            <div class="status-dot"></div>
            <span>API Online & Database <?php echo $db_status; ?></span>
        </div>

        <div class="info-grid">
            <div class="info-card">
                <div class="info-label">Environment</div>
                <div class="info-val">Development (XAMPP)</div>
            </div>
            <div class="info-card">
                <div class="info-label">PHP Version</div>
                <div class="info-val"><?php echo PHP_VERSION; ?></div>
            </div>
            <div class="info-card" style="grid-column: span 2;">
                <div class="info-label">Database Status</div>
                <div class="info-val">
                    <?php if ($db_status === 'Connected'): ?>
                        Connected to <code>food_ordering_db</code> successfully.
                    <?php else: ?>
                        <span style="color: var(--clr-error);">Error: <?php echo htmlspecialchars($db_error); ?></span>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <div class="links-container">
            <div class="links-title">Quick API Endpoints</div>
            <div class="links-grid">
                <a href="/api/foods.php" class="api-link" target="_blank">Browse Foods (/api/foods.php)</a>
                <a href="/api/categories.php" class="api-link" target="_blank">Categories (/api/categories.php)</a>
            </div>
        </div>

        <div class="footer">
            SaveurEats Online Food Ordering System Backend
        </div>
    </div>
</body>
</html>

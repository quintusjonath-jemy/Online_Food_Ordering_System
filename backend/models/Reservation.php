<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Reservation Model
 * Handles restaurant table booking rules and CRUD
 */
class Reservation {
    private PDO $db;
    private string $table = 'reservations';
    private string $tablesConfigTable = 'tables';

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
     * Get list of physical tables configuration
     */
    public function getTables(): array {
        $stmt = $this->db->query("SELECT * FROM {$this->tablesConfigTable} WHERE status = 'active' ORDER BY capacity ASC");
        return $stmt->fetchAll();
    }

    /**
     * Find a table configuration by ID
     */
    public function getTableById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM {$this->tablesConfigTable} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Check table availability for a date, time slot, and guest size
     * Returns matching table_id if available, or null
     */
    public function checkAvailability(string $date, string $time, int $partySize): ?int {
        // Find active tables that can fit the party size, ordered by capacity ascending (to optimize table usage)
        $stmt = $this->db->prepare(
            "SELECT id, capacity FROM {$this->tablesConfigTable} 
             WHERE status = 'active' AND capacity >= ? 
             ORDER BY capacity ASC"
        );
        $stmt->execute([$partySize]);
        $suitableTables = $stmt->fetchAll();

        if (empty($suitableTables)) {
            return null;
        }

        // Check which tables are already booked at that date & time
        // We define a time slot as 2 hours long.
        $stmt = $this->db->prepare(
            "SELECT table_id FROM {$this->table} 
             WHERE reservation_date = ? 
             AND status NOT IN ('cancelled', 'completed')
             AND ABS(TIME_TO_SEC(TIMEDIFF(reservation_time, ?))) < 7200"
        );
        $stmt->execute([$date, $time]);
        $bookedTableIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Find the smallest table that fits the guests and is not booked
        foreach ($suitableTables as $t) {
            if (!in_array($t['id'], $bookedTableIds)) {
                return (int)$t['id'];
            }
        }

        return null;
    }

    /**
     * Create a table reservation
     */
    public function create(array $data): array {
        $tableId = $this->checkAvailability($data['date'], $data['time'], (int)$data['party_size']);

        if (!$tableId) {
            return [
                'success' => false,
                'message' => 'No tables with matching capacity are available for the selected date and time.'
            ];
        }

        $stmt = $this->db->prepare(
            "INSERT INTO {$this->table} 
             (user_id, guest_name, guest_email, guest_phone, reservation_date, reservation_time, party_size, table_id, special_requests, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')"
        );

        $stmt->execute([
            $data['user_id'] ?? null,
            $data['guest_name'],
            $data['guest_email'],
            $data['guest_phone'],
            $data['date'],
            $data['time'],
            (int)$data['party_size'],
            $tableId,
            $data['special_requests'] ?? '',
        ]);

        $bookingId = (int)$this->db->lastInsertId();
        return [
            'success' => true,
            'message' => 'Reservation created successfully!',
            'booking' => $this->findById($bookingId)
        ];
    }

    /**
     * Get reservation detail by ID
     */
    public function findById(int $id): ?array {
        $stmt = $this->db->prepare(
            "SELECT r.*, t.table_number, t.capacity AS table_capacity 
             FROM {$this->table} r 
             LEFT JOIN {$this->tablesConfigTable} t ON r.table_id = t.id 
             WHERE r.id = ?"
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Get reservations for a user
     */
    public function getByUser(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT r.*, t.table_number 
             FROM {$this->table} r 
             LEFT JOIN {$this->tablesConfigTable} t ON r.table_id = t.id 
             WHERE r.user_id = ? 
             ORDER BY r.reservation_date DESC, r.reservation_time DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    /**
     * Get all reservations for admin
     */
    public function getAll(array $params = []): array {
        $sql = "SELECT r.*, t.table_number, u.name AS user_name 
                FROM {$this->table} r 
                LEFT JOIN {$this->tablesConfigTable} t ON r.table_id = t.id 
                LEFT JOIN users u ON r.user_id = u.id";
        
        $where = [];
        $values = [];

        if (!empty($params['status'])) {
            $where[] = 'r.status = ?';
            $values[] = $params['status'];
        }
        if (!empty($params['date'])) {
            $where[] = 'r.reservation_date = ?';
            $values[] = $params['date'];
        }

        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        $sql .= ' ORDER BY r.reservation_date DESC, r.reservation_time DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);
        return $stmt->fetchAll();
    }

    /**
     * Update reservation status
     */
    public function updateStatus(int $id, string $status): array {
        $allowed = ['pending', 'confirmed', 'seated', 'completed', 'cancelled'];
        if (!in_array($status, $allowed, true)) {
            return ['success' => false, 'message' => 'Invalid reservation status value.'];
        }

        $stmt = $this->db->prepare("UPDATE {$this->table} SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);

        return $stmt->rowCount() > 0
            ? ['success' => true, 'message' => 'Reservation status updated successfully.']
            : ['success' => false, 'message' => 'Reservation not found or no changes made.'];
    }

    /**
     * Count reservations for today
     */
    public function countToday(): int {
        $stmt = $this->db->query("SELECT COUNT(*) FROM {$this->table} WHERE reservation_date = CURDATE() AND status != 'cancelled'");
        return (int)$stmt->fetchColumn();
    }
}

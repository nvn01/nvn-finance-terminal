package main

import (
    "context"
    "errors"
    "fmt"
    "log"
    "net/http"
    "os"
    "strconv"
    "time"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "github.com/jackc/pgx/v5"
    "github.com/jackc/pgx/v5/pgxpool"
)

func getEnv(key, def string) string {
    v := os.Getenv(key)
    if v == "" {
        return def
    }
    return v
}

type apiError struct {
    Error   string `json:"error"`
    Details string `json:"details,omitempty"`
}

func writeError(c *gin.Context, code int, msg string, details string) {
    c.AbortWithStatusJSON(code, apiError{Error: msg, Details: details})
}

type Candle struct {
    Ts     time.Time `json:"ts"`
    Open   float64   `json:"open"`
    High   float64   `json:"high"`
    Low    float64   `json:"low"`
    Close  float64   `json:"close"`
    Volume float64   `json:"volume"`
}

type Signal struct {
    ID              int64      `json:"id"`
    Symbol          string     `json:"symbol"`
    Action          string     `json:"action"`
    TakeProfit      *float64   `json:"take_profit,omitempty"`
    StopLoss        *float64   `json:"stop_loss,omitempty"`
    Confidence      *float64   `json:"confidence,omitempty"`
    PnL             *float64   `json:"pnl,omitempty"`
    ChartScreenshot *string    `json:"chart_screenshot,omitempty"`
    Reason          *string    `json:"reason,omitempty"`
    CreatedAt       time.Time  `json:"created_at"`
}

// CandlePayload is the expected JSON for a single candle in an upsert batch
type CandlePayload struct {
    Ts     time.Time `json:"ts"`     // Must be in ISO8601 format: "2025-10-31T22:59:00Z"`
    Open   float64   `json:"open"`
    High   float64   `json:"high"`
    Low    float64   `json:"low"`
    Close  float64   `json:"close"`
    Volume float64   `json:"volume"`
}

func lookupInstrumentID(ctx context.Context, pool *pgxpool.Pool, symbol string) (int64, error) {
    var id int64
    err := pool.QueryRow(ctx, `SELECT id FROM market.instruments WHERE symbol=$1`, symbol).Scan(&id)
    if err != nil {
        if errors.Is(err, pgx.ErrNoRows) {
            return 0, fmt.Errorf("unknown symbol: %s", symbol)
        }
        return 0, err
    }
    return id, nil
}

func parseLimit(s string, def, max int) int {
    if s == "" {
        return def
    }
    n, err := strconv.Atoi(s)
    if err != nil || n <= 0 {
        return def
    }
    if n > max {
        return max
    }
    return n
}

func main() {
    dsn := os.Getenv("DATABASE_URL")
    if dsn == "" {
        log.Fatal("DATABASE_URL is required")
    }

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    pool, err := pgxpool.New(ctx, dsn)
    if err != nil {
        log.Fatalf("db connect error: %v", err)
    }
    defer pool.Close()

    if err := pool.Ping(ctx); err != nil {
        log.Fatalf("db ping error: %v", err)
    }

    r := gin.Default()

    // CORS for dev: allow multiple common frontend origins.
    // You can override via FRONTEND_ORIGINS env var (comma-separated).
    // Example: FRONTEND_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
    rawOrigins := getEnv("FRONTEND_ORIGINS", "")
    var allowOrigins []string
    if rawOrigins != "" {
        // simple CSV split
        // avoid strings import by manual parse
        tmp := ""
        for i := 0; i < len(rawOrigins); i++ {
            if rawOrigins[i] == ',' {
                if tmp != "" {
                    allowOrigins = append(allowOrigins, tmp)
                    tmp = ""
                }
            } else {
                tmp += string(rawOrigins[i])
            }
        }
        if tmp != "" {
            allowOrigins = append(allowOrigins, tmp)
        }
    }
    if len(allowOrigins) == 0 {
        allowOrigins = []string{
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            // common LAN dev case; adjust if needed
            "http://100.126.6.58:3000",
        }
    }

    r.Use(cors.New(cors.Config{
        AllowOrigins:     allowOrigins,
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
        ExposeHeaders:    []string{"Content-Type"},
        AllowCredentials: true,
        AllowWildcard:    true,
        AllowOriginFunc: func(origin string) bool {
            // Always allow localhost/127.0.0.1 for development
            if len(origin) >= 16 && (origin[:16] == "http://localhost" || origin[:16] == "http://127.0.0.1") {
                return true
            }
            // If FRONTEND_ORIGINS is set, check against the list
            if rawOrigins != "" {
                for _, allowed := range allowOrigins {
                    if origin == allowed {
                        return true
                    }
                }
                return false
            }
            // Otherwise allow all for development
            return true
        },
        MaxAge: 12 * time.Hour,
    }))

    r.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"status": "ok"})
    })

    // GET /candles/latest?symbol=SYMBOL&limit=200
    r.GET("/candles/latest", func(c *gin.Context) {
        symbol := c.Query("symbol")
        if symbol == "" {
            writeError(c, http.StatusBadRequest, "symbol is required", "")
            return
        }
        limit := parseLimit(c.Query("limit"), 200, 1000)

        // latest N, then return ascending for chart consumption
        rows, err := pool.Query(c, `
            SELECT t.ts, t.open, t.high, t.low, t.close, t.volume
            FROM market.timeframe_1m t
            JOIN market.instruments i ON i.id = t.instrument_id
            WHERE i.symbol = $1
            ORDER BY t.ts DESC
            LIMIT $2`, symbol, limit)
        if err != nil {
            writeError(c, http.StatusInternalServerError, "query error", err.Error())
            return
        }
        defer rows.Close()

        var tmp []Candle
        for rows.Next() {
            var x Candle
            if err := rows.Scan(&x.Ts, &x.Open, &x.High, &x.Low, &x.Close, &x.Volume); err != nil {
                writeError(c, http.StatusInternalServerError, "scan error", err.Error())
                return
            }
            tmp = append(tmp, x)
        }
        if rows.Err() != nil {
            writeError(c, http.StatusInternalServerError, "rows error", rows.Err().Error())
            return
        }
        // reverse to ascending
        n := len(tmp)
        out := make([]Candle, n)
        for i := 0; i < n; i++ {
            out[i] = tmp[n-1-i]
        }
        c.JSON(http.StatusOK, out)
    })

    // GET /candles/range?symbol=SYMBOL&from=ISO&to=ISO
    r.GET("/candles/range", func(c *gin.Context) {
        symbol := c.Query("symbol")
        fromStr := c.Query("from")
        toStr := c.Query("to")
        if symbol == "" || fromStr == "" || toStr == "" {
            writeError(c, http.StatusBadRequest, "symbol, from, to are required", "")
            return
        }
        from, err1 := time.Parse(time.RFC3339, fromStr)
        to, err2 := time.Parse(time.RFC3339, toStr)
        if err1 != nil || err2 != nil {
            writeError(c, http.StatusBadRequest, "invalid time format", "use RFC3339, e.g. 2024-01-02T15:04:05Z")
            return
        }
        if !to.After(from) {
            writeError(c, http.StatusBadRequest, "invalid range", "to must be after from")
            return
        }

        rows, err := pool.Query(c, `
            SELECT t.ts, t.open, t.high, t.low, t.close, t.volume
            FROM market.timeframe_1m t
            JOIN market.instruments i ON i.id = t.instrument_id
            WHERE i.symbol = $1 AND t.ts BETWEEN $2 AND $3
            ORDER BY t.ts ASC`, symbol, from, to)
        if err != nil {
            writeError(c, http.StatusInternalServerError, "query error", err.Error())
            return
        }
        defer rows.Close()

        var out []Candle
        for rows.Next() {
            var x Candle
            if err := rows.Scan(&x.Ts, &x.Open, &x.High, &x.Low, &x.Close, &x.Volume); err != nil {
                writeError(c, http.StatusInternalServerError, "scan error", err.Error())
                return
            }
            out = append(out, x)
        }
        if rows.Err() != nil {
            writeError(c, http.StatusInternalServerError, "rows error", rows.Err().Error())
            return
        }
        c.JSON(http.StatusOK, out)
    })

    // POST /candles/upsert
    // Accepts a batch of candles for a single symbol and upserts them.
    // Duplicates (based on instrument_id, ts) are automatically ignored.
    r.POST("/candles/upsert", func(c *gin.Context) {
        var body struct {
            Symbol  string          `json:"symbol"`
            Candles []CandlePayload `json:"candles"`
        }

        if err := c.BindJSON(&body); err != nil {
            writeError(c, http.StatusBadRequest, "invalid JSON", err.Error())
            return
        }
        if body.Symbol == "" {
            writeError(c, http.StatusBadRequest, "symbol is required", "")
            return
        }
        if len(body.Candles) == 0 {
            writeError(c, http.StatusBadRequest, "candles array is required", "")
            return
        }

        // Get the instrument ID for this symbol
        instID, err := lookupInstrumentID(c, pool, body.Symbol)
        if err != nil {
            writeError(c, http.StatusBadRequest, "invalid symbol", err.Error())
            return
        }

        // Use pgx.Batch for high-performance upsert
        batch := &pgx.Batch{}
        sql := `
            INSERT INTO market.timeframe_1m (instrument_id, ts, open, high, low, close, volume)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (instrument_id, ts) DO NOTHING
        `

        for _, candle := range body.Candles {
            batch.Queue(sql, instID, candle.Ts, candle.Open, candle.High, candle.Low, candle.Close, candle.Volume)
        }

        // Send the batch to the database in a single transaction
        br := pool.SendBatch(c, batch)
        defer br.Close()

        // Check for errors from each query in the batch
        insertedCount := 0
        for i := 0; i < len(body.Candles); i++ {
            ct, err := br.Exec()
            if err != nil {
                // If one fails, stop and report the error
                writeError(c, http.StatusInternalServerError, "batch insert error", err.Error())
                return
            }
            insertedCount += int(ct.RowsAffected())
        }

        // On success
        c.JSON(http.StatusCreated, gin.H{
            "status":   "ok",
            "symbol":   body.Symbol,
            "received": len(body.Candles),
            "inserted": insertedCount,
        })
    })

    // GET /signals?symbol=SYMBOL&limit=50
    r.GET("/signals", func(c *gin.Context) {
        symbol := c.Query("symbol")
        if symbol == "" {
            writeError(c, http.StatusBadRequest, "symbol is required", "")
            return
        }
        limit := parseLimit(c.Query("limit"), 50, 1000)

        rows, err := pool.Query(c, `
            SELECT s.id, i.symbol, s.action, s.take_profit, s.stop_loss, s.confidence,
                   s.pnl, s.chart_screenshot, s.reason, s.created_at
            FROM market.signals s
            JOIN market.instruments i ON i.id = s.instrument_id
            WHERE i.symbol = $1
            ORDER BY s.created_at DESC
            LIMIT $2`, symbol, limit)
        if err != nil {
            writeError(c, http.StatusInternalServerError, "query error", err.Error())
            return
        }
        defer rows.Close()

        var out []Signal
        for rows.Next() {
            var x Signal
            if err := rows.Scan(&x.ID, &x.Symbol, &x.Action, &x.TakeProfit, &x.StopLoss, &x.Confidence, &x.PnL, &x.ChartScreenshot, &x.Reason, &x.CreatedAt); err != nil {
                writeError(c, http.StatusInternalServerError, "scan error", err.Error())
                return
            }
            out = append(out, x)
        }
        if rows.Err() != nil {
            writeError(c, http.StatusInternalServerError, "rows error", rows.Err().Error())
            return
        }
        c.JSON(http.StatusOK, out)
    })

    // POST /signals
    r.POST("/signals", func(c *gin.Context) {
        var body struct {
            Symbol          string   `json:"symbol"`
            Action          string   `json:"action"`
            TakeProfit      *float64 `json:"take_profit"`
            StopLoss        *float64 `json:"stop_loss"`
            Confidence      *float64 `json:"confidence"`
            PnL             *float64 `json:"pnl"`
            ChartScreenshot *string  `json:"chart_screenshot"`
            Reason          *string  `json:"reason"`
        }
        if err := c.BindJSON(&body); err != nil {
            writeError(c, http.StatusBadRequest, "invalid JSON", err.Error())
            return
        }
        if body.Symbol == "" {
            writeError(c, http.StatusBadRequest, "symbol is required", "")
            return
        }
        switch body.Action {
        case "buy", "sell", "wait":
        default:
            writeError(c, http.StatusBadRequest, "invalid action", "must be one of buy, sell, wait")
            return
        }

        instID, err := lookupInstrumentID(c, pool, body.Symbol)
        if err != nil {
            writeError(c, http.StatusBadRequest, "invalid symbol", err.Error())
            return
        }

        var created Signal
        created.Symbol = body.Symbol
        created.Action = body.Action
        created.TakeProfit = body.TakeProfit
        created.StopLoss = body.StopLoss
        created.Confidence = body.Confidence
        created.PnL = body.PnL
        created.ChartScreenshot = body.ChartScreenshot
        created.Reason = body.Reason

        err = pool.QueryRow(c, `
            INSERT INTO market.signals (instrument_id, action, take_profit, stop_loss, confidence, pnl, chart_screenshot, reason)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING id, created_at`,
            instID, body.Action, body.TakeProfit, body.StopLoss, body.Confidence, body.PnL, body.ChartScreenshot, body.Reason,
        ).Scan(&created.ID, &created.CreatedAt)
        if err != nil {
            writeError(c, http.StatusInternalServerError, "insert error", err.Error())
            return
        }
        c.JSON(http.StatusCreated, created)
    })

    port := getEnv("PORT", "8080")
    if err := r.Run(":" + port); err != nil {
        log.Fatalf("server error: %v", err)
    }
}

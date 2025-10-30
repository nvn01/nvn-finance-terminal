import os
import re
import threading
import queue
from datetime import datetime
from tkinter import Tk, StringVar, BooleanVar, END, N, S, E, W
from tkinter import filedialog, messagebox
from tkinter import ttk
from tkinter.scrolledtext import ScrolledText

import psycopg


APP_TITLE = "OHLCV CSV Loader (COPY + upsert)"
DEFAULTS = {
    "host": "localhost",          # or "192.168.0.193"
    "port": "5432",
    "dbname": "market_data",
    "user": "postgres",
    "password": "Potato01",
}
SYMBOLS = {
    "XAUUSD","EURUSD","GBPUSD","USDJPY","AUDUSD","AUDCAD","AUDJPY","CADJPY",
    "CHFJPY","EURAUD","EURGBP","EURJPY","GBPAUD","GBPJPY","NZDUSD","USDCAD",
    "USDCHF","BTCUSD","ETHUSD","NAS100"
}

# Known MT4/MT5 timeframe suffixes appended to filenames/symbols
# Handle numeric suffixes like 1,5,15,30,60,240,1440
NUMERIC_TIMEFRAME_SUFFIXES = {"1440", "240", "60", "30", "15", "5", "1"}
# Handle separated alpha suffixes like _D1, -D1, " D1" (avoid stripping 'D1' from 'USD1')
SEPARATED_ALPHA_TIMEFRAME_SUFFIXES = {"D1", "W1", "MN"}


class LoaderGUI:
    def __init__(self, root: Tk):
        self.root = root
        root.title(APP_TITLE)
        root.minsize(860, 520)

        # state
        self.var_host = StringVar(value=DEFAULTS["host"])
        self.var_port = StringVar(value=DEFAULTS["port"])
        self.var_db   = StringVar(value=DEFAULTS["dbname"])
        self.var_user = StringVar(value=DEFAULTS["user"])
        self.var_pass = StringVar(value=DEFAULTS["password"])

        self.var_csv_path = StringVar(value="")
        self.var_symbol = StringVar(value="")
        self.var_infer_symbol = BooleanVar(value=True)
        self.var_csv_has_header = BooleanVar(value=False)

        self.log_q = queue.Queue()
        self.worker = None

        self._build_ui()
        self._tick_log()

    def _build_ui(self):
        pad = {"padx": 6, "pady": 6}

        frm = ttk.Frame(self.root)
        frm.grid(row=0, column=0, sticky=(N, S, E, W))
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        for c in range(4):
            frm.columnconfigure(c, weight=1)

        # DB config
        ttk.Label(frm, text="Host").grid(row=0, column=0, sticky=W, **pad)
        ttk.Entry(frm, textvariable=self.var_host).grid(row=0, column=1, sticky=E+W, **pad)

        ttk.Label(frm, text="Port").grid(row=0, column=2, sticky=W, **pad)
        ttk.Entry(frm, textvariable=self.var_port, width=8).grid(row=0, column=3, sticky=E+W, **pad)

        ttk.Label(frm, text="Database").grid(row=1, column=0, sticky=W, **pad)
        ttk.Entry(frm, textvariable=self.var_db).grid(row=1, column=1, sticky=E+W, **pad)

        ttk.Label(frm, text="User").grid(row=1, column=2, sticky=W, **pad)
        ttk.Entry(frm, textvariable=self.var_user).grid(row=1, column=3, sticky=E+W, **pad)

        ttk.Label(frm, text="Password").grid(row=2, column=0, sticky=W, **pad)
        ttk.Entry(frm, textvariable=self.var_pass, show="*").grid(row=2, column=1, sticky=E+W, **pad)

        btn_test = ttk.Button(frm, text="Test Connection", command=self._on_test_connection)
        btn_test.grid(row=2, column=2, columnspan=2, sticky=E+W, **pad)

        # CSV + symbol
        ttk.Label(frm, text="CSV File").grid(row=3, column=0, sticky=W, **pad)
        ttk.Entry(frm, textvariable=self.var_csv_path).grid(row=3, column=1, columnspan=2, sticky=E+W, **pad)
        ttk.Button(frm, text="Browse…", command=self._on_browse).grid(row=3, column=3, sticky=E+W, **pad)

        ttk.Checkbutton(frm, text="Infer symbol from filename", variable=self.var_infer_symbol,
                        command=self._maybe_infer_symbol).grid(row=4, column=0, columnspan=2, sticky=W, **pad)

        ttk.Label(frm, text="Symbol").grid(row=4, column=2, sticky=E, **pad)
        self.ent_symbol = ttk.Entry(frm, textvariable=self.var_symbol)
        self.ent_symbol.grid(row=4, column=3, sticky=E+W, **pad)

        ttk.Checkbutton(frm, text="CSV has header (default: off)", variable=self.var_csv_has_header)\
            .grid(row=5, column=0, columnspan=2, sticky=W, **pad)

        # Actions
        self.btn_load = ttk.Button(frm, text="Load CSV → database", command=self._on_load)
        self.btn_load.grid(row=5, column=2, columnspan=2, sticky=E+W, **pad)

        # Log
        ttk.Label(frm, text="Log").grid(row=6, column=0, sticky=W, **pad)
        self.txt_log = ScrolledText(frm, height=20)
        self.txt_log.grid(row=7, column=0, columnspan=4, sticky=E+W+N+S, **pad)
        frm.rowconfigure(7, weight=1)

    def _append_log(self, msg: str):
        ts = datetime.now().strftime("%H:%M:%S")
        self.log_q.put(f"[{ts}] {msg}\n")

    def _tick_log(self):
        try:
            while True:
                line = self.log_q.get_nowait()
                self.txt_log.insert(END, line)
                self.txt_log.see(END)
        except queue.Empty:
            pass
        self.root.after(80, self._tick_log)

    def _on_browse(self):
        start_dir = os.getcwd()
        path = filedialog.askopenfilename(
            initialdir=start_dir,
            title="Select CSV file",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")]
        )
        if not path:
            return
        self.var_csv_path.set(path)
        self._maybe_infer_symbol()

    def _maybe_infer_symbol(self):
        if not self.var_infer_symbol.get():
            return
        fn = os.path.basename(self.var_csv_path.get() or "")
        name = os.path.splitext(fn)[0]
        if not name:
            return
        sym = self._normalize_symbol(name)
        self.var_symbol.set(sym)

    def _normalize_symbol(self, raw: str) -> str:
        # Uppercase, then strip timeframe suffixes
        # 1) If separated by underscore/space/hyphen: remove the separator and alpha suffix (e.g. EURUSD_D1 -> EURUSD)
        # 2) Else, only strip numeric suffixes (e.g. XAUUSD1 -> XAUUSD). Do NOT strip 'D1' directly to avoid 'USD1' -> 'US'.
        s = (raw or "").strip().upper()

        # Strip separated alpha suffix: _D1, -D1, ' D1', etc.
        m = re.search(r"([_\-\s])(D1|W1|MN)$", s)
        if m:
            s = s[: m.start(1)]
            return s

        # Strip numeric timeframe suffix if present
        for sfx in sorted(NUMERIC_TIMEFRAME_SUFFIXES, key=len, reverse=True):
            if s.endswith(sfx):
                s = s[: -len(sfx)]
                break
        return s

    def _on_test_connection(self):
        try:
            self._append_log("Testing connection…")
            with self._connect() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT version()")
                    v = cur.fetchone()[0]
            self._append_log(f"OK: {v}")
            messagebox.showinfo("Connection", "Connected successfully.")
        except Exception as e:
            self._append_log(f"Connection failed: {e}")
            messagebox.showerror("Connection failed", str(e))

    def _connect(self):
        return psycopg.connect(
            host=self.var_host.get().strip(),
            port=int(self.var_port.get().strip()),
            dbname=self.var_db.get().strip(),
            user=self.var_user.get().strip(),
            password=self.var_pass.get(),
        )

    def _on_load(self):
        if self.worker and self.worker.is_alive():
            messagebox.showwarning("Busy", "A load is already running.")
            return
        csv_path = self.var_csv_path.get().strip()
        if not csv_path:
            messagebox.showerror("Missing", "Select a CSV file.")
            return
        sym_input = (self.var_symbol.get() or "").strip()
        sym = self._normalize_symbol(sym_input)
        if self.var_infer_symbol.get():
            self._maybe_infer_symbol()
            sym = (self.var_symbol.get() or "").strip().upper()
        if not sym:
            messagebox.showerror("Missing", "Provide a symbol (e.g. EURUSD).")
            return

        self.btn_load.configure(state="disabled")
        self.worker = threading.Thread(
            target=self._load_worker,
            args=(csv_path, sym, self.var_csv_has_header.get()),
            daemon=True,
        )
        self.worker.start()

    def _load_worker(self, csv_path: str, symbol: str, has_header: bool):
        try:
            self._append_log(f"Starting load: file={csv_path}, symbol={symbol}, header={has_header}")

            # Optional: warn on unknown symbol not in known list (still allowed)
            if symbol not in SYMBOLS:
                self._append_log(f"Note: {symbol} not in predefined symbol list; will load into matching partition or default.")

            with self._connect() as conn:
                conn.execute("""
                    CREATE UNLOGGED TABLE IF NOT EXISTS staging_ohlcv (
                      date_txt text NOT NULL,
                      time_txt text NOT NULL,
                      open  numeric(20,10) NOT NULL,
                      high  numeric(20,10) NOT NULL,
                      low   numeric(20,10) NOT NULL,
                      close numeric(20,10) NOT NULL,
                      volume bigint NOT NULL
                    );
                """)
                conn.execute("TRUNCATE staging_ohlcv;")
                self._append_log("Staging table prepared.")

                # COPY into staging (server parses numeric/bigint) using psycopg3 streaming copy
                with conn.cursor() as cur, open(csv_path, "rb") as f:
                    header_opt = "true" if has_header else "false"
                    copy_sql = (
                        "COPY staging_ohlcv (date_txt,time_txt,open,high,low,close,volume) "
                        f"FROM STDIN WITH (FORMAT csv, DELIMITER ',', HEADER {header_opt})"
                    )
                    self._append_log("COPY → staging_ohlcv …")
                    with cur.copy(copy_sql) as cp:
                        while True:
                            chunk = f.read(1024 * 1024)
                            if not chunk:
                                break
                            cp.write(chunk)
                    self._append_log("COPY done.")

                # Insert into final with dedupe, in one transaction
                with conn.cursor() as cur:
                    cur.execute("BEGIN;")
                    cur.execute("SET LOCAL synchronous_commit = off;")
                    self._append_log("Inserting into ohlcv (dedupe on (symbol, ts)) …")
                    cur.execute(
                        """
                        INSERT INTO ohlcv (symbol, ts, open, high, low, close, volume)
                        SELECT %s,
                               to_timestamp(date_txt || ' ' || time_txt, 'YYYY.MM.DD HH24:MI')::timestamp,
                               open, high, low, close, volume
                        FROM staging_ohlcv
                        ON CONFLICT (symbol, ts) DO NOTHING;
                        """,
                        (symbol,),
                    )
                    cur.execute("COMMIT;")
                self._append_log("Load completed.")
                messagebox.showinfo("Done", f"Loaded {os.path.basename(csv_path)} for {symbol}")

        except Exception as e:
            self._append_log(f"ERROR: {e}")
            messagebox.showerror("Error", str(e))
        finally:
            self.btn_load.configure(state="normal")


def main():
    root = Tk()
    style = ttk.Style()
    if "clam" in style.theme_names():
        style.theme_use("clam")
    LoaderGUI(root)
    root.mainloop()


if __name__ == "__main__":
    main()
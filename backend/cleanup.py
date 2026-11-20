#!/usr/bin/env python3
"""Minimal privacy retention: delete expired leads, purge limiter history."""
import os,sqlite3,time
from pathlib import Path
db=Path(os.getenv("TIFLOW_DB","/var/lib/tiflow/tiflow.sqlite3"))
if db.exists():
    with sqlite3.connect(db) as conn:
        cur=conn.execute("DELETE FROM requests WHERE created_at < datetime('now','-90 days')")
        conn.execute("DELETE FROM rate_limits WHERE created_at<?",(int(time.time())-86400,))
        print("TiFlow expired leads deleted:",cur.rowcount)

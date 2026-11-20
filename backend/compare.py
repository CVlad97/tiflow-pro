"""Quote comparison: approve only equivalent products and complete delivered costs."""
import math
import sqlite3

def init_quotes(conn):
    conn.execute("""CREATE TABLE IF NOT EXISTS quotes(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER NOT NULL,
        supplier TEXT NOT NULL,
        product_reference TEXT NOT NULL,
        comparison_key TEXT NOT NULL,
        qty INTEGER NOT NULL CHECK(qty>0),
        unit_price_eur REAL NOT NULL CHECK(unit_price_eur>=0),
        freight_eur REAL NOT NULL CHECK(freight_eur>=0),
        duties_eur REAL NOT NULL CHECK(duties_eur>=0),
        taxes_eur REAL NOT NULL CHECK(taxes_eur>=0),
        fees_eur REAL NOT NULL CHECK(fees_eur>=0),
        evidence TEXT NOT NULL,
        lead_days INTEGER,
        verified INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY(request_id) REFERENCES requests(id)
    )""")
    conn.execute("CREATE INDEX IF NOT EXISTS quotes_request_idx ON quotes(request_id,comparison_key)")

def validate_quote(data):
    if not isinstance(data,dict):
        raise ValueError("Objet requis")
    out={}
    out["request_id"]=int(data.get("request_id",0))
    if out["request_id"] <=0: raise ValueError("Demande requise")
    for name,max_len in (("supplier",120),("product_reference",160),("comparison_key",160),("evidence",300)):
        value=data.get(name,"")
        if not isinstance(value,str) or not value.strip() or len(value)>max_len:
            raise ValueError("Champ invalide: "+name)
        out[name]=" ".join(value.split())
    out["qty"]=int(data.get("qty",0))
    if out["qty"]<=0 or out["qty"]>100000: raise ValueError("Quantité invalide")
    for name in ("unit_price_eur","freight_eur","duties_eur","taxes_eur","fees_eur"):
        value=data.get(name)
        if value is None or isinstance(value,bool): raise ValueError("Coût manquant: "+name)
        value=float(value)
        if not math.isfinite(value) or value<0 or value>1e9: raise ValueError("Coût invalide")
        out[name]=value
    out["lead_days"]=int(data.get("lead_days",0))
    if out["lead_days"]<0 or out["lead_days"]>3650: raise ValueError("Délai invalide")
    return out

def add_quote(conn, data):
    d=validate_quote(data)
    values=[d[k] for k in ("request_id","supplier","product_reference","comparison_key",
                           "qty","unit_price_eur","freight_eur","duties_eur","taxes_eur","fees_eur","evidence","lead_days")]
    cur=conn.execute("""INSERT INTO quotes(request_id,supplier,product_reference,comparison_key,qty,
                 unit_price_eur,freight_eur,duties_eur,taxes_eur,fees_eur,evidence,lead_days)
                 VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",values)
    return cur.lastrowid

def quotes_for(conn, request_id):
    rows=conn.execute("""SELECT * FROM quotes WHERE request_id=? ORDER BY created_at DESC,id DESC LIMIT 100""",
                     (request_id,)).fetchall()
    result=[]
    for row in rows:
        d=dict(row)
        total=d["qty"]*d["unit_price_eur"]+d["freight_eur"]+d["duties_eur"]+d["taxes_eur"]+d["fees_eur"]
        d["landed_total_eur"]=round(total,2)
        d["landed_unit_eur"]=round(total/d["qty"],2)
        result.append(d)
    # Only verified, same comparator key/qty can be ranked. Cross-group comparisons are not valid.
    groups={}
    for d in result:
        if d["verified"]:
            groups.setdefault((d["comparison_key"],d["qty"]),[]).append(d)
    for group in groups.values():
        group.sort(key=lambda x:x["landed_total_eur"])
        for rank,d in enumerate(group,1): d["rank_same_spec"]=rank
    return result

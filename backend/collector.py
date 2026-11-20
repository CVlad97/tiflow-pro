#!/usr/bin/env python3
"""Import configured *authorized* RSS procurement feeds, pending human moderation."""
import hashlib
import json
import os
import sqlite3
import sys
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

DB = os.getenv("TIFLOW_DB", "/var/lib/tiflow/tiflow.sqlite3")
SOURCES = os.getenv("TIFLOW_SOURCES", "/etc/tiflow/sources.json")
CATEGORIES = {
 "Transport & camions": ["camion","transport","véhicule industriel","poids lourd","livraison"],
 "Industrie & machines": ["machine","usinage","équipement industriel","production","convoyeur"],
 "Immobilier & locaux": ["local","bâtiment","entrepôt","immobilier","construction"],
 "Agriculture": ["agricole","tracteur","irrigation","agriculture","culture"],
 "Commerce & services": ["commerce","restauration","froid","cuisine","mobilier"],
 "Énergie & équipements": ["solaire","énergie","photovoltaïque","batterie","électricité"]
}
def category_for(text):
    text = text.casefold()
    scores = {k:sum(1 for term in terms if term in text) for k,terms in CATEGORIES.items()}
    best=max(scores,key=scores.get)
    return best if scores[best] else "Commerce & services"

def parse_rss(xml, source):
    root=ET.fromstring(xml)
    items=[]
    for item in root.findall(".//item")[:60]:
        title=(item.findtext("title") or "").strip()[:180]
        href=(item.findtext("link") or "").strip()
        pub=(item.findtext("pubDate") or "").strip()[:90]
        desc=(item.findtext("description") or "").strip()[:1500]
        if not title or not href or urllib.parse.urlsplit(href).scheme not in ("https",):
            continue
        identity=hashlib.sha256((source["name"]+"|"+href).encode()).hexdigest()[:32]
        items.append((identity,title,category_for(title+" "+desc),source["name"],href,pub,desc))
    return items

def import_feeds(config):
    imported=0
    with sqlite3.connect(DB) as db:
        for source in config:
            if not isinstance(source,dict) or not source.get("enabled",False):
                continue
            endpoint=source.get("url","")
            parsed=urllib.parse.urlsplit(endpoint)
            if parsed.scheme!="https" or not parsed.hostname or parsed.username or parsed.password:
                print("Skipping source with invalid HTTPS URL",file=sys.stderr)
                continue
            # Admin-curated source list, no automatic discovery or crawling.
            if len(endpoint)>500 or len(source.get("name",""))>90 or not source.get("name"):
                continue
            try:
                req=urllib.request.Request(endpoint,headers={"User-Agent":"TiFlowPublicProcurementMonitor/0.1 (contact: contactcvs@ikabay.store)", "Accept":"application/rss+xml,application/xml,text/xml"})
                with urllib.request.urlopen(req,timeout=12) as response:
                    if urllib.parse.urlsplit(response.geturl()).hostname != parsed.hostname:
                        raise ValueError("RSS redirection to another host blocked")
                    xml=response.read(1048577)
                    if len(xml)>1048576:
                        raise ValueError("RSS feed exceeds size limit")
                records=parse_rss(xml,source)
                for rec in records:
                    cur=db.execute("""INSERT OR IGNORE INTO opportunities
                     (id,title,category,source_name,source_url,published_at,description,status)
                     VALUES(?,?,?,?,?,?,?,'pending_review')""",rec)
                    imported += cur.rowcount
                db.commit()
                print(source["name"],"new pending review:",len(records))
            except Exception as e:
                print("Feed failed:",source.get("name"),str(e)[:160],file=sys.stderr)
    return imported

if __name__=="__main__":
    if not Path(DB).exists():
        sys.exit("Database absent: start API once to initialize.")
    if not Path(SOURCES).exists():
        sys.exit("No approved feeds configured; nothing imported.")
    cfg=json.loads(Path(SOURCES).read_text("utf-8"))
    if not isinstance(cfg,list):
        sys.exit("Expected list of RSS sources.")
    print("New opportunities pending review:",import_feeds(cfg))

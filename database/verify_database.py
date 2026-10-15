"""Check the supplied demo database without modifying it (standard-library Python)."""
from pathlib import Path
import base64
import hashlib
import hmac
import sqlite3
import uuid

path = Path(__file__).resolve().parent / "gameshelf-demo.db"
source = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
db = sqlite3.connect(":memory:")
source.backup(db)
source.close()
db.execute("PRAGMA foreign_keys = ON")
assert db.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
assert db.execute("PRAGMA foreign_key_check").fetchall() == []
tables = {r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'")
          if not r[0].startswith(("sqlite_", "__"))}
assert tables == {"Members", "Games", "Sessions", "Signups", "CollectionRecords", "Shelves",
                  "ShelfGames", "LendingBoxes", "LoanRequests", "Loans", "WishlistItems", "TradeOffers", "ClubPolicies"}

salts = []
for username, stored in db.execute("SELECT UserName, PasswordHash FROM Members"):
    iterations, salt, expected = stored.split(".")
    assert int(iterations) >= 600_000
    salts.append(salt)
    actual = hashlib.pbkdf2_hmac("sha256", b"Admin001", base64.b64decode(salt), int(iterations), 32)
    assert hmac.compare_digest(actual, base64.b64decode(expected)), username
assert len(set(salts)) == len(salts)

def rejected(sql, parameters=()):
    db.execute("SAVEPOINT test")
    try:
        db.execute(sql, parameters)
    except sqlite3.IntegrityError:
        pass
    else:
        raise AssertionError("Invalid write was accepted: " + sql)
    finally:
        db.execute("ROLLBACK TO test")
        db.execute("RELEASE test")

owner, game = db.execute("SELECT OwnerId, GameId FROM CollectionRecords LIMIT 1").fetchone()
rejected("INSERT INTO CollectionRecords (Id,OwnerId,GameId,Status,PlayCount,Rating,Note) VALUES (?,?,?,?,?,?,?)",
         (str(uuid.uuid4()), owner, game, 0, 0, None, ""))
rejected("UPDATE CollectionRecords SET Rating=8 WHERE Status=0")
rejected("UPDATE Games SET MinPlayers=99 WHERE Title='Catan'")
rejected("UPDATE Sessions SET Capacity=0")
rejected("UPDATE Sessions SET HostId=?", (str(uuid.uuid4()),))
rejected("UPDATE Members SET UserName='JEFFREY' WHERE UserName='anmol'")

# Verify the partial unique index: a box cannot have a second active loan.
box, borrower, started, due = db.execute("SELECT BoxId,BorrowerId,StartedOn,DueOn FROM Loans LIMIT 1").fetchone()
request_id = str(uuid.uuid4())
db.execute("INSERT INTO LoanRequests (Id,BoxId,RequesterId,Status,CreatedAt) VALUES (?,?,?,1,'2026-10-08T12:00:00Z')",
           (request_id, box, borrower))
rejected("INSERT INTO Loans (Id,RequestId,BoxId,BorrowerId,StartedOn,DueOn,IsExtended) VALUES (?,?,?,?,?,?,0)",
         (str(uuid.uuid4()), request_id, box, borrower, started, due))

record = db.execute("SELECT CollectionRecordId FROM ShelfGames LIMIT 1").fetchone()[0]
db.execute("DELETE FROM CollectionRecords WHERE Id=?", (record,))
assert db.execute("SELECT COUNT(*) FROM ShelfGames WHERE CollectionRecordId=?", (record,)).fetchone()[0] == 0
assert db.execute("PRAGMA foreign_key_check").fetchall() == []
print("OK: 13 tables, foreign keys, unique salted password hashes, constraints and shelf cascade.")

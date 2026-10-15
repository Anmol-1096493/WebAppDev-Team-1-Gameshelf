"""Export the ERD and SQL directly from the demo SQLite schema (Python standard library)."""
from pathlib import Path
import html
import sqlite3

ROOT = Path(__file__).resolve().parent
db = sqlite3.connect(ROOT / "gameshelf-demo.db")
# SQLite LIKE treats underscores as wildcards; filter infrastructure names explicitly.
tables = [row[0] for row in db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
          if not row[0].startswith(("sqlite_", "__"))]
schema = [row[0] for row in db.execute(
    "SELECT sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY type DESC, name"
)]
migrations = [f"INSERT INTO \"__EFMigrationsHistory\" VALUES ('{migration}', '{version}');"
              for migration, version in db.execute('SELECT MigrationId, ProductVersion FROM "__EFMigrationsHistory" ORDER BY MigrationId')]
(ROOT / "gameshelf-schema.sql").write_text(
    "-- Generated from gameshelf-demo.db: schema and migration metadata, without account/game data.\nPRAGMA foreign_keys = ON;\n\n"
    + ";\n\n".join(schema) + ";\n\n" + "\n".join(migrations) + "\n")

groups = {
    "Accounts & catalogue": ("#4338ca", ["Members", "Games"]),
    "Collections & shelves": ("#0e7490", ["CollectionRecords", "Shelves", "ShelfGames"]),
    "Lending": ("#237a57", ["LendingBoxes", "LoanRequests", "Loans"]),
    "Sessions": ("#9d3e60", ["Sessions", "Signups"]),
    "Wishlists & trades": ("#9a5800", ["WishlistItems", "TradeOffers"]),
    "Club limits": ("#566078", ["ClubPolicies"]),
}
mermaid = ["erDiagram"]
dot = ['digraph GameShelf {',
       'graph [rankdir=LR, bgcolor="#f5f7ff", pad="0.4", nodesep="0.45", ranksep="1.3", fontname="Arial", fontsize=18, label="GameShelf · database ERD", labelloc=t];',
       'node [shape=plain, fontname="Arial"];',
       'edge [fontname="Arial", fontsize=9, color="#8791aa", arrowsize=0.7];']
relations = []
for group_index, (group, (color, names)) in enumerate(groups.items()):
    dot.append(f'subgraph cluster_{group_index} {{ label="{group}"; color="#cbd2e8"; style="rounded";')
    for table in names:
        assert table in tables, table
        columns = list(db.execute(f'PRAGMA table_info("{table}")'))
        fks = list(db.execute(f'PRAGMA foreign_key_list("{table}")'))
        foreign_names = {fk[3] for fk in fks}
        mermaid.append(f"    {table} {{")
        dot.append(f'{table} [label=<<TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="6">')
        dot.append(f'<TR><TD COLSPAN="3" BGCOLOR="{color}"><FONT COLOR="white"><B>{table}</B></FONT></TD></TR>')
        for _, name, sqltype, required, _, primary in columns:
            keys = (["PK"] if primary else []) + (["FK"] if name in foreign_names else [])
            field_type = "uuid" if name.endswith("Id") and table != "ClubPolicies" else sqltype.lower()
            if name in ("CreatedAt", "StartAt"): field_type = "datetime"
            if name.endswith("On"): field_type = "date"
            if name.startswith("Is"): field_type = "bool"
            mermaid.append(f"        {field_type} {name}" + (" " + ", ".join(keys) if keys else "")
                           + (' "optional"' if not required and not primary else ""))
            label = html.escape(name) + (" ?" if not required and not primary else "")
            key_label = " / ".join(keys) or "&#160;"
            dot.append(f'<TR><TD BGCOLOR="white"><FONT COLOR="{color}">{key_label}</FONT></TD><TD ALIGN="LEFT" BGCOLOR="white">{label}</TD><TD ALIGN="LEFT" BGCOLOR="white"><FONT COLOR="#566078">{field_type}</FONT></TD></TR>')
        dot.append('</TABLE>>];')
        mermaid.append("    }")
        for fk in fks:
            parent, child_column = fk[2], fk[3]
            required = next(c[3] for c in columns if c[1] == child_column)
            unique = table == "Loans" and child_column == "RequestId"
            relations.append((parent, table, child_column, required, unique))
    dot.append("}")
for parent, child, column, required, unique in relations:
    mermaid.append(f'    {parent} {"||" if required else "|o"}--{"o|" if unique else "o{"} {child} : {column}')
    dot.append(f'{parent} -> {child} [label="{column}", taillabel="{"1" if required else "0..1"}", headlabel="{"0..1" if unique else "0..*"}"];')
dot.append('}')
mermaid_source = "\n".join(mermaid) + "\n"
(ROOT / "gameshelf-erd.mmd").write_text(mermaid_source)
(ROOT / "gameshelf-erd.md").write_text(
    "# GameShelf ERD\n\n```mermaid\n" + mermaid_source + "```\n\n"
    + "PK = primaire sleutel; FK = vreemde sleutel; optional = het veld mag leeg zijn.\n"
    + "De 13 tabellen en relaties zijn gegenereerd uit `gameshelf-demo.db`. ClubPolicies bevat de clubtermijnen.\n")
# Keep the rendered diagram in the database guide in sync with the SQLite schema.
guide_path = ROOT / "README.md"
if guide_path.exists():
    guide = guide_path.read_text()
    start, end = "<!-- ERD:START -->", "<!-- ERD:END -->"
    diagram = start + "\n```mermaid\n" + mermaid_source + "```\n" + end
    if start in guide and end in guide:
        before, remaining = guide.split(start, 1)
        _, after = remaining.split(end, 1)
        guide_path.write_text(before + diagram + after)
    elif "![GameShelf ERD](gameshelf-erd.svg)" in guide:
        guide_path.write_text(guide.replace("![GameShelf ERD](gameshelf-erd.svg)", diagram))
(ROOT / "gameshelf-erd.dot").write_text("\n".join(dot) + "\n")
print(f"Exported {len(tables)} business tables and {len(relations)} relationships.")

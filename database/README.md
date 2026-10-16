# GameShelf datamodel

Deze map bevat het ontwerp van het datamodel. De frontend gebruikt voor de
schermen vaste voorbeeldgegevens en slaat wijzigingen alleen tijdelijk op in React-state.
De bestanden in deze map zijn niet nodig om de website te starten.

- `gameshelf-erd.md`: ERD in Mermaid, inclusief uitleg van de notatie.
- `gameshelf-erd.mmd`: bewerkbare Mermaid-bron.
- `gameshelf-erd.png`: afbeelding voor het presenteren van het datamodel.
- `gameshelf-erd.svg` en `gameshelf-erd.dot`: alternatieve vectorweergave.
- `gameshelf-schema.sql`: SQL-ontwerp van de tabellen en relaties.
- `gameshelf-demo.db`: voorbeeld van het ontworpen SQLite-schema.
- `export_schema.py`: maakt de schema- en diagrambronnen vanuit het voorbeeldbestand.
- `verify_database.py`: controleert het voorbeeldschema.

De centrale tabellen zijn Members en Games. CollectionRecords koppelt een lid aan
zijn spellen; Shelves en ShelfGames groeperen collectie-items. LendingBoxes,
LoanRequests en Loans beschrijven het uitlenen. Sessions en Signups beschrijven
spelavonden en deelnemers. WishlistItems en TradeOffers beschrijven wensen en
ruilaanbiedingen. ClubPolicies bevat algemene clubinstellingen.

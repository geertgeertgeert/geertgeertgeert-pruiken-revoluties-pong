# Oertocht

Een tekstspel voor groep 8 in de geest van *The Oregon Trail*. Een kleine groep trekt door Doggerland (ca. 8000 v.Chr.) van het winterkamp naar de kust. De leerling schrijft opdrachten, en de groep doet letterlijk wat er staat, niet wat er bedoeld wordt. Het spel levert frictie, geen antwoorden.

Gebaseerd op de bijdrage van Geert Vermeegen in *Als wij denken* (Pica, 2026).

## Ontwerpkeuzes

- **Geen taalmodel.** Een chatbot vult aan en strijkt onduidelijkheid glad, en dat is precies de coulance die het spel moet weghalen. De parser is regelgebaseerd en deterministisch: dezelfde zin geeft altijd hetzelfde gedrag, zodat de klas opdrachten kan vergelijken. Alles draait in de browser en er wordt niets verstuurd. Dat is ook relevant voor de privacy van leerlingen onder de 13.
- **Gedrag als antwoord.** De groep praat niet terug, ze doet iets. Moderne woorden (fabriek, aansteker) kennen ze niet. Vage woorden (daar, het, je) werken niet. Wie niemand noemt, laat iedereen meedoen.
- **Spiegel.** Na elke beurt hooguit twee vragen over de taal van de leerling, nooit over de oplossing.

## Vijf plekken, vijf taalvaardigheden

1. De rookpluim: taal als gereedschap, en woorden uit een andere tijd.
2. Het spoor bij de poel: inferenties uit waarnemingen.
3. De grote rivier: volgorde en wie-doet-wat.
4. De nacht bij het bos: voorwaarden (als … dan …).
5. De kust: één uitgebreide opdracht als eindproduct.

## Bestanden

- `index.html`: de pagina
- `engine.js`: parser, wereldmodel en scènes (werkt ook in Node)
- `tafereel.js`: het landschap op canvas, in de stijl van The Oregon Trail (2021). Het laat zien wat de woorden van de speler deden, zonder hints
- `test.js`: `node oertocht/test.js`

`index.html` is geschreven als artifact-pagina zonder `<!doctype>`. Wie het los wil hosten, zet er `<!doctype html><meta charset="utf-8">` boven.

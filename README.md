# De kapstok van de CAD-groep

Een interactieve, staande kapstok met zes haakjes. Bezoekers hangen er zinnen en
woorden aan; aanvullen gaat via een QR-code die je bij de kapstok ophangt.

* **Iedereen** mag zonder account lezen, toevoegen en de tekst van een bestaande
  zin **bijschaven**.
* **Niemand** kan iets verwijderen. Dat is niet alleen in de website uitgezet,
  maar ook in de database onmogelijk gemaakt.
* **Alleen de beheerder** haalt zinnen weg die niet meer kloppen of relevant
  zijn, zet ze eventueel terug, en hernoemt de zes haakjes.

Er zijn geen bibliotheken, geen bouwstap en geen CDN nodig: het is platte HTML,
CSS en JavaScript. De QR-code wordt in de pagina zelf berekend.

---

## 1. Meteen uitproberen (demomodus)

Open `index.html` in een browser, of serveer de map:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Zonder database draait de kapstok in **demomodus**: alles werkt, maar wat je
toevoegt blijft in je eigen browser en is voor anderen niet zichtbaar. In de
beheerdialoog kun je jezelf met één klik beheerder maken om de beheerfuncties
te bekijken.

## 2. Openbaar zetten met een database

De kapstok gebruikt [Supabase](https://supabase.com) (gratis abonnement is ruim
voldoende) als database.

1. Maak een project aan op supabase.com.
2. Open **SQL Editor**, plak de volledige inhoud van
   [`supabase/schema.sql`](supabase/schema.sql) en voer die uit. Dat maakt de
   tabellen aan én zet alle rechten goed.
3. Ga naar **Project Settings → API** en noteer de *Project URL* en de
   *anon public* sleutel.
4. Vul die twee in `assets/js/config.js`:

   ```js
   window.KAPSTOK_CONFIG = {
     supabaseUrl: 'https://jouwproject.supabase.co',
     supabaseAnonKey: 'eyJhbGciOi...',
     ...
   };
   ```

De anon key is bedoeld om openbaar te zijn en mag gewoon in deze repository
staan. **Zet hier nooit de `service_role` key**: die geeft volledige toegang.

## 3. Jezelf beheerder maken

1. Ga in Supabase naar **Authentication → Users → Add user** en maak een
   gebruiker aan met jouw e-mailadres (*Auto Confirm User* aanzetten).
2. Kopieer de UUID van die gebruiker.
3. Voer in de SQL Editor uit:

   ```sql
   insert into public.beheerders (gebruiker_id)
   values ('plak-hier-de-uuid');
   ```
4. Zet in Supabase onder **Authentication → Sign In / Providers** het aanmelden
   van nieuwe gebruikers uit (*Allow new users to sign up*: uit). Dan kan
   niemand anders een account maken.
5. Voeg onder **Authentication → URL Configuration** het adres van de website
   toe aan de *Redirect URLs*, bijvoorbeeld
   `https://jouwnaam.github.io/geertgeertgeert-pruiken-revoluties-pong/`.

Klik daarna op de site op **Beheer**, vul je e-mailadres in en open de inloglink
die je per e-mail krijgt. Er is geen wachtwoord.

## 4. Publiceren

De site is volledig statisch en kan overal staan. Met GitHub Pages:

1. **Settings → Pages**.
2. *Source*: **Deploy from a branch**, branch `main`, map `/ (root)`.
3. Na een minuut staat de kapstok op
   `https://<jouw-gebruikersnaam>.github.io/<repository>/`.

Klik daarna in de kapstok op **QR-code** en gebruik **Afdrukken** voor een
posterversie om bij de kapstok op te hangen. Met *Alleen dit haakje* maak je een
code die rechtstreeks naar één haakje verwijst.

---

## De huisstijl aanpassen

Alle huisstijlkeuzes staan in één bestand: [`assets/huisstijl.css`](assets/huisstijl.css).
Vervang daar de vijf kleuren, de twee lettertypen en het logo, en de hele
kapstok verandert mee. Verder in de code staan geen losse kleurwaarden.

```css
--merk-primair: #1f3c5a;   /* staander, koppen, knoppen */
--merk-accent:  #c1622c;   /* haakjes, actieve staat     */
--merk-diep:    #14273a;   /* tekst en diepte            */
--merk-zacht:   #f3efe7;   /* achtergrond                */
--merk-papier:  #ffffff;   /* kaartjes en vlakken        */
```

De huidige waarden zijn een neutrale invulling: de officiële codes van de
CAD-groep waren bij het bouwen nog niet bekend.

## Hoe de grens tussen bewerken en verwijderen is afgedwongen

De belofte "wel bewerken, niet verwijderen" staat niet alleen in de knoppen van
de website — iemand die zelf een verzoek naar de database stuurt, loopt tegen
dezelfde muur aan:

| Wie | Lezen | Toevoegen | Tekst wijzigen | Verbergen | Verwijderen |
| --- | --- | --- | --- | --- | --- |
| Bezoeker (geen account) | ja, zichtbare zinnen | ja | ja | nee | nee |
| Beheerder | ook het archief | ja | ja | ja | ja |

* **Kolomrechten** geven bezoekers uitsluitend `update (tekst)`. Andere kolommen
  — waaronder `verborgen` en `haak_id` — kunnen ze niet aanraken.
* Er is **geen enkele delete-policy** voor bezoekers, dus verwijderen wordt
  geweigerd.
* Beheerdersacties lopen via drie databasefuncties die elk zelf controleren of
  de aanroeper in de tabel `beheerders` staat.
* Weghalen is standaard **archiveren**, niet wissen: de beheerder kan een zin
  altijd terugzetten. Definitief verwijderen kan apart, met een bevestiging.

## Bestandsoverzicht

```
index.html               de pagina
assets/huisstijl.css     alle huisstijlkeuzes (kleuren, letters, logo)
assets/kapstok.css       opmaak van de kapstok, kaartjes en dialogen
assets/favicon.svg       pictogram
assets/js/config.js      instellingen: database-URL en sleutel
assets/js/qr.js          QR-encoder (byte-modus, niveau M, versie 1-20)
assets/js/store.js       datalaag: Supabase of demomodus
assets/js/app.js         de kapstok tekenen en bedienen
supabase/schema.sql      tabellen, rechten en beheerdersfuncties
```

## Goed om te weten

* **Misbruik.** De kapstok is bewust drempelloos: geen account, geen
  moderatievooraf. Wie de link heeft, kan schrijven. Voor een besloten groep is
  dat prima; hangt de QR-code op een openbare plek, houd het dan in de gaten —
  je kunt als beheerder altijd alles weghalen. Supabase heeft standaard een
  snelheidsbegrenzing per IP-adres.
* **Bijwerken.** De pagina haalt elke tien seconden nieuwe zinnen op, en direct
  zodra je terugkeert naar het tabblad. Wat iemand anders ophangt, verschijnt
  dus vanzelf.
* **Gelijktijdig bewerken.** Bewerkt iemand dezelfde zin op hetzelfde moment,
  dan wint de laatste opslag. Bij zes haakjes met korte zinnen is dat in de
  praktijk geen bezwaar.

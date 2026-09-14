/* ============================================================================
   INSTELLINGEN
   ----------------------------------------------------------------------------
   Laat supabaseUrl en supabaseAnonKey leeg om de kapstok in demomodus te
   gebruiken: dan werkt alles, maar worden zinnen alleen in de eigen browser
   bewaard. Vul ze in (zie README.md, stap 2) en de kapstok is openbaar:
   iedereen die de QR-code scant kan zonder account zinnen toevoegen en
   bewerken.

   De anon key is bedoeld om openbaar te zijn; die mag in de repository staan.
   Zet hier nooit de service_role key.
   ========================================================================== */

window.KAPSTOK_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',

  titel: 'De kapstok van de CAD-groep',
  ondertitel: 'Hang je zin of woord aan een haakje. Iedereen mag aanvullen en bijschaven.',

  maxTekens: 280,
};

export const getAufklaerungDetails = (caseTitle) => {
    const cases = {
      "Sigmoidektomie": {
        script: `<strong>Rolle:</strong> Viszeralchirurg/-chirurgin<br/>
                 <strong>Situation:</strong> Aufklärung über eine laparoskopische Sigmoidektomie, die am nächsten Tag stattfinden soll<br/><br/>
                 <strong>Informationen:</strong><br/>
                 <ul>
                    <li><strong>Name, Alter:</strong> Hanna Müller, 32 Jahre</li>
                    <li><strong>Eingriff:</strong> Laparoskopische Sigmoidektomie, Dauer 60-120 Minuten</li>
                    <li><strong>Grund des Eingriffs:</strong> Divertikulitis</li>
                    <li><strong>Ablauf:</strong>
                        <ul>
                            <li>Vollnarkose</li>
                            <li>Zugangsweg: Platzierung von 3 Trokaren (1 infraumbilikal, 2 inguinal)</li>
                            <li>Exploration der Leibeshöhle und Aufsuchen der Sigma</li>
                            <li>Skelettierung der Sigma mittels bipolarer Klemme</li>
                            <li>Absetzung der Sigma mittels Schlingen oder Clips</li>
                            <li>Bergen der Sigma</li>
                            <li>Verbindung des Dickdarms mit dem Mastdarm</li>
                            <li>Kontrolle auf Bluttrockenheit und eventuelle Drainageneinlage</li>
                            <li>Schichtweiser Wundverschluss</li>
                        </ul>
                    </li>
                    <li><strong>Relevante Vor-/Begleiterkrankungen/Operationen:</strong> keine</li>
                    <li><strong>Dauermedikation:</strong> keine</li>
                 </ul><br/>
                 <strong>Aufgabenstellung:</strong><br/>
                 Erklären Sie der Patientin:
                 <ul>
                    <li><strong>Allgemeine Risiken,</strong> die bei jedem operativen Eingriff auftreten können</li>
                    <li><strong>Spezielle Risiken für diesen Eingriff:</strong>
                        <ul>
                            <li>Verletzung benachbarter Organe</li>
                            <li>Insuffizienz</li>
                        </ul>
                    </li>
                 </ul><br/>
                 <strong>Perioperatives Vorgehen:</strong><br/>
                 <ul>
                    <li>Vor der OP: Nüchtern (8 Stunden), Verdauungstraktvorbereitung</li>
                    <li>Am OP-Tag: parenterale Ernährung</li>
                    <li>Am nächsten Morgen: Trinken, nach 24 Stunden weiterer Kostaufbau</li>
                    <li>Nach der OP: Schnelle Fortbewegung vermeiden, 8 Tage körperliche Anstrengung vermeiden</li>
                 </ul><br/>
                 <strong>Gehen Sie auf eventuelle Rückfragen der Patientin ein.</strong>`,
        questions: [
            "Habe ich nach dem Eingriff starke Schmerzen?",
            "Wie lange muss ich im Krankenhaus bleiben?",
            "Was ist das größte Risiko bei dieser Operation?",
            "Wann kann ich wieder normal essen und trinken?",
            "Gibt es eine weniger invasive Alternative?"
        ]
      },
      "Cholezystektomie": {
        script: `<strong>Rolle:</strong> Viszeralchirurg/-chirurgin<br/>
                 <strong>Situation:</strong> Aufklärung über eine laparoskopische Cholezystektomie, die am nächsten Tag stattfinden soll<br/><br/>
                 <strong>Informationen:</strong><br/>
                 <ul>
                    <li><strong>Name, Alter:</strong> Anna Mayer, 35 Jahre</li>
                    <li><strong>Eingriff:</strong> Laparoskopische Cholezystektomie, Dauer 60-120 Minuten</li>
                    <li><strong>Grund des Eingriffs:</strong> Cholezystitis</li>
                    <li><strong>Ablauf:</strong>
                        <ul>
                            <li>Vollnarkose</li>
                            <li>Zugangsweg: Platzierung von 3 Trokaren (1 infraumbilikal, 2 inguinal)</li>
                            <li>Exploration der Leibeshöhle und Aufsuchen der Gallenblase</li>
                            <li>Skelettierung der Gallenblase mittels bipolarer Klemme</li>
                            <li>Absetzung der Gallenblase mittels Schlingen oder Clips</li>
                            <li>Bergen der Gallenblase</li>
                            <li>Kontrolle auf Bluttrockenheit und eventuelle Drainageneinlage</li>
                            <li>Schichtweiser Wundverschluss</li>
                        </ul>
                    </li>
                    <li><strong>Relevante Vor-/Begleiterkrankungen/Operationen:</strong> keine</li>
                    <li><strong>Dauermedikation:</strong> keine</li>
                 </ul><br/>
                 <strong>Aufgabenstellung:</strong><br/>
                 Erklären Sie der Patientin:
                 <ul>
                    <li><strong>Allgemeine Risiken,</strong> die bei jedem operativen Eingriff auftreten können</li>
                    <li><strong>Spezielle Risiken für diesen Eingriff:</strong>
                        <ul>
                            <li>Verletzung benachbarter Organe</li>
                            <li>Sekretion</li>
                        </ul>
                    </li>
                 </ul><br/>
                 <strong>Perioperatives Vorgehen:</strong><br/>
                 <ul>
                    <li>Vor der OP: Nüchtern (8 Stunden)</li>
                    <li>Am OP-Tag: parenterale Ernährung</li>
                    <li>1. Post-OP-Tag: Tee/stilles Wasser, ggf. Suppe</li>
                    <li>Nach 24 Stunden weiterer Kostaufbau</li>
                    <li>Nach der OP: Fettgehalt reduzieren, Ballaststoffe erhöhen, kleine Mahlzeiten</li>
                    <li>Körperliche Anstrengungen vermeiden</li>
                 </ul>`,
        questions: [
            "Muss die Gallenblase wirklich entfernt werden?",
            "Wie verändert sich mein Leben ohne Gallenblase?",
            "Wie lange werde ich arbeitsunfähig sein?",
            "Bleibt eine große Narbe zurück?",
            "Was passiert, wenn während der OP etwas schiefgeht?"
        ]
      },
      "Mastoidektomie": {
        script: `<strong>Rolle:</strong> Behandelnder Arzt<br/>
                 <strong>Situation:</strong> Aufklärung der Mutter der Patientin (ein kleines Mädchen) über einen operativen Eingriff, der am nächsten Tag stattfinden soll<br/><br/>
                 <strong>Informationen:</strong><br/>
                 <ul>
                    <li><strong>Patientin Name:</strong> Sandra</li>
                    <li><strong>Mutter:</strong> Katrin Bayer, 38 Jahre</li>
                    <li><strong>Eingriff:</strong> Teilweise Entfernung des Warzenfortsatzes, Dauer 60-90 Minuten</li>
                    <li><strong>Grund des Eingriffs:</strong> Mastoiditis aufgrund von Otitis media</li>
                    <li><strong>Ablauf:</strong>
                        <ul>
                            <li>Vollnarkose</li>
                            <li>Zugangsweg: Hauteinschnitt hinter dem Ohr</li>
                            <li>Ausräumung des Warzenfortsatzes und Entfernung entzündeter Gewebe</li>
                            <li>Kontrolle auf Bluttrockenheit und eventuelle Drainageneinlage</li>
                            <li>Tamponade</li>
                        </ul>
                    </li>
                    <li><strong>Relevante Vor-/Begleiterkrankungen/Operationen:</strong> keine</li>
                    <li><strong>Dauermedikation:</strong> keine</li>
                 </ul><br/>
                 <strong>Aufgabenstellung:</strong><br/>
                 Erklären Sie der Mutter der Patientin:
                 <ul>
                    <li><strong>Allgemeine Risiken,</strong> die bei jedem operativen Eingriff auftreten können</li>
                    <li><strong>Spezielle Risiken für diesen Eingriff:</strong>
                        <ul>
                            <li>Nervus facialis Parese (Lähmung der mimischen Muskulatur)</li>
                            <li>Hypästhesie (Gefühlsstörungen)</li>
                            <li>Geschmacksstörungen</li>
                            <li>Tinnitus, Schwindel, Übelkeit</li>
                        </ul>
                    </li>
                 </ul>`,
        questions: [
            "Ist die Operation für mein Kind sehr gefährlich?",
            "Könnte das Hörvermögen meiner Tochter dauerhaft geschädigt werden?",
            "Wie lange dauert die Heilung?",
            "Wie stark werden die Schmerzen nach der Operation sein?",
            "Was passiert, wenn wir die Operation nicht durchführen lassen?"
        ]
      },
      "Ösophagogastroduodenoskopie": {
          script: `<strong>Rolle:</strong> Internist/Internistin<br/>
                   <strong>Situation:</strong> Aufklärung über eine geplante Magenspiegelung (Ösophagogastroduodenoskopie) am nächsten Tag<br/><br/>
                   <strong>Informationen:</strong><br/>
                   <ul>
                      <li><strong>Name, Alter:</strong> Frau Bayer</li>
                      <li><strong>Eingriff:</strong> Ösophagogastroduodenoskopie (Magenspiegelung)</li>
                      <li><strong>Grund des Eingriffs:</strong> Verdacht auf Gastritis (Magenschleimhautentzündung)</li>
                      <li><strong>Dauer:</strong> 10-15 Minuten</li>
                      <li><strong>Ablauf:</strong>
                          <ul>
                              <li>Kurze Analgosedierung (leichte Sedierung mit Schmerzmittel) oder lokale Betäubung des Rachens</li>
                              <li>Zugangsweg: Einführung des Endoskops</li>
                              <li>Luftinsufflation zur besseren Sicht</li>
                              <li>Entnahme von Gewebeproben bei Bedarf</li>
                          </ul>
                      </li>
                      <li><strong>Relevante Vor-/Begleiterkrankungen/Operationen:</strong> keine</li>
                      <li><strong>Dauermedikation:</strong> keine</li>
                   </ul><br/>
                   <strong>Aufgabenstellung:</strong><br/>
                   Erklären Sie der Patientin:
                   <ul>
                      <li><strong>Allgemeine Risiken,</strong> die bei jedem invasiven Eingriff auftreten können</li>
                      <li><strong>Spezielle Risiken für diesen Eingriff:</strong>
                          <ul>
                              <li>Meteorismus (Blähungen durch Luftinsufflation)</li>
                              <li>Verletzungen der Schleimhäute</li>
                              <li>Perforation (selten, aber im Falle einer Perforation ist eine Notfalloperation erforderlich)</li>
                          </ul>
                      </li>
                   </ul><br/>
                   <strong>Perioperatives Vorgehen:</strong><br/>
                   <ul>
                      <li><u>Vor der Untersuchung:</u> Nüchternheit (6 Stunden), bis 2 Stunden vorher klare Flüssigkeiten erlaubt, Rücksprache bei blutverdünnenden Medikamenten</li>
                      <li><u>Nach der Untersuchung:</u> 30 Minuten Überwachung, bei Sedierung Begleitperson erforderlich, kein Autofahren/Maschinen bedienen, nicht arbeiten am selben Tag</li>
                   </ul>`,
          questions: [
              "Ist die Untersuchung schmerzhaft?",
              "Was passiert genau, wenn eine Perforation auftritt?",
              "Kann ich nach der Untersuchung normal essen?",
              "Gibt es Alternativen zu dieser Untersuchung?",
              "Wie lange dauert es, bis ich wieder fit bin?"
          ]
      },
      "Koloskopie": {
          script: `<strong>Rolle:</strong> Internist/-in<br/>
                   <strong>Situation:</strong> Aufklärung über eine Dickdarmspiegelung mit eventueller Polypenabtragung am nächsten Tag<br/><br/>
                   <strong>Informationen:</strong><br/>
                   <ul>
                      <li><strong>Name, Alter:</strong> Anna Roth, 68 Jahre</li>
                      <li><strong>Eingriff:</strong> Koloskopie</li>
                      <li><strong>Grund des Eingriffs:</strong> Vorsorge</li>
                      <li><strong>Ablauf:</strong>
                          <ul>
                              <li>Einführung des Endoskops in den After</li>
                              <li>Luftinsufflation zur besseren Sicht</li>
                              <li>Vorschieben des Endoskops bis zum Beginn des Dünndarms</li>
                              <li>Einsatz von Zusatzinstrumenten (Biopsiezange, Elektroschlinge) bei Bedarf</li>
                              <li>Entfernung von Polypen mit der Elektroschlinge</li>
                          </ul>
                      </li>
                      <li><strong>Relevante Vor-/Begleiterkrankungen/Operationen:</strong> keine</li>
                      <li><strong>Dauermedikation:</strong> keine</li>
                   </ul><br/>
                   <strong>Aufgabenstellung:</strong><br/>
                   Erklären Sie der Patientin:
                   <ul>
                      <li><strong>Allgemeine Risiken,</strong> die bei jedem invasiven Eingriff auftreten können</li>
                      <li><strong>Spezielle Risiken für diesen Eingriff:</strong>
                          <ul>
                              <li>Darmperforation (bei endoskopisch nicht verschließbarer Perforation: offene OP nötig)</li>
                              <li>Selten: Verletzung umgebender Organe und Strukturen</li>
                              <li>Gelegentlich stärkere Blutungen nach Gewebeentnahme</li>
                              <li>Entstehung narbiger Engstellen</li>
                          </ul>
                      </li>
                   </ul><br/>
                   <strong>Perioperatives Vorgehen:</strong><br/>
                   <ul>
                      <li>Vor der Spiegelung: Darmreinigung (1-2 Tage vorher Abführmittel, am Untersuchungstag Spüllösung)</li>
                      <li>Nach der Spiegelung: Luft im Darm kann schmerzhafte Blähungen verursachen (viel Bewegung hilft)</li>
                      <li>Falls Beruhigungs- oder Schmerzmittel gegeben wurden: weitere 2 Stunden nüchtern</li>
                   </ul>`,
          questions: [
              "Ist die Darmreinigung wirklich notwendig?",
              "Was spüre ich während der Untersuchung?",
              "Was ist ein Polyp und ist er gefährlich?",
              "Wie hoch ist das Risiko einer Perforation?",
              "Wann erhalte ich die Ergebnisse?"
          ]
      },
      "Koronarangiographie": {
          script: `<strong>Rolle:</strong> Kardiologe/-login<br/>
                   <strong>Situation:</strong> Aufklärung über eine Koronarangiographie, die am nächsten Tag stattfinden soll<br/><br/>
                   <strong>Informationen:</strong><br/>
                   <ul>
                      <li><strong>Name, Alter:</strong> Harry Bleckert, 48 Jahre</li>
                      <li><strong>Eingriff:</strong> Koronarangiographie, Dauer 60-120 Minuten</li>
                      <li><strong>Grund des Eingriffs:</strong> Angina pectoris</li>
                      <li><strong>Ablauf:</strong>
                          <ul>
                              <li>Lokale Betäubung</li>
                              <li>Zugangsweg: Hauteinschnitt</li>
                              <li>Einführung eines Katheters</li>
                              <li>Injektion von Kontrastmittel</li>
                              <li>Röntgenbilder</li>
                              <li>Eventuelle Platzierung eines Ballons oder Stents</li>
                              <li>Entfernung des Katheters</li>
                              <li>Anlegen eines Druckverbands</li>
                          </ul>
                      </li>
                      <li><strong>Relevante Vor-/Begleiterkrankungen/Operationen:</strong> keine</li>
                      <li><strong>Dauermedikation:</strong> keine</li>
                   </ul><br/>
                   <strong>Aufgabenstellung:</strong><br/>
                   Erklären Sie der Patientin:
                   <ul>
                      <li><strong>Allgemeine Risiken,</strong> die bei jedem operativen Eingriff auftreten können</li>
                      <li><strong>Spezielle Risiken für diesen Eingriff:</strong>
                          <ul>
                              <li>Arrhythmien</li>
                              <li>Gefäßverletzung</li>
                              <li>Allergische Reaktion auf Kontrastmittel (Exanthem, Juckreiz)</li>
                              <li>Aneurysma spurium</li>
                          </ul>
                      </li>
                   </ul><br/>
                   <strong>Perioperatives Vorgehen:</strong><br/>
                   <ul>
                      <li>Vor der OP: Nüchtern (4 Stunden)</li>
                      <li>Nach der OP: 12 Stunden Überwachung im Krankenhaus, nicht sofort aufstehen</li>
                      <li>Viel Flüssigkeit trinken zur Ausscheidung des Kontrastmittels</li>
                      <li>4 Tage ohne körperliche Anstrengung</li>
                   </ul>`,
          questions: [
              "Bin ich während der Untersuchung wach?",
              "Was ist ein Stent und brauche ich vielleicht einen?",
              "Gibt es alternative Untersuchungen?",
              "Wie gefährlich ist das Kontrastmittel für mich?",
              "Ich habe große Angst vor dem Eingriff."
          ]
      },
      "Arthroskopie": {
          script: `<strong>Rolle:</strong> Orthopäde/-login<br/>
                   <strong>Situation:</strong> Aufklärung über eine Arthroskopie am nächsten Tag<br/><br/>
                   <strong>Informationen:</strong><br/>
                   <ul>
                      <li><strong>Name, Alter:</strong> Nicht angegeben</li>
                      <li><strong>Eingriff:</strong> Arthroskopie</li>
                      <li><strong>Grund des Eingriffs:</strong> Knieverletzung, Meniskusschaden</li>
                      <li><strong>Ablauf:</strong>
                          <ul>
                              <li>Dauer: 1-2 Stunden</li>
                              <li>Lokalanästhesie, Blutdruckmanschette am betroffenen Bein</li>
                              <li>3 Hautschnitte am Knie</li>
                              <li>Erweiterung des Gelenkspalts mittels Gas/Flüssigkeit</li>
                              <li>Entfernung verletzter Gewebe</li>
                              <li>Kontrolle auf Bluttrockenheit, Drainage</li>
                              <li>Wundverschluss und Verband</li>
                          </ul>
                      </li>
                      <li><strong>Relevante Vor-/Begleiterkrankungen/Operationen:</strong> keine</li>
                      <li><strong>Dauermedikation:</strong> keine</li>
                   </ul><br/>
                   <strong>Aufgabenstellung:</strong><br/>
                   Erklären Sie der Patientin:
                   <ul>
                      <li><strong>Allgemeine Risiken,</strong> die bei jedem operativen Eingriff auftreten können</li>
                      <li><strong>Spezielle Risiken für diesen Eingriff:</strong>
                          <ul>
                              <li>Gelenkerguss</li>
                              <li>Gelenkschmerzen, Steifheit</li>
                              <li>Knieverletzung</li>
                          </ul>
                      </li>
                   </ul><br/>
                   <strong>Perioperatives Vorgehen:</strong><br/>
                   <ul>
                      <li>Vor der OP: Nüchtern (8 Stunden)</li>
                      <li>Körperliche Anstrengung in den ersten 24 Stunden nach dem Eingriff unterlassen</li>
                      <li>Nach 3 Tagen: ambulante Kontrolle und Physiotherapie</li>
                   </ul>`,
          questions: [
              "Wann kann ich wieder Sport machen?",
              "Ist eine Vollnarkose auch möglich?",
              "Wie lange dauert die Rehabilitation?",
              "Warum kann man das nicht ohne Operation behandeln?",
              "Wie erfolgreich ist diese Operation?"
          ]
      },
      "TEE": {
          script: `<strong>Rolle:</strong> Kardiologe/-login<br/>
                   <strong>Situation:</strong> Aufklärung über eine geplante transösophageale Echokardiographie (TEE), die am nächsten Tag stattfinden soll<br/><br/>
                   <strong>Informationen:</strong><br/>
                   <ul>
                      <li><strong>Name, Alter:</strong> Max Mustermann, 55 Jahre</li>
                      <li><strong>Eingriff:</strong> Transösophageale Echokardiographie (TEE), Dauer: 20-30 Minuten</li>
                      <li><strong>Grund des Eingriffs:</strong> Verdacht auf Herzklappenerkrankung oder Thromben im linken Vorhof</li>
                      <li><strong>Ablauf:</strong>
                          <ul>
                              <li>Kurze Analgosedierung (leichte Sedierung mit Schmerzmittel) oder lokale Betäubung des Rachens</li>
                              <li>Zugangsweg: Einführung des Endoskops</li>
                              <li>Durchführung: Einführung eines dünnen, flexiblen Schlauchs (Endoskop) mit einem Ultraschallkopf an der Spitze durch den Mund in die Speiseröhre, der Schlauch wird vorsichtig bis in die Nähe des Herzens geschoben, Ultraschallbilder des Herzens werden aufgenommen</li>
                          </ul>
                      </li>
                   </ul><br/>
                   <strong>Aufgabenstellung:</strong><br/>
                   Erklären Sie der Patientin:
                   <ul>
                      <li><strong>Allgemeine Risiken,</strong> die bei jedem invasiven Eingriff auftreten können</li>
                      <li><strong>Spezielle Risiken für diesen Eingriff:</strong>
                          <ul>
                              <li>Verletzung der Speiseröhre (selten, aber möglich)</li>
                              <li>Blutungen im Bereich der Speiseröhre</li>
                              <li>Herzrhythmusstörungen (sehr selten)</li>
                              <li>Aspiration (Einatmen von Mageninhalt)</li>
                              <li>Schluckbeschwerden oder Halsschmerzen nach der Untersuchung</li>
                          </ul>
                      </li>
                   </ul><br/>
                   <strong>Perioperatives Vorgehen:</strong><br/>
                   <ul>
                      <li>Vor der Untersuchung: Nüchternheit (6 Stunden), Rücksprache bei Medikamenten</li>
                      <li>Nach der Untersuchung: 30 Minuten Überwachung, Begleitperson bei Sedierung</li>
                   </ul>`,
          questions: [
              "Ist das Schlucken des Schlauchs sehr unangenehm?",
              "Bekomme ich genug Luft während der Untersuchung?",
              "Wie lange dauert es, bis die Betäubung nachlässt?",
              "Was ist, wenn Sie etwas Schlimmes finden?",
              "Gibt es Alternativen zu einer TEE?"
          ]
      }
    };
    return cases[caseTitle] || { script: `Für "${caseTitle}" wurde kein Skript gefunden.`, questions: [] };
};
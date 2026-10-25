'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link = (url, label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
  const profiles = {
    chatgpt: {
      name: 'ChatGPT', tagline: 'Vielseitiger Einstieg',
      description: 'Fragen, Texte, Bildverständnis, Bilderstellung und Websuche in einem Angebot. Für diesen Kurs ein sinnvoller Ausgangspunkt, wenn noch kein bestimmter Arbeitsablauf feststeht.',
      watch: 'Die konkrete Funktion muss im eigenen Konto verfügbar sein. Ein vielseitiges Angebot ist nicht automatisch bei jeder Einzelaufgabe das beste.',
      image: true, workplace: 'Breiter Alltagschat; umfangreichere Datei-Aufgaben in Work.',
      url: 'https://chatgpt.com/',
      sources: [
        ['https://learn.chatgpt.com/docs/get-started-with-work', 'Chat und Datei-Aufgaben'],
        ['https://learn.chatgpt.com/docs/image-inputs', 'Bilder verstehen'],
        ['https://learn.chatgpt.com/docs/image-generation', 'Bilder erzeugen'],
        ['https://learn.chatgpt.com/docs/web-search', 'Websuche']
      ]
    },
    gemini: {
      name: 'Gemini', tagline: 'Naheliegend im Google-Alltag',
      description: 'Texte in Canvas bearbeiten, Bilder verstehen und erzeugen sowie mit Google-Diensten arbeiten. Besonders naheliegend, wenn Gmail, Drive oder Google Docs bereits zum Alltag gehören.',
      watch: 'Verbundene Apps benötigen Freigaben. Direkte Funktionen in Gmail oder Docs hängen unter anderem vom Abo ab; Android, iPhone und Web bieten nicht überall dasselbe.',
      image: true, workplace: 'Google-Dienste und Canvas; je nach Konto und Freigaben.',
      url: 'https://gemini.google.com/',
      sources: [
        ['https://support.google.com/gemini/answer/13695044?hl=de', 'Verbundene Apps'],
        ['https://support.google.com/gemini/answer/16047321', 'Canvas'],
        ['https://support.google.com/gemini/answer/14903178', 'Dateien und Bilder'],
        ['https://support.google.com/gemini/answer/14286560?hl=de&ref_topic=16079905', 'Bilder erzeugen'],
        ['https://support.google.com/gemini/answer/15719111?co=GENIE.Platform%3DDesktop&hl=de', 'Recherche']
      ]
    },
    claude: {
      name: 'Claude', tagline: 'Texte, Dokumente und Erklärungen',
      description: 'Texte und Dokumente überarbeiten, Dateien erstellen, Fotos analysieren und Diagramme oder interaktive Erklärungen aufbauen. Ein sinnvoller erster Versuch für textorientierte Aufgaben.',
      watch: 'Kann Bilder verstehen, hat aber keinen eingebauten Generator für neue Fotos und Illustrationen. Diagramme und interaktive Grafiken sind davon zu unterscheiden.',
      image: false, workplace: 'Dokumente, Dateierstellung und interaktive Visualisierungen.',
      url: 'https://claude.ai/',
      sources: [
        ['https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude', 'Dateien erstellen'],
        ['https://support.claude.com/en/articles/8241126-upload-files-to-claude', 'Dateien und Bilder verstehen'],
        ['https://support.claude.com/en/articles/9002504-can-claude-produce-images', 'Grenzen bei Bildern'],
        ['https://support.claude.com/en/articles/13979539-custom-visuals-in-chat-and-cowork', 'Diagramme und Visuals'],
        ['https://support.claude.com/en/articles/10684626-enable-and-use-web-search', 'Websuche'],
        ['https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities', 'Verbundene Dienste']
      ]
    },
    copilot: {
      name: 'Copilot', tagline: 'Naheliegend für Microsoft 365',
      description: 'Allgemeiner Chat mit Bild- und Recherchefunktionen. Der besondere praktische Vorteil für Office-Nutzer ist die Arbeit direkt in Word, Excel, PowerPoint und Outlook mit einem passenden Abo.',
      watch: 'Kostenloser Copilot-Chat und Copilot in den Office-Apps sind nicht derselbe Funktionsumfang. Zuerst das vorhandene Microsoft-365-Abo prüfen.',
      image: true, workplace: 'Direkt in Office-Apps mit einem berechtigten Microsoft-365-Abo.',
      url: 'https://copilot.microsoft.com/',
      sources: [
        ['https://support.microsoft.com/de-de/privacy/microsoft-copilot/transparency-note', 'Funktionen und Recherche'],
        ['https://support.microsoft.com/en-us/microsoft-365-copilot/file-upload-in-microsoft-copilot', 'Dateien und Bilder verstehen'],
        ['https://support.microsoft.com/de-de/microsoft-copilot/using-image-generation-in-microsoft-copilot', 'Bilder erzeugen'],
        ['https://www.microsoft.com/de-de/copilot/pricing/individuals', 'Office und Abos']
      ]
    },
    mistral: {
      name: 'Mistral Vibe', tagline: 'Eine weitere vielseitige Alternative',
      description: 'Texte, Dateien und Webrecherche sowie Bilder verstehen, erzeugen und verändern. Das frühere Le Chat ist auch für gemischte Aufgaben einen Vergleich wert.',
      watch: 'Dateien lesen und Texte bearbeiten ist etwas anderes als Tabellen berechnen. Für Tabellenkalkulationen und bestimmte Datenanalysen ist laut Dokumentation ein Bezahltarif nötig.',
      image: true, workplace: 'Dateien und Canvas; einzelne Arbeitsfunktionen nur im Bezahlplan.',
      url: 'https://chat.mistral.ai/',
      sources: [
        ['https://docs.mistral.ai/vibe/work/files-and-canvas', 'Dateien, Bilder und Canvas'],
        ['https://docs.mistral.ai/vibe/work/image-generation', 'Bilder erzeugen'],
        ['https://docs.mistral.ai/vibe/work/skills', 'Recherche mit Quellen'],
        ['https://docs.mistral.ai/vibe/work/spreadsheets', 'Tabellen und Tarifgrenzen']
      ]
    }
  };
  const choices = [
    {id:'start', label:'Einfach anfangen', sub:'Fragen, Ideen, Alltag', first:'chatgpt',
      why:'Für diesen Kurs würde ich mit ChatGPT beginnen: Du kannst Erklärungen, Texte, Bildfragen und Bilderstellung an einem Ort ausprobieren. So lernst du verschiedene Aufgaben kennen, ohne gleich das Angebot wechseln zu müssen.',
      alternatives:[['gemini','Naheliegend, wenn du bereits Google-Dienste verwendest.'],['claude','Ein guter Vergleichspartner, wenn zunächst Texte und Erklärungen im Mittelpunkt stehen.']],
      caution:'Auch Gemini, Claude, Copilot und Mistral können allgemeine Fragen beantworten. Dieser Startvorschlag ist eine didaktische Empfehlung, kein Leistungsurteil.',
      prompt:'Erkläre mir den Unterschied zwischen WLAN und mobilen Daten in einfacher Sprache. Verwende ein Alltagsbeispiel und höchstens 100 Wörter.',
      sourceIds:['chatgpt','gemini','claude']},
    {id:'writing',label:'Texte schreiben',sub:'Nachricht, Brief, Überarbeitung',first:'claude',
      why:'Claude ist ein sinnvoller erster Versuch, wenn du an Formulierungen, Gliederung oder einem längeren Entwurf arbeiten möchtest. Text- und Dateibearbeitung sind ausdrücklich unterstützte Arbeitswege.',
      alternatives:[['chatgpt','Ebenfalls für Entwürfe, Varianten und verständliche Überarbeitungen geeignet.'],['gemini','Canvas bietet eine Arbeitsfläche zum direkten Überarbeiten; praktisch mit Google Docs.']],
      caution:'„Claude ist immer besser bei Texten“ wäre nicht belegt. Lass zwei Angebote denselben Absatz überarbeiten und entscheide nach Ton, Genauigkeit und eingehaltenen Vorgaben.',
      prompt:'Überarbeite den folgenden Text für einen freundlichen, klaren Brief. Erhalte alle Fakten, erfinde keine Begründungen und kürze Wiederholungen. Zeige danach die drei wichtigsten Änderungen. Mein Text: [hier einfügen]',
      sourceIds:['claude','chatgpt','gemini']},
    {id:'documents',label:'Dokumente bearbeiten',sub:'PDF verstehen, Datei erstellen',first:'claude',
      why:'Für einen hochgeladenen Text und eine daraus entstehende Word-, PDF- oder Präsentationsdatei ist Claude ein sinnvoller Startpunkt. Dateierstellung ist dort als eigene Funktion dokumentiert.',
      alternatives:[['chatgpt','In Work lassen sich aus Dateien fertige Dokumente und Präsentationen erarbeiten.'],['gemini','Für Textarbeit in Canvas und den anschließenden Weg nach Google Docs interessant.']],
      caution:'Ein PDF ist nicht immer nur Text: Scans, Diagramme und eingebettete Bilder können je nach Angebot, Dateiformat und Länge anders verarbeitet werden. Prüfe, ob wichtige Abbildungen tatsächlich berücksichtigt wurden.',
      prompt:'Fasse das beigefügte Dokument auf einer Seite zusammen. Trenne Kernaussagen, offene Fragen und unklare Stellen. Nenne bei wichtigen Aussagen die Seite und erfinde keine fehlenden Angaben.',
      sourceIds:['claude','chatgpt','gemini']},
    {id:'understand',label:'Ein Bild verstehen',sub:'Foto, Screenshot, Diagramm',first:'chatgpt',
      why:'Ein Foto oder Screenshot plus eine konkrete Frage ist ein einfacher Einstieg mit ChatGPT. Du kannst zum Beispiel eine sichtbare Fehlermeldung erklären lassen oder ein Diagramm besprechen.',
      alternatives:[['claude','Kann Fotos und Screenshots ebenfalls analysieren – „Claude kann keine Bilder“ wäre falsch.'],['gemini','Versteht hochgeladene Bilder und Text in Screenshots ebenfalls.']],
      caution:'Auch Copilot und Mistral bieten Bildverständnis. Bei allen gilt: Kleine Schrift, Details und Zahlen können falsch gelesen werden. Unklare Stellen ausdrücklich benennen lassen.',
      prompt:'Erkläre mir, was auf diesem Screenshot zu sehen ist. Lies die Fehlermeldung genau ab und schlage einen ersten, einfachen Schritt vor. Wenn etwas nicht lesbar ist, sage es ausdrücklich.',
      sourceIds:['chatgpt','claude','gemini','copilot','mistral']},
    {id:'create',label:'Ein Bild erzeugen',sub:'Illustration, Foto, Bildänderung',first:'chatgpt',
      why:'ChatGPT ist für diesen Kurs ein direkter Einstieg in das Erzeugen und schrittweise Verändern von Bildern. Du kannst ein neues Motiv beschreiben oder ein eigenes Bild als Vorlage beifügen.',
      alternatives:[['gemini','Bietet ebenfalls Bilderstellung und Bearbeitung hochgeladener Bilder.'],['mistral','Kann über ein integriertes Bildwerkzeug Bilder erstellen und verändern.']],
      caution:'Copilot kann das ebenfalls. Claude hat keinen eingebauten Generator für Fotos und Illustrationen; es kann jedoch Bildideen formulieren und Diagramme oder interaktive Grafiken erstellen.',
      prompt:'Erstelle eine naturalistische Illustration einer Kohlmeise auf einem dünnen Zweig, seitliche Ansicht, ruhiger heller Hintergrund, ohne Schrift. Achte auf die typischen Gefiedermerkmale.',
      sourceIds:['chatgpt','gemini','mistral','copilot','claude']},
    {id:'research',label:'Aktuelles suchen',sub:'Informationen mit Quellen',first:'gemini',
      why:'Für eine Recherche über mehrere Quellen ist Gemini mit Deep Research ein möglicher Startpunkt: Es erstellt einen Rechercheplan und daraus einen Bericht. Für einen kurzen Faktencheck genügt häufig die normale Websuche.',
      alternatives:[['chatgpt','Websuche mit Quellen; für umfangreichere Fragen ist auch Deep Research dokumentiert.'],['copilot','Verknüpft Antworten mit Webquellen; Funktionsumfang und besondere Recherchemodi hängen vom Tarif ab.']],
      caution:'Claude und Mistral können ebenfalls mit Webquellen arbeiten. Ein Quellenlink beweist noch nicht die Aussage: Öffne die Quelle, kontrolliere Datum und Inhalt. Höhere Recherchelimits können ein Abo verlangen.',
      prompt:'Vergleiche drei Ausflugsziele in [Region] für [Datum]. Suche aktuelle offizielle Angaben zu Öffnungszeiten und Eintritt. Verlinke die Quellen und kennzeichne, was du nicht verifizieren konntest.',
      sourceIds:['gemini','chatgpt','copilot','claude','mistral']},
    {id:'google',label:'Mit Google arbeiten',sub:'Gmail, Drive, Google Docs',first:'gemini',
      why:'Wenn deine Unterlagen bereits bei Google liegen, ist Gemini besonders naheliegend. Verbundene Apps können zum Beispiel Gmail und Kalender einbeziehen; Canvas unterstützt den Weg nach Google Docs.',
      alternatives:[['chatgpt','Kommt ebenfalls infrage, wenn die benötigte Verbindung verfügbar und eingerichtet ist.'],['claude','Unterstützt auch Verbindungen zu externen Diensten; Google-Arbeit ist nicht exklusiv Gemini vorbehalten.']],
      caution:'Verbindungen sind kein automatischer Vollzugriff. Konto, Zustimmung, Gerät und Tarif bestimmen die Funktionen. Hilfe direkt in Gmail oder Docs und ein Chat mit verbundenen Apps sind unterschiedliche Arbeitswege.',
      prompt:'Fasse die ausgewählte E-Mail in drei Stichpunkten zusammen und entwirf eine kurze Antwort. Verschicke nichts, bevor ich den Entwurf geprüft habe.',
      sourceIds:['gemini','chatgpt','claude']},
    {id:'office',label:'Mit Office arbeiten',sub:'Word, Excel, PowerPoint',first:'copilot',
      why:'Wenn du in Word, Excel, PowerPoint oder Outlook bleiben möchtest, ist Copilot im passenden Microsoft-365-Abo besonders naheliegend. Prüfe zuerst, was in deinem vorhandenen Abo enthalten ist.',
      alternatives:[['chatgpt','Kann Dateien erzeugen und bearbeiten; der genaue Arbeitsweg hängt von verfügbaren Werkzeugen und Verbindungen ab.'],['claude','Kann ebenfalls Word-, Excel- und PowerPoint-Dateien erstellen und bearbeiten.']],
      caution:'Eine fertige PowerPoint-Datei erzeugen und direkt innerhalb von PowerPoint arbeiten sind zwei verschiedene Dinge. Der kostenlose Copilot-Chat bietet nicht automatisch alle Funktionen der Office-Apps.',
      prompt:'Erstelle aus diesem Dokument einen Entwurf mit fünf Präsentationsfolien. Je Folie: eine klare Überschrift, höchstens drei kurze Stichpunkte und eine Notiz für meinen Vortrag. Ergänze keine unbelegten Fakten.',
      sourceIds:['copilot','chatgpt','claude']}
  ];
  let active = 'start';

  function renderDecision() {
    const choice = choices.find(c => c.id === active);
    const first = profiles[choice.first];
    $('decision-choices').innerHTML = choices.map(c => `<button type="button" class="decision-choice" data-decision="${c.id}" aria-pressed="${c.id===active}"><strong>${c.label}</strong><span>${c.sub}</span></button>`).join('');
    $('decision-result').innerHTML = `<article class="decision-primary"><p class="eyebrow">Hier würde ich anfangen</p><h2>${first.name}</h2><p>${choice.why}</p><div class="button-row"><a class="button primary" href="${first.url}" target="_blank" rel="noopener noreferrer">${first.name} öffnen ↗</a><button type="button" class="text-button" data-single-cost="${choice.first}">Kosten & Limits ansehen</button></div></article><aside class="decision-alternatives"><h3>Auch ausprobieren</h3>${choice.alternatives.map(([id,reason])=>`<div><strong>${profiles[id].name}</strong><p>${reason}</p></div>`).join('')}</aside>`;
    $('decision-caution').textContent = choice.caution;
    $('decision-prompt').textContent = choice.prompt;
    $('decision-sources').innerHTML = choice.sourceIds.map(id => `<div class="decision-source"><strong>${profiles[id].name}</strong><div>${profiles[id].sources.map(([url,title])=>link(url,title)).join(' · ')}</div></div>`).join('');
    $('decision-result').setAttribute('aria-label', 'Startvorschlag für '+choice.label);
  }

  function renderOverview() {
    $('capability-rows').innerHTML = Object.values(profiles).map(p => `<tr><th scope="row">${link(p.sources[0][0],p.name)}</th><td>Ja</td><td>Ja</td><td>${p.image?'Ja':link('https://support.claude.com/en/articles/9002504-can-claude-produce-images','Kein eingebauter Bildgenerator¹')}</td><td>Ja</td><td>${p.workplace}</td></tr>`).join('');
    $('decision-profiles').innerHTML = Object.entries(profiles).map(([id,p])=>`<details><summary>${p.name} · ${p.tagline}</summary><p>${p.description}</p><p><strong>Darauf achten:</strong> ${p.watch}</p><button type="button" class="text-button" data-single-cost="${id}">Kosten & Limits ansehen ↗</button></details>`).join('');
  }

  document.addEventListener('click', e => {
    const button = e.target.closest('[data-decision]');
    if (!button) return;
    active = button.dataset.decision;
    renderDecision();
    // Keep keyboard focus on the re-rendered choice.
    $('decision-choices').querySelector(`[data-decision="${active}"]`).focus({preventScroll:true});
  });
  $('decision-copy').addEventListener('click', async () => {
    const text = choices.find(c=>c.id===active).prompt;
    try {
      await navigator.clipboard.writeText(text);
      $('decision-copy-state').textContent='Kopiert. Im gewählten Angebot in einen frischen Chat einfügen.';
    } catch {
      $('decision-copy-state').textContent='Automatisches Kopieren ist hier nicht verfügbar. Bitte den Beispieltext markieren und kopieren.';
    }
  });
  $('decision-choices').addEventListener('click',()=>{$('decision-copy-state').textContent='';});
  renderDecision();
  renderOverview();
})();

(function(){
  const topic = 'zuschlag';
  function r(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function make(d){
    // Einfache Einzelkosten + prozentuale Zuschläge (Material-, Fertigungs-, Verw.-, Vertriebszuschlag)
    const ekm = r(20,60)*10;   // Material-EK
    const ekf = r(10,40)*10;   // Fertigungs-EK
    const zm  = r(5,15);       // % Materialgemeinkosten
    const zf  = r(10,30);      // % Fertigungsgem.k.
    const zv  = r(3,12);       // % Verw.
    const zvt = r(3,12);       // % Vertrieb
    const gew = (d>=3? r(3,10):0); // Gewinnzuschlag optional

    const mgk = Math.round(ekm*zm/100);
    const fgk = Math.round(ekf*zf/100);
    const herstell = ekm+ekf+mgk+fgk;
    const vwgk = Math.round(herstell*zv/100);
    const vtkg = Math.round(herstell*zvt/100);
    const selbst = herstell+vwgk+vtkg;
    const preis  = gew? Math.round(selbst*(1+gew/100)) : selbst;

    // --- Darstellung: ausgefüllte Tabelle mit max. 2 Lücken (HK/SK/LP) ---
    function fmtEUR(n){ return new Intl.NumberFormat('de-DE').format(n) + ' \u20AC'; }

    // max 2 Blanks aus den Kernfeldern
    const keys = ['herstell','selbst','preis'];
    const blanks = new Set();
    const want = r(1,2);
    while (blanks.size < want) blanks.add(keys[r(0, keys.length-1)]);

    function cellVal(key, val, tip){
      if (blanks.has(key)){
        const ans = (typeof val === 'number') ? val : 0;
        const ph  = (key==='preis' ? 'Listenpreis' : key==='selbst' ? 'Selbstkosten' : 'Herstellkosten');
        return `<input data-answer="${ans}" placeholder="${ph}" />${tip?` <span class="info-btn" data-tip="${tip}">i</span>`:''}`;
      }
      return `${typeof val==='number'? fmtEUR(val): val}${tip?` <span class="info-btn" data-tip="${tip}">i</span>`:''}`;
    }

    const markup = `
      <div class="card">
        <h3>Zuschlagskalkulation</h3>
        <p class="muted">Ausgefüllte Tabelle – fülle die markierten Lücken (max. zwei).</p>
        <table class="calc-table" style="width:100%; border-collapse:separate; border-spacing:.5rem .4rem;">
          <tbody>
            <tr>
              <th style="text-align:left;">Einzelkosten Material</th>
              <td>${fmtEUR(ekm)}</td>
              <td class="muted">EKm</td>
            </tr>
            <tr>
              <th style="text-align:left;">Einzelkosten Fertigung</th>
              <td>${fmtEUR(ekf)}</td>
              <td class="muted">EKf</td>
            </tr>
            <tr>
              <th style="text-align:left;">Materialgemeinkosten</th>
              <td>${fmtEUR(mgk)}</td>
              <td class="muted">${zm}%</td>
            </tr>
            <tr>
              <th style="text-align:left;">Fertigungsgemeinkosten</th>
              <td>${fmtEUR(fgk)}</td>
              <td class="muted">${zf}%</td>
            </tr>
            <tr>
              <th style="text-align:left;">Herstellkosten</th>
              <td>${cellVal('herstell', herstell, 'HK = EKm + EKf + MGK + FGK')}</td>
              <td class="muted">HK</td>
            </tr>
            <tr>
              <th style="text-align:left;">Verwaltungsgemeinkosten</th>
              <td>${fmtEUR(vwgk)}</td>
              <td class="muted">${zv}%</td>
            </tr>
            <tr>
              <th style="text-align:left;">Vertriebsgemeinkosten</th>
              <td>${fmtEUR(vtkg)}</td>
              <td class="muted">${zvt}%</td>
            </tr>
            <tr>
              <th style="text-align:left;">Selbstkosten</th>
              <td>${cellVal('selbst', selbst, 'SK = HK + VWGK + VTGK')}</td>
              <td class="muted">SK</td>
            </tr>
            <tr>
              <th style="text-align:left;">Gewinnzuschlag</th>
              <td>${gew? (Math.round(selbst*gew/100) + ' \u20AC') : '—'}</td>
              <td class="muted">${gew? (gew+'%') : ''}</td>
            </tr>
            <tr>
              <th style="text-align:left;">Listenpreis</th>
              <td>${cellVal('preis', preis, gew? 'LP = SK · (1+Gewinn%)' : 'LP = SK')}</td>
              <td class="muted">LP</td>
            </tr>
          </tbody>
        </table>
        <small data-explain>Kontrolle: MGK≈${mgk}, FGK≈${fgk}, HK=${herstell}; VWGK≈${vwgk}, VTGK≈${vtkg}, SK=${selbst}${gew?`, LP≈${preis}`:''}.</small>
      </div>`;
    return { markup };
  }

  window.Train && window.Train.registerTopic(topic, make);
})();
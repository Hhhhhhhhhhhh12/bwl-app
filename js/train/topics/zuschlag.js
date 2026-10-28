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

    // Rechne intern in Cent; jeder Zuschlagsbetrag wird kaufmännisch auf Cent gerundet.
    const mgkCent = ekm * zm, fgkCent = ekf * zf;
    const hkCent = (ekm + ekf) * 100 + mgkCent + fgkCent;
    const vwCent = Math.round(hkCent * zv / 100), vtCent = Math.round(hkCent * zvt / 100);
    const skCent = hkCent + vwCent + vtCent;
    const profitCent = Math.round(skCent * gew / 100);
    const mgk = mgkCent / 100, fgk = fgkCent / 100, herstell = hkCent / 100;
    const vwgk = vwCent / 100, vtkg = vtCent / 100, selbst = skCent / 100;
    const preis = (skCent + profitCent) / 100;
    function fmtEUR(n){ return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + ' €'; }

    // Ziehen ohne Zurücklegen: auch kontrollierte Zufallsfolgen terminieren.
    const keys = ['herstell', 'selbst', 'preis'];
    const blanks = new Set();
    const want = r(1, 2);
    for (let i = 0; i < want; i++) blanks.add(keys.splice(r(0, keys.length - 1), 1)[0]);

    function cellVal(key, val, tip){
      if (blanks.has(key)){
        const ans = (typeof val === 'number') ? val : 0;
        const ph  = (key==='preis' ? 'Nettoverkaufspreis' : key==='selbst' ? 'Selbstkosten' : 'Herstellkosten');
        return `<input data-answer="${ans}" placeholder="${ph}" />${tip?` <span class="info-btn" data-tip="${tip}">i</span>`:''}`;
      }
      return `${typeof val==='number'? fmtEUR(val): val}${tip?` <span class="info-btn" data-tip="${tip}">i</span>`:''}`;
    }

    const markup = `
      <div class="card">
        <h3>Zuschlagskalkulation</h3>
        <p class="muted">Fülle die markierten Lücken (max. zwei). MGK beziehen sich auf Materialeinzelkosten, FGK auf Fertigungseinzelkosten; Verwaltung und Vertrieb jeweils auf Herstellkosten, Gewinn auf Selbstkosten. Runde jeden Zuschlagsbetrag kaufmännisch auf Cent und rechne mit diesen Centbeträgen weiter. Keine Bestandsänderungen, Sondereinzelkosten, Rabatte, Skonti oder Umsatzsteuer.</p>
        <table class="calc-table">
          <tbody>
            <tr>
              <th>Einzelkosten Material</th>
              <td>${fmtEUR(ekm)}</td>
              <td class="muted">EKm</td>
            </tr>
            <tr>
              <th>Einzelkosten Fertigung</th>
              <td>${fmtEUR(ekf)}</td>
              <td class="muted">EKf</td>
            </tr>
            <tr>
              <th>Materialgemeinkosten</th>
              <td>${fmtEUR(mgk)}</td>
              <td class="muted">${zm}%</td>
            </tr>
            <tr>
              <th>Fertigungsgemeinkosten</th>
              <td>${fmtEUR(fgk)}</td>
              <td class="muted">${zf}%</td>
            </tr>
            <tr>
              <th>Herstellkosten</th>
              <td>${cellVal('herstell', herstell, 'HK = EKm + EKf + MGK + FGK')}</td>
              <td class="muted">HK</td>
            </tr>
            <tr>
              <th>Verwaltungsgemeinkosten</th>
              <td>${fmtEUR(vwgk)}</td>
              <td class="muted">${zv}%</td>
            </tr>
            <tr>
              <th>Vertriebsgemeinkosten</th>
              <td>${fmtEUR(vtkg)}</td>
              <td class="muted">${zvt}%</td>
            </tr>
            <tr>
              <th>Selbstkosten</th>
              <td>${cellVal('selbst', selbst, 'SK = HK + VWGK + VTGK')}</td>
              <td class="muted">SK</td>
            </tr>
            <tr>
              <th>Gewinnzuschlag</th>
              <td>${gew? fmtEUR(profitCent / 100) : '—'}</td>
              <td class="muted">${gew? (gew+'%') : ''}</td>
            </tr>
            <tr>
              <th>Nettoverkaufspreis</th>
              <td>${cellVal('preis', preis, gew? 'Nettoverkaufspreis = SK + gerundeter Gewinnbetrag' : 'Nettoverkaufspreis = SK')}</td>
              <td class="muted">NVP</td>
            </tr>
          </tbody>
        </table>
        <small class="explain muted is-hidden" data-explain>MGK = ${ekm} × ${zm}% = ${fmtEUR(mgk)}; FGK = ${ekf} × ${zf}% = ${fmtEUR(fgk)}.
          HK = ${fmtEUR(ekm)} + ${fmtEUR(ekf)} + ${fmtEUR(mgk)} + ${fmtEUR(fgk)} = ${fmtEUR(herstell)}.
          VwGK = HK × ${zv}% ≈ ${fmtEUR(vwgk)}; VtGK = HK × ${zvt}% ≈ ${fmtEUR(vtkg)}.
          SK = ${fmtEUR(herstell)} + ${fmtEUR(vwgk)} + ${fmtEUR(vtkg)} = ${fmtEUR(selbst)}.
          Gewinn = SK × ${gew}% ≈ ${fmtEUR(profitCent / 100)}; Nettoverkaufspreis = SK + Gewinn = ${fmtEUR(preis)}.</small>
      </div>`;
    return { markup };
  }

  window.Train && window.Train.registerTopic(topic, make);
})();
import { useState, useEffect, useRef } from "react";

// ════════════════════════════════════════════════════════════════════════════
// TAX CONFIG — to add a new year: copy a year block, change the key,
// update numbers from Belastingdienst. All calculations work automatically.
// ════════════════════════════════════════════════════════════════════════════
const TAX_CONFIG = {
  2025: {
    brackets: [
      { limit: 38441,    rate: 0.3582 },
      { limit: 76817,    rate: 0.3748 },
      { limit: Infinity, rate: 0.4950 },
    ],
    ahk:            { max: 3068, phaseOutStart: 28406, phaseOutRate: 0.0634,   zeroAt: 76817  },
    arbeidskorting: { max: 5599, buildUpEnd: 10742, buildUpRate: 0.08052, plateauEnd: 23201, phaseOutStart: 43071, phaseOutRate: 0.0651, zeroAt: 129078 },
    zvwEmployee: 0.0526, zvwEmployer: 0.0651, zvwZZP: 0.0526, zvwMax: 75864,
    zelfstandigenaftrek: 2470, mkbVrijstelling: 0.1340,
    reiskosten_per_km: 0.23, reiskosten_max_days: 214,
    lease_bijtelling_elektrisch: 0.16, lease_bijtelling_overig: 0.22,
  },
  2026: {
    brackets: [
      { limit: 38883,    rate: 0.3575 },
      { limit: 78426,    rate: 0.3756 },
      { limit: Infinity, rate: 0.4950 },
    ],
    ahk:            { max: 3115, phaseOutStart: 29736, phaseOutRate: 0.06398, zeroAt: 78426  },
    arbeidskorting: { max: 5685, buildUpEnd: 10741, buildUpRate: 0.08052, plateauEnd: 24813, phaseOutStart: 45592, phaseOutRate: 0.0651, zeroAt: 132920 },
    zvwEmployee: 0.0485, zvwEmployer: 0.0610, zvwZZP: 0.0485, zvwMax: 79409,
    zelfstandigenaftrek: 2470, mkbVrijstelling: 0.1280,
    reiskosten_per_km: 0.23, reiskosten_max_days: 214,
    lease_bijtelling_elektrisch: 0.16, lease_bijtelling_overig: 0.22,
  },
};

// ════════════════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ════════════════════════════════════════════════════════════════════════════
const T = {
  nl: {
    title: "Bruto → Netto", subtitle: "in één klik.",
    sub: "Bereken je nettoloon inclusief vakantiegeld, pensioen, reiskosten en meer. Voor werknemers én ZZP'ers.",
    iAmA: "Ik ben een", employee: "👔 Werknemer", zzp: "💼 ZZP / Ondernemer",
    taxYear: "Belastingjaar",
    calcDirection: "Berekening",
    directionBrutoNetto: "Bruto → Netto", directionNettoBruto: "Netto → Bruto",
    grossSalary: "Brutosalaris", zzpProfit: "Jaarwinst (voor aftrek)",
    netSalaryInput: "Gewenst nettosalaris",
    perYear: "Per jaar", perMonth: "Per maand",
    hoursWeekLabel: "Werkweek & FTE",
    extras: "Extra's meenemen",
    holidayPay: "Vakantiegeld (8%)", thirteenth: "13e maand", ruling30: "30% ruling",
    loonheffingskorting: "Loonheffingskorting",
    loonheffingskortingInfo: "De loonheffingskorting verlaagt je belasting. Je mag dit slechts bij één werkgever tegelijk toepassen. Bij een tweede baan of uitkering zet je dit uit.",
    ruling30Info: "30% van het brutoloon is belastingvrij als kostenvergoeding. Alleen voor expats met een geldige beschikking.",
    advancedToggle: "Pensioen, reiskosten & lease auto",
    pensionLabel: "Pensioenpremie werknemer", pensionSuffix: "% van bruto", pensionHint: "Gemiddeld 4-8% in NL",
    travelLabel: "Reiskostenvergoeding", kmLabel: "Km enkele reis", kmHint: "Thuis → werk",
    daysLabel: "Werkdagen/jaar", daysSuffix: "dagen", daysHint: "Max 214 bij 26 vakantiedagen",
    taxFreeKm: "Belastingvrij", bothWays: "heen én terug",
    leaseLabel: "Lease auto bijtelling", catalogValue: "Cataloguswaarde", catalogHint: "Catalogusprijs auto",
    electric: "⚡ Elektrisch", other: "⛽ Overig",
    hourlyLabel: "Uurtarief inzicht", hourlyRate: "Uurtarief", hourlyRateHint: "Je factuurtarief",
    hoursPerWeek: "Uur per week", hoursSuffix: "uur", hoursHint: "Billable uren",
    netPerMonth: "Netto per maand", perYearLabel: "per jaar", effectiveRate: "Effectief tarief",
    netIncome: "Nettoloon", incomeTax: "Inkomstenbelasting", zvwLabel: "Bijdrage ZVW", pension: "Pensioenpremie",
    perDay: "Per dag", perDayHint: (d) => `op basis van ${d} werkdagen`,
    perHour: "Per uur", perHourHint: (h) => `netto (${h}-urige werkweek)`,
    netHourly: "Netto uurtarief", fromRate: (r) => `van je €${r} tarief`,
    fteInsight: "FTE", fteInsightHint: (fte, h) => `${h} uur/week · ${(fte*100).toFixed(0)}% fulltime`,
    grossSalaryLabel: "Bruto salaris", grossProfit: "Bruto winst",
    holidayPayLabel: "Vakantiegeld (8%)", thirteenthLabel: "13e maand (eenmalig)",
    selfEmployedDeduction: "Zelfstandigenaftrek", mkbLabel: "MKB-winstvrijstelling",
    taxableIncome: "Belastbaar inkomen", pensionDeduction: "Pensioenpremie",
    leaseBijtelling: "Lease bijtelling", grossTax: "Inkomstenbelasting (bruto)",
    generalCredit: "Algemene heffingskorting", employmentCredit: "Arbeidskorting",
    loonheffingskortingLabel: "Loonheffingskorting",
    netTax: "Te betalen IB (netto)", travelAllowance: "Reiskostenvergoeding",
    holidayOnce: "Vakantiegeld (eenmalig)",
    reversedBruto: "Benodigde brutosalaris",
    reversedNote: "Dit is het brutosalaris dat resulteert in het door jou ingevoerde nettosalaris.",
    zzpNote: "⚠️ Let op: Als ZZP'er betaal je ook premies voor arbeidsongeschiktheid (AOV) zelf. Houd rekening met ~€150–300/maand. Pensioenopbouw is ook eigen verantwoordelijkheid.",
    compareToggle: "Vergelijk met", compareLabel: "Onderdeel", compareDiff: "Verschil",
    compareRows: ["Netto/maand", "Netto/jaar", "Belasting", "ZVW bijdrage", "Eff. tarief"],
    copyBtn: "📋 Kopieer berekening", copied: "✓ Gekopieerd",
    disclaimer: "Indicatieve berekening op basis van officiële tarieven {year} (Belastingdienst). Geen rekening gehouden met hypotheekrenteaftrek, toeslagen of andere persoonlijke situaties. Raadpleeg een belastingadviseur voor een exacte berekening.",
    footerBy: "Looncheck door", footerRates: "Tarieven gebaseerd op Belastingdienst", adLabel: "Advertentie",
    copyText: (year, mode, r, fmt) => [
      `Looncheck berekening ${year}`,
      `Modus: ${mode === "employee" ? "Werknemer" : "ZZP"}`,
      `Bruto: ${fmt(mode === "zzp" ? r.winst : r.brutoJaar)}`,
      `Netto/maand: ${fmt(r.nettoMaand)}`, `Netto/jaar: ${fmt(r.nettoJaar)}`,
      `Effectief tarief: ${r.effectiveRate}%`, `Berekend via looncheck.nexio.tools`,
    ].join("\n"),
  },
  en: {
    title: "Gross → Net", subtitle: "in one click.",
    sub: "Calculate your net salary including holiday pay, pension, travel and more. For employees and freelancers.",
    iAmA: "I am a", employee: "👔 Employee", zzp: "💼 Freelancer / Self-employed",
    taxYear: "Tax year",
    calcDirection: "Calculation",
    directionBrutoNetto: "Gross → Net", directionNettoBruto: "Net → Gross",
    grossSalary: "Gross salary", zzpProfit: "Annual profit (before deductions)",
    netSalaryInput: "Desired net salary",
    perYear: "Per year", perMonth: "Per month",
    hoursWeekLabel: "Work week & FTE",
    extras: "Include extras",
    holidayPay: "Holiday pay (8%)", thirteenth: "13th month bonus", ruling30: "30% ruling",
    loonheffingskorting: "Tax credit (loonheffingskorting)",
    loonheffingskortingInfo: "The tax credit reduces your income tax. You may only apply this at one employer at a time. Turn it off for a second job or benefit.",
    ruling30Info: "30% of gross salary is tax-free as expense allowance. Only for expats with a valid ruling.",
    advancedToggle: "Pension, travel & company car",
    pensionLabel: "Employee pension contribution", pensionSuffix: "% of gross", pensionHint: "Average 4-8% in NL",
    travelLabel: "Travel allowance", kmLabel: "One-way distance", kmHint: "Home → work",
    daysLabel: "Working days/year", daysSuffix: "days", daysHint: "Max 214 with 26 holiday days",
    taxFreeKm: "Tax-free rate", bothWays: "both ways",
    leaseLabel: "Company car (bijtelling)", catalogValue: "List price", catalogHint: "Car catalogue price",
    electric: "⚡ Electric", other: "⛽ Other",
    hourlyLabel: "Hourly rate insight", hourlyRate: "Hourly rate", hourlyRateHint: "Your invoice rate",
    hoursPerWeek: "Hours per week", hoursSuffix: "hrs", hoursHint: "Billable hours",
    netPerMonth: "Net per month", perYearLabel: "per year", effectiveRate: "Effective rate",
    netIncome: "Net income", incomeTax: "Income tax", zvwLabel: "Health ins. contribution", pension: "Pension contribution",
    perDay: "Per day", perDayHint: (d) => `based on ${d} working days`,
    perHour: "Per hour", perHourHint: (h) => `net (${h}-hour week)`,
    netHourly: "Net hourly rate", fromRate: (r) => `from your €${r} rate`,
    fteInsight: "FTE", fteInsightHint: (fte, h) => `${h} hrs/week · ${(fte*100).toFixed(0)}% full-time`,
    grossSalaryLabel: "Gross salary", grossProfit: "Gross profit",
    holidayPayLabel: "Holiday pay (8%)", thirteenthLabel: "13th month (one-time)",
    selfEmployedDeduction: "Self-employed deduction", mkbLabel: "SME profit exemption",
    taxableIncome: "Taxable income", pensionDeduction: "Pension contribution",
    leaseBijtelling: "Company car addition", grossTax: "Income tax (gross)",
    generalCredit: "General tax credit", employmentCredit: "Employment tax credit",
    loonheffingskortingLabel: "Tax credit applied",
    netTax: "Income tax (net)", travelAllowance: "Travel allowance",
    holidayOnce: "Holiday pay (one-time)",
    reversedBruto: "Required gross salary",
    reversedNote: "This is the gross salary that results in your entered net salary.",
    zzpNote: "⚠️ Note: As a freelancer you also pay disability insurance (AOV) yourself. Budget ~€150–300/month. Pension savings are also your own responsibility.",
    compareToggle: "Compare with", compareLabel: "Item", compareDiff: "Difference",
    compareRows: ["Net/month", "Net/year", "Tax", "Health ins.", "Eff. rate"],
    copyBtn: "📋 Copy calculation", copied: "✓ Copied",
    disclaimer: "Indicative calculation based on official {year} rates (Dutch Tax Authority). Does not account for mortgage deductions, allowances or other personal circumstances. Consult a tax advisor for an exact calculation.",
    footerBy: "Looncheck by", footerRates: "Rates based on Belastingdienst", adLabel: "Advertisement",
    copyText: (year, mode, r, fmt) => [
      `Looncheck calculation ${year}`,
      `Mode: ${mode === "employee" ? "Employee" : "Freelancer"}`,
      `Gross: ${fmt(mode === "zzp" ? r.winst : r.brutoJaar)}`,
      `Net/month: ${fmt(r.nettoMaand)}`, `Net/year: ${fmt(r.nettoJaar)}`,
      `Effective rate: ${r.effectiveRate}%`, `Calculated via looncheck.nexio.tools`,
    ].join("\n"),
  },
};

// ════════════════════════════════════════════════════════════════════════════
// CALCULATION ENGINE
// ════════════════════════════════════════════════════════════════════════════
function calcArbeidskorting(inkomen, cfg) {
  const ak = cfg.arbeidskorting;
  if (inkomen <= 0) return 0;
  let k = inkomen <= ak.buildUpEnd ? inkomen * ak.buildUpRate
        : inkomen <= ak.phaseOutStart ? ak.max
        : inkomen >= ak.zeroAt ? 0
        : ak.max - (inkomen - ak.phaseOutStart) * ak.phaseOutRate;
  return Math.max(0, Math.min(ak.max, k));
}
function calcAHK(inkomen, cfg) {
  const a = cfg.ahk;
  if (inkomen <= a.phaseOutStart) return a.max;
  if (inkomen >= a.zeroAt) return 0;
  return Math.max(0, a.max - (inkomen - a.phaseOutStart) * a.phaseOutRate);
}
function calcBracketTax(taxable, cfg) {
  let tax = 0, prev = 0;
  for (const b of cfg.brackets) {
    if (taxable <= prev) break;
    tax += (Math.min(taxable, b.limit) - prev) * b.rate;
    prev = b.limit;
    if (b.limit === Infinity) break;
  }
  return tax;
}
function calcTax(taxable, cfg, applyLoonheffingskorting = true) {
  const bracketTax = calcBracketTax(taxable, cfg);
  const ahk = applyLoonheffingskorting ? calcAHK(taxable, cfg) : 0;
  const ak = applyLoonheffingskorting ? calcArbeidskorting(taxable, cfg) : 0;
  return {
    bracketTax: Math.round(bracketTax),
    ahk: Math.round(ahk),
    arbeidskorting: Math.round(ak),
    inkomstenbelasting: Math.max(0, Math.round(bracketTax - ahk - ak)),
  };
}

function calcEmployee({ brutoJaar, year, includeVakantie, include13th, pensioenpremie, reiskostenKm, reiskostenDagen, leaseWaarde, leaseType, ruling30, hoursPerWeek = 40, applyLoonheffingskorting = true }) {
  const cfg = TAX_CONFIG[parseInt(year)];
  const fte = hoursPerWeek / 40;

  // brutoJaar is the ACTUAL salary for this FTE (already scaled)
  // e.g. if full-time is €60k and FTE=0.5, brutoJaar should be €30k
  const brutoTaxable = brutoJaar * (ruling30 ? 0.70 : 1.0);
  const vakantiegeld = includeVakantie ? brutoJaar * 0.08 : 0;
  const dertiendeMaand = include13th ? brutoJaar / 12 : 0;
  const pensioenbedrag = Math.round(brutoJaar * (pensioenpremie / 100));
  const bijtelling = leaseWaarde > 0 ? Math.round(leaseWaarde * (leaseType === "elektrisch" ? cfg.lease_bijtelling_elektrisch : cfg.lease_bijtelling_overig)) : 0;

  const totalBruto = brutoTaxable + vakantiegeld + dertiendeMaand;
  const taxableIncome = Math.max(0, totalBruto - pensioenbedrag + bijtelling);

  const tax = calcTax(taxableIncome, cfg, applyLoonheffingskorting);
  const zvw = Math.round(Math.min(totalBruto, cfg.zvwMax) * cfg.zvwEmployee);

  const maxDays = Math.round(cfg.reiskosten_max_days * fte);
  const effectiveDays = Math.min(reiskostenDagen, maxDays);
  const reiskostenJaar = Math.round(reiskostenKm * 2 * effectiveDays * cfg.reiskosten_per_km);

  const nettoJaar = totalBruto - tax.inkomstenbelasting - zvw - pensioenbedrag + reiskostenJaar;
  const annualHours = hoursPerWeek * 52;
  const workingDays = Math.round(cfg.reiskosten_max_days * fte);

  return {
    brutoJaar,
    totalBruto,
    vakantiegeld,
    dertiendeMaand,
    pensioenbedrag,
    bijtelling,
    reiskostenJaar,
    ...tax,
    zvw,
    nettoJaar: Math.round(nettoJaar),
    nettoMaand: Math.round(nettoJaar / 12),
    nettoPerUur: annualHours > 0 ? Math.round((nettoJaar / annualHours) * 100) / 100 : 0,
    nettoPerDag: workingDays > 0 ? Math.round(nettoJaar / workingDays) : 0,
    fte,
    workingDays,
    effectiveRate: totalBruto > 0 ? ((tax.inkomstenbelasting + zvw) / totalBruto * 100).toFixed(1) : 0,
  };
}

function calcZZP({ winst, year, uurtarief, uurPerWeek, applyLoonheffingskorting = true }) {
  const cfg = TAX_CONFIG[parseInt(year)];
  const naZelfstandigen = Math.max(0, winst - cfg.zelfstandigenaftrek);
  const mkbBedrag = Math.round(naZelfstandigen * cfg.mkbVrijstelling);
  const taxable = Math.max(0, naZelfstandigen - mkbBedrag);
  const tax = calcTax(taxable, cfg, applyLoonheffingskorting);
  const zvw = Math.round(Math.min(taxable, cfg.zvwMax) * cfg.zvwZZP);
  const nettoJaar = winst - tax.inkomstenbelasting - zvw;
  const annualHours = (uurPerWeek || 40) * 52;
  return {
    winst, zelfstandigenaftrek: cfg.zelfstandigenaftrek, mkbVrijstelling: mkbBedrag, taxable: Math.round(taxable),
    ...tax, zvw,
    nettoJaar: Math.round(nettoJaar), nettoMaand: Math.round(nettoJaar / 12),
    nettoPerUur: uurtarief > 0 ? Math.round((nettoJaar / annualHours) * 100) / 100 : 0,
    effectiveRate: winst > 0 ? ((tax.inkomstenbelasting + zvw) / winst * 100).toFixed(1) : 0,
  };
}

// Reverse calculation: binary search for actual (FTE-adjusted) bruto that yields target netto
function calcBrutoFromNetto({ nettoJaarTarget, year, includeVakantie, include13th, pensioenpremie, reiskostenKm, reiskostenDagen, leaseWaarde, leaseType, ruling30, hoursPerWeek, applyLoonheffingskorting }) {
  // Search for the actual bruto (already FTE-adjusted) that produces the target netto
  let lo = nettoJaarTarget * 0.5;
  let hi = nettoJaarTarget * 5;
  for (let i = 0; i < 120; i++) {
    const mid = (lo + hi) / 2;
    const res = calcEmployee({ brutoJaar: mid, year, includeVakantie, include13th, pensioenpremie, reiskostenKm, reiskostenDagen, leaseWaarde, leaseType, ruling30, hoursPerWeek, applyLoonheffingskorting });
    if (res.nettoJaar < nettoJaarTarget) lo = mid; else hi = mid;
    if (Math.abs(hi - lo) < 0.5) break;
  }
  return calcEmployee({ brutoJaar: (lo + hi) / 2, year, includeVakantie, include13th, pensioenpremie, reiskostenKm, reiskostenDagen, leaseWaarde, leaseType, ruling30, hoursPerWeek, applyLoonheffingskorting });
}

// ════════════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════════════
function fmt(n) { return "€" + Math.round(n).toLocaleString("nl-NL"); }

function Bar({ label, value, total, color, sublabel }) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <div><span style={{ fontSize: 12, color: "#666" }}>{label}</span>{sublabel && <span style={{ fontSize: 10, color: "#bbb", marginLeft: 6 }}>{sublabel}</span>}</div>
        <span style={{ fontSize: 12, color: "#1a1a1a", fontWeight: 600 }}>{fmt(value)}</span>
      </div>
      <div style={{ height: 6, background: "#f0ede8", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function Toggle({ label, on, onClick, info }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <label className={`toggle${on ? " on" : ""}`} onClick={onClick} style={{ cursor: "pointer" }}>
        <span className="toggle-box">{on ? "✓" : ""}</span>
        {label}
        {info && (
          <span
            onClick={e => { e.stopPropagation(); setShowInfo(!showInfo); }}
            style={{ marginLeft: 4, width: 14, height: 14, borderRadius: "50%", background: on ? "rgba(255,255,255,0.3)" : "#e8e4de", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, cursor: "help", color: on ? "#fff" : "#888", flexShrink: 0 }}
          >i</span>
        )}
      </label>
      {showInfo && info && (
        <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 10, background: "#fff", border: "1px solid #e8e4de", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#444", lineHeight: 1.6, maxWidth: 260, marginTop: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
          {info}
          <button onClick={() => setShowInfo(false)} style={{ display: "block", marginTop: 6, background: "transparent", border: "none", color: "#aaa", fontSize: 11, cursor: "pointer", padding: 0 }}>✕ Sluiten</button>
        </div>
      )}
    </div>
  );
}

function NumInput({ label, value, onChange, suffix, min = 0, max, step = 1, hint }) {
  const [raw, setRaw] = useState(String(value));

  useEffect(() => {
    // Sync if parent value changes externally
    if (parseFloat(raw) !== value && raw !== "") setRaw(String(value));
  }, [value]);

  const handleChange = (e) => {
    const v = e.target.value;
    setRaw(v);
    const parsed = parseFloat(v);
    if (!isNaN(parsed)) onChange(parsed);
    else if (v === "" || v === "-") onChange(0);
  };

  const handleBlur = () => {
    const parsed = parseFloat(raw);
    if (isNaN(parsed) || raw === "") { setRaw("0"); onChange(0); }
    else { setRaw(String(parsed)); }
  };

  return (
    <div style={{ background: "#f9f8f6", borderRadius: 10, padding: "10px 14px", flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 11, color: "#aaa", fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input
          type="text" inputMode="numeric" value={raw}
          onChange={handleChange} onBlur={handleBlur}
          style={{ background: "transparent", border: "none", outline: "none", fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "#1a1a1a", width: "100%", padding: 0 }}
        />
        {suffix && <span style={{ fontSize: 12, color: "#aaa", whiteSpace: "nowrap" }}>{suffix}</span>}
      </div>
      {hint && <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [lang, setLang] = useState("nl");
  const t = T[lang];

  const [mode, setMode] = useState("employee");
  const [direction, setDirection] = useState("bruto");
  const [year, setYear] = useState("2026");
  const [bruto, setBruto] = useState("5000");
  const [nettoInput, setNettoInput] = useState("3500");
  const [inputMode, setInputMode] = useState("maand");
  const [hoursPerWeek, setHoursPerWeek] = useState(40);

  const [includeVakantie, setIncludeVakantie] = useState(true);
  const [include13th, setInclude13th] = useState(false);
  const [pensioenpremie, setPensioenpremie] = useState(0);
  const [reiskostenKm, setReiskostenKm] = useState(0);
  const [reiskostenDagen, setReiskostenDagen] = useState(214);
  const [leaseWaarde, setLeaseWaarde] = useState(0);
  const [leaseType, setLeaseType] = useState("overig");
  const [ruling30, setRuling30] = useState(false);
  const [applyLoonheffingskorting, setApplyLoonheffingskorting] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [uurtarief, setUurtarief] = useState(0);
  const [uurPerWeek, setUurPerWeek] = useState(40);

  const [result, setResult] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [copied, setCopied] = useState(false);

  const fte = hoursPerWeek / 40;
  const workingDaysScaled = result?.workingDays || Math.round(214 * fte);
  const cfg = TAX_CONFIG[parseInt(year)];
  const otherYear = year === "2026" ? "2025" : "2026";

  const employeeParams = { year, includeVakantie, include13th, pensioenpremie, reiskostenKm, reiskostenDagen, leaseWaarde, leaseType, ruling30, hoursPerWeek, applyLoonheffingskorting };

  const getJaarBruto = () => {
    const val = parseFloat(bruto.replace(/\./g, "").replace(",", ".")) || 0;
    return inputMode === "maand" ? val * 12 : val;
  };
  const getNettoTarget = () => {
    const val = parseFloat(nettoInput.replace(/\./g, "").replace(",", ".")) || 0;
    return inputMode === "maand" ? val * 12 : val;
  };

  useEffect(() => {
    if (mode === "zzp") {
      const winst = getJaarBruto();
      if (winst <= 0) { setResult(null); return; }
      setResult(calcZZP({ winst, year, uurtarief, uurPerWeek, applyLoonheffingskorting }));
      return;
    }
    if (direction === "bruto") {
      const jaarBruto = getJaarBruto();
      if (jaarBruto <= 0) { setResult(null); return; }
      // User enters full-time equivalent bruto -- scale by FTE for actual salary
      setResult(calcEmployee({ brutoJaar: jaarBruto * fte, ...employeeParams }));
    } else {
      const nettoTarget = getNettoTarget();
      if (nettoTarget <= 0) { setResult(null); return; }
      setResult(calcBrutoFromNetto({ nettoJaarTarget: nettoTarget, ...employeeParams }));
    }
  }, [mode, direction, year, bruto, nettoInput, inputMode, hoursPerWeek, includeVakantie, include13th, pensioenpremie, reiskostenKm, reiskostenDagen, leaseWaarde, leaseType, ruling30, applyLoonheffingskorting, uurtarief, uurPerWeek]);

  useEffect(() => {
    if (!showCompare || !result) return;
    if (mode === "zzp") {
      setCompareResult(calcZZP({ winst: result.winst, year: otherYear, uurtarief, uurPerWeek, applyLoonheffingskorting }));
    } else {
      setCompareResult(calcEmployee({ brutoJaar: result.brutoJaar, ...{ ...employeeParams, year: otherYear } }));
    }
  }, [showCompare, result, otherYear]);

  const displayBruto = bruto ? parseInt(bruto.replace(/\./g, "")).toLocaleString("nl-NL") : "";
  const displayNetto = nettoInput ? parseInt(nettoInput.replace(/\./g, "")).toLocaleString("nl-NL") : "";

  return (
    <div style={{ minHeight: "100vh", background: "#fafaf8", fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
        .wrap { max-width: 680px; margin: 0 auto; padding: 0 20px 80px; }
        .header { padding: 44px 0 28px; animation: up 0.5s ease both; }
        .logo { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 800; color: #1a1a1a; letter-spacing: 0.04em; display: inline-flex; align-items: center; gap: 6px; }
        .logo-dot { width: 8px; height: 8px; border-radius: 2px; background: #1a1a1a; }
        h1 { font-family: 'Syne', sans-serif; font-size: clamp(26px, 5vw, 40px); font-weight: 800; line-height: 1.1; letter-spacing: -0.03em; margin-bottom: 8px; }
        h1 span { color: #888; }
        .sub { color: #999; font-size: 14px; font-weight: 300; line-height: 1.6; }
        .card { background: #fff; border: 1px solid #ebebeb; border-radius: 16px; padding: 22px; margin-bottom: 10px; box-shadow: 0 1px 8px rgba(0,0,0,0.04); animation: up 0.5s ease both; }
        .seg { display: flex; gap: 3px; background: #f5f3f0; border-radius: 10px; padding: 3px; }
        .seg-btn { flex: 1; padding: 9px 10px; background: transparent; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.18s; color: #aaa; white-space: nowrap; }
        .seg-btn.active { background: #fff; color: #1a1a1a; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .field-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #bbb; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
        .input-wrap { position: relative; display: flex; align-items: center; }
        .euro-sign { position: absolute; left: 14px; color: #aaa; font-size: 15px; pointer-events: none; }
        .main-input { width: 100%; background: #f9f8f6; border: 1px solid #ebebeb; border-radius: 10px; padding: 13px 14px 13px 30px; font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: #1a1a1a; outline: none; transition: border-color 0.2s; }
        .main-input:focus { border-color: #1a1a1a; background: #fff; }
        .main-input::placeholder { color: #ccc; }
        .main-input.reverse { border-color: #ebebeb; background: #f9f8f6; }
        .main-input.reverse:focus { border-color: #1a1a1a; background: #fff; }
        .toggle-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .toggle { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 9px 12px; border-radius: 8px; border: 1px solid #ebebeb; background: #fff; font-size: 13px; color: #666; transition: all 0.18s; user-select: none; }
        .toggle.on { border-color: #1a1a1a; background: #1a1a1a; color: #fff; }
        .toggle-box { width: 15px; height: 15px; border-radius: 4px; border: 1.5px solid currentColor; display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; }
        .expand-btn { background: transparent; border: none; color: #aaa; font-family: 'DM Sans', sans-serif; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 0; margin-top: 12px; }
        .expand-btn:hover { color: #1a1a1a; }
        .num-inputs-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
        .result-header { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
        .netto-label { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #bbb; margin-bottom: 4px; }
        .netto-amount { font-family: 'Syne', sans-serif; font-size: clamp(28px, 6vw, 42px); font-weight: 800; color: #1a1a1a; letter-spacing: -0.03em; line-height: 1; }
        .netto-sub { font-size: 13px; color: #999; font-weight: 300; margin-top: 4px; }
        .effective-rate { text-align: right; }
        .rate-number { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #1a1a1a; }
        .rate-label { font-size: 11px; color: #bbb; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .divider { border: none; border-top: 1px solid #f0ede8; margin: 16px 0; }
        .breakdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px; }
        .breakdown-item { background: #f9f8f6; border-radius: 10px; padding: 11px 13px; }
        .breakdown-item.full { grid-column: 1 / -1; background: #f9f8f6; border-radius: 10px; padding: 11px 16px; display: flex; justify-content: space-between; align-items: center; }
        .bi-label { font-size: 11px; color: #aaa; font-weight: 500; margin-bottom: 3px; }
        .bi-value { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #1a1a1a; }
        .bi-value.red { color: #ef4444; }
        .bi-value.green { color: #22c55e; }
        .insight-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px; }
        .insight-chip { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 10px 14px; flex: 1; min-width: 110px; }
        .insight-chip.green { background: #f0fdf4; border-color: #bbf7d0; }
        .insight-chip.amber { background: #fffbeb; border-color: #fde68a; }
        .insight-chip.dark { background: #f9f8f6; border-color: #e0ddd8; }
        .ic-label { font-size: 10px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
        .ic-value { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #1a1a1a; }
        .ic-sub { font-size: 10px; color: #9ca3af; margin-top: 1px; }
        .reverse-banner { background: #f9f8f6; border: 1px solid #ebebeb; border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; }
        .reverse-bruto { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #1a1a1a; }
        .compare-block { margin-top: 10px; background: #f9f8f6; border-radius: 12px; padding: 14px 16px; }
        .compare-row { display: grid; grid-template-columns: 1.4fr 1fr 1fr 0.8fr; align-items: center; padding: 7px 0; border-bottom: 1px solid #ebebeb; gap: 4px; }
        .compare-row:last-child { border-bottom: none; }
        .compare-val { font-weight: 700; color: #1a1a1a; font-family: 'Syne', sans-serif; font-size: 12px; text-align: right; }
        .compare-diff { font-size: 11px; font-weight: 700; text-align: right; }
        .compare-diff.pos { color: #22c55e; }
        .compare-diff.neg { color: #ef4444; }
        .zzp-note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px 14px; margin-top: 10px; font-size: 12px; color: #92400e; line-height: 1.6; }
        .copy-btn { display: flex; align-items: center; gap: 6px; background: transparent; border: 1px solid #ebebeb; color: #aaa; border-radius: 8px; padding: 8px 14px; font-family: 'DM Sans', sans-serif; font-size: 12px; cursor: pointer; transition: all 0.2s; margin-top: 14px; }
        .copy-btn:hover { border-color: #1a1a1a; color: #1a1a1a; }
        .copy-btn.copied { border-color: #22c55e; color: #22c55e; }
        .ad-placeholder { background: #f9f8f6; border: 1px dashed #e0ddd8; border-radius: 12px; padding: 20px; text-align: center; color: #ccc; font-size: 11px; min-height: 90px; display: flex; align-items: center; justify-content: center; }
        .disclaimer { background: #f9f8f6; border-radius: 10px; padding: 12px 14px; margin-top: 12px; font-size: 11px; color: #bbb; line-height: 1.6; }
        .footer { text-align: center; padding-top: 32px; color: #ccc; font-size: 11px; }
        .footer a { color: #aaa; text-decoration: none; }
        .footer a:hover { color: #1a1a1a; }
        @keyframes up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 480px) { .breakdown-grid { grid-template-columns: 1fr; } .toggle-row { flex-direction: column; } .insight-row { flex-direction: column; } }
      `}</style>

      <div className="wrap">

        {/* Header */}
        <div className="header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div className="logo"><span className="logo-dot" />Looncheck</div>
            <div className="seg" style={{ width: "auto", padding: 2, gap: 2 }}>
              <button className={`seg-btn${lang === "nl" ? " active" : ""}`} style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setLang("nl")}>🇳🇱 NL</button>
              <button className={`seg-btn${lang === "en" ? " active" : ""}`} style={{ padding: "5px 12px", fontSize: 12 }} onClick={() => setLang("en")}>🇬🇧 EN</button>
            </div>
          </div>
          <h1>{t.title}<br /><span>{t.subtitle}</span></h1>
          <p className="sub">{t.sub}</p>
        </div>

        {/* Ad top */}
        <div className="ad-placeholder" style={{ marginBottom: 10 }}>{t.adLabel}</div>

        {/* Mode + Year */}
        <div className="card" style={{ animationDelay: "0.05s" }}>
          <div className="field-label" style={{ marginBottom: 10 }}>{t.iAmA}</div>
          <div className="seg" style={{ marginBottom: 14 }}>
            <button className={`seg-btn${mode === "employee" ? " active" : ""}`} onClick={() => { setMode("employee"); setInputMode("maand"); }}>{t.employee}</button>
            <button className={`seg-btn${mode === "zzp" ? " active" : ""}`} onClick={() => { setMode("zzp"); setInputMode("maand"); }}>{t.zzp}</button>
          </div>
          <div className="field-label">{t.taxYear}</div>
          <div className="seg">
            <button className={`seg-btn${year === "2025" ? " active" : ""}`} onClick={() => setYear("2025")}>2025</button>
            <button className={`seg-btn${year === "2026" ? " active" : ""}`} onClick={() => setYear("2026")}>2026</button>
          </div>
        </div>

        {/* Salary input */}
        <div className="card" style={{ animationDelay: "0.1s" }}>
          {mode === "employee" && (
            <>
              <div className="field-label" style={{ marginBottom: 8 }}>{t.calcDirection}</div>
              <div className="seg" style={{ marginBottom: 14 }}>
                <button className={`seg-btn${direction === "bruto" ? " active" : ""}`} onClick={() => { setDirection("bruto"); setInputMode("maand"); }}>{t.directionBrutoNetto}</button>
                <button className={`seg-btn${direction === "netto" ? " active" : ""}`} onClick={() => { setDirection("netto"); setInputMode("maand"); }}>{t.directionNettoBruto}</button>
              </div>
            </>
          )}

          <div className="field-label">
            <span>{mode === "zzp" ? t.zzpProfit : direction === "netto" ? t.netSalaryInput : t.grossSalary}</span>
            <div className="seg" style={{ padding: 2, gap: 2 }}>
              <button className={`seg-btn${inputMode === "jaar" ? " active" : ""}`} style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => setInputMode("jaar")}>{t.perYear}</button>
              <button className={`seg-btn${inputMode === "maand" ? " active" : ""}`} style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => setInputMode("maand")}>{t.perMonth}</button>
            </div>
          </div>

          {direction === "netto" && mode === "employee" ? (
            <div className="input-wrap">
              <span className="euro-sign">€</span>
              <input className="main-input reverse" type="text" inputMode="numeric" value={displayNetto}
                onChange={e => setNettoInput(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder={inputMode === "jaar" ? "42.000" : "3.500"} />
            </div>
          ) : (
            <div className="input-wrap">
              <span className="euro-sign">€</span>
              <input className="main-input" type="text" inputMode="numeric" value={displayBruto}
                onChange={e => setBruto(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder={inputMode === "jaar" ? "60.000" : "5.000"} />
            </div>
          )}

          {/* Hours per week + FTE -- employee only */}
          {mode === "employee" && (
            <div style={{ marginTop: 14 }}>
              <div className="field-label" style={{ marginBottom: 8 }}>{t.hoursWeekLabel}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <input type="range" min={4} max={40} step={4} value={hoursPerWeek}
                    onChange={e => setHoursPerWeek(parseInt(e.target.value))}
                    style={{ width: "100%", accentColor: "#1a1a1a" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bbb", marginTop: 2 }}>
                    <span>4u</span><span>8u</span><span>16u</span><span>24u</span><span>32u</span><span>40u</span>
                  </div>
                </div>
                <div style={{ background: "#f9f8f6", border: "1px solid #ebebeb", borderRadius: 10, padding: "8px 14px", textAlign: "center", minWidth: 70 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: "#1a1a1a" }}>{hoursPerWeek}u</div>
                  <div style={{ fontSize: 11, color: "#aaa", fontWeight: 500 }}>{(fte * 100).toFixed(0)}% FTE</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Employee extras */}
        {mode === "employee" && (
          <div className="card" style={{ animationDelay: "0.15s" }}>
            <div className="field-label" style={{ marginBottom: 10 }}>{t.extras}</div>
            <div className="toggle-row">
              <Toggle label={t.holidayPay} on={includeVakantie} onClick={() => setIncludeVakantie(!includeVakantie)} />
              <Toggle label={t.thirteenth} on={include13th} onClick={() => setInclude13th(!include13th)} />
              <Toggle label={t.ruling30} on={ruling30} onClick={() => setRuling30(!ruling30)} info={t.ruling30Info} />
              <Toggle label={t.loonheffingskorting} on={applyLoonheffingskorting} onClick={() => setApplyLoonheffingskorting(!applyLoonheffingskorting)} info={t.loonheffingskortingInfo} />
            </div>

            <button className="expand-btn" onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? "▲" : "▼"} {t.advancedToggle}
            </button>

            {showAdvanced && (
              <>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: "#bbb", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{t.pensionLabel}</div>
                  <div className="num-inputs-row">
                    <NumInput label="%" value={pensioenpremie} onChange={setPensioenpremie} suffix={t.pensionSuffix} min={0} max={20} step={0.5} hint={t.pensionHint} />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: "#bbb", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{t.travelLabel}</div>
                  <div className="num-inputs-row">
                    <NumInput label={t.kmLabel} value={reiskostenKm} onChange={setReiskostenKm} suffix="km" min={0} max={200} hint={t.kmHint} />
                    <NumInput label={t.daysLabel} value={reiskostenDagen} onChange={setReiskostenDagen} suffix={t.daysSuffix} min={0} max={260} hint={t.daysHint} />
                  </div>
                  <div style={{ fontSize: 11, color: "#bbb", marginTop: 6 }}>
                    {t.taxFreeKm}: €{cfg.reiskosten_per_km.toFixed(2)}/km ({t.bothWays})
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: "#bbb", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{t.leaseLabel}</div>
                  <div className="num-inputs-row">
                    <NumInput label={t.catalogValue} value={leaseWaarde} onChange={setLeaseWaarde} suffix="€" min={0} step={1000} hint={t.catalogHint} />
                  </div>
                  {leaseWaarde > 0 && (
                    <div className="seg" style={{ marginTop: 8 }}>
                      <button className={`seg-btn${leaseType === "elektrisch" ? " active" : ""}`} onClick={() => setLeaseType("elektrisch")}>{t.electric} ({(cfg.lease_bijtelling_elektrisch * 100).toFixed(0)}%)</button>
                      <button className={`seg-btn${leaseType === "overig" ? " active" : ""}`} onClick={() => setLeaseType("overig")}>{t.other} ({(cfg.lease_bijtelling_overig * 100).toFixed(0)}%)</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ZZP extras */}
        {mode === "zzp" && (
          <div className="card" style={{ animationDelay: "0.15s" }}>
            <div className="field-label" style={{ marginBottom: 10 }}>{t.extras}</div>
            <div className="toggle-row" style={{ marginBottom: 14 }}>
              <Toggle
                label={t.loonheffingskorting}
                on={applyLoonheffingskorting}
                onClick={() => setApplyLoonheffingskorting(!applyLoonheffingskorting)}
                info={t.loonheffingskortingInfo}
              />
            </div>
            <div className="field-label" style={{ marginBottom: 10 }}>{t.hourlyLabel}</div>
            <div className="num-inputs-row">
              <NumInput label={t.hourlyRate} value={uurtarief} onChange={setUurtarief} suffix="€/hr" min={0} hint={t.hourlyRateHint} />
              <NumInput label={t.hoursPerWeek} value={uurPerWeek} onChange={setUurPerWeek} suffix={t.hoursSuffix} min={1} max={60} hint={t.hoursHint} />
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="card" style={{ animationDelay: "0.2s" }}>

            {/* Result header -- shows the KEY output only */}
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, padding: "20px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                {direction === "netto" && mode === "employee"
                  ? (lang === "nl" ? "Benodigde brutosalaris" : "Required gross salary")
                  : t.netPerMonth}
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px, 6vw, 44px)", fontWeight: 800, color: "#0369a1", lineHeight: 1, letterSpacing: "-0.02em" }}>
                {direction === "netto" && mode === "employee"
                  ? fmt(result.brutoJaar / 12)
                  : fmt(result.nettoMaand)}
              </div>
              <div style={{ fontSize: 14, color: "#7ab8d9", marginTop: 8, fontWeight: 400 }}>
                {direction === "netto" && mode === "employee"
                  ? `${fmt(result.brutoJaar)} / ${lang === "nl" ? "jaar" : "year"}`
                  : `${fmt(result.nettoJaar)} / ${lang === "nl" ? "jaar" : "year"}`}
              </div>
              {/* FT equivalent -- only shown in netto->bruto when FTE < 1 */}
              {direction === "netto" && mode === "employee" && fte < 1 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #bae6fd" }}>
                  <div style={{ fontSize: 11, color: "#7ab8d9", marginBottom: 3 }}>
                    {lang === "nl" ? `Fulltime equivalent (40u/week)` : `Full-time equivalent (40hrs/week)`}
                  </div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#0369a1" }}>
                    {fmt((result.brutoJaar / 12) / fte)} / {lang === "nl" ? "maand" : "month"}
                    <span style={{ fontSize: 13, fontWeight: 400, color: "#7ab8d9", marginLeft: 8 }}>
                      · {fmt(result.brutoJaar / fte)} / {lang === "nl" ? "jaar" : "year"}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "#7ab8d9", marginTop: 3 }}>
                    {lang === "nl"
                      ? `Functiesalaris bij ${(fte * 100).toFixed(0)}% FTE (${hoursPerWeek}u/week)`
                      : `Job salary at ${(fte * 100).toFixed(0)}% FTE (${hoursPerWeek}hrs/week)`}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #bae6fd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#7ab8d9" }}>{t.effectiveRate}</span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: "#0369a1" }}>{result.effectiveRate}%</span>
              </div>
            </div>

            <div className="divider" />

            <Bar label={t.netIncome} value={result.nettoJaar} total={mode === "zzp" ? result.winst : result.totalBruto} color="#22c55e" />
            <Bar label={t.incomeTax} value={result.inkomstenbelasting} total={mode === "zzp" ? result.winst : result.totalBruto} color="#ef4444" />
            <Bar label={t.zvwLabel} value={result.zvw} total={mode === "zzp" ? result.winst : result.totalBruto} color="#f59e0b" sublabel={year === "2026" ? "4,85%" : "5,26%"} />
            {result.pensioenbedrag > 0 && <Bar label={t.pension} value={result.pensioenbedrag} total={result.totalBruto} color="#8b5cf6" />}

            {/* Key insights */}
            <div className="insight-row">
              <div className="insight-chip">
                <div className="ic-label">{t.perDay}</div>
                <div className="ic-value">{fmt(result.nettoPerDag)}</div>
                <div className="ic-sub">{t.perDayHint(workingDaysScaled)}</div>
              </div>
              <div className="insight-chip green">
                <div className="ic-label">{t.perHour}</div>
                <div className="ic-value">€{result.nettoPerUur > 0 ? result.nettoPerUur.toFixed(2) : (result.nettoJaar / (hoursPerWeek * 52)).toFixed(2)}</div>
                <div className="ic-sub">{t.perHourHint(hoursPerWeek)}</div>
              </div>
              {mode === "employee" && (
                <div className="insight-chip dark">
                  <div className="ic-label">{t.fteInsight}</div>
                  <div className="ic-value">{fte.toFixed(2)}</div>
                  <div className="ic-sub">{t.fteInsightHint(fte, hoursPerWeek)}</div>
                </div>
              )}
              {mode === "zzp" && uurtarief > 0 && (
                <div className="insight-chip amber">
                  <div className="ic-label">{t.netHourly}</div>
                  <div className="ic-value">€{(result.nettoJaar / (uurPerWeek * 52)).toFixed(2)}</div>
                  <div className="ic-sub">{t.fromRate(uurtarief)}</div>
                </div>
              )}
            </div>

            <div className="divider" />

            {/* Breakdown grid -- NO vakantiegeld/13e maand here, shown separately below */}
            <div className="breakdown-grid">
              <div className="breakdown-item"><div className="bi-label">{mode === "zzp" ? t.grossProfit : t.grossSalaryLabel}</div><div className="bi-value">{fmt(mode === "zzp" ? result.winst : result.brutoJaar)}</div></div>
              {mode === "zzp" && <>
                <div className="breakdown-item"><div className="bi-label">{t.selfEmployedDeduction}</div><div className="bi-value green">-{fmt(result.zelfstandigenaftrek)}</div></div>
                <div className="breakdown-item"><div className="bi-label">{t.mkbLabel}</div><div className="bi-value green">-{fmt(result.mkbVrijstelling)}</div></div>
                <div className="breakdown-item"><div className="bi-label">{t.taxableIncome}</div><div className="bi-value">{fmt(result.taxable)}</div></div>
              </>}
              {mode === "employee" && result.vakantiegeld > 0 && <div className="breakdown-item"><div className="bi-label">{t.holidayOnce}</div><div className="bi-value">{fmt(result.vakantiegeld)}</div></div>}
              {mode === "employee" && result.dertiendeMaand > 0 && <div className="breakdown-item"><div className="bi-label">{t.thirteenthLabel}</div><div className="bi-value">{fmt(result.dertiendeMaand)}</div></div>}
              {result.pensioenbedrag > 0 && <div className="breakdown-item"><div className="bi-label">{t.pensionDeduction}</div><div className="bi-value red">-{fmt(result.pensioenbedrag)}</div></div>}
              {result.bijtelling > 0 && <div className="breakdown-item"><div className="bi-label">{t.leaseBijtelling}</div><div className="bi-value red">+{fmt(result.bijtelling)}</div></div>}
              <div className="breakdown-item"><div className="bi-label">{t.grossTax}</div><div className="bi-value red">-{fmt(result.bracketTax)}</div></div>
              {result.ahk > 0 && <div className="breakdown-item"><div className="bi-label">{t.generalCredit}</div><div className="bi-value green">+{fmt(result.ahk)}</div></div>}
              {result.arbeidskorting > 0 && <div className="breakdown-item"><div className="bi-label">{t.employmentCredit}</div><div className="bi-value green">+{fmt(result.arbeidskorting)}</div></div>}
              {!applyLoonheffingskorting && (
                <div className="breakdown-item full" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                  <div className="bi-label" style={{ color: "#c2410c", marginBottom: 0 }}>{t.loonheffingskortingLabel}</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "#c2410c" }}>{lang === "nl" ? "Niet toegepast" : "Not applied"}</div>
                </div>
              )}
              <div className="breakdown-item"><div className="bi-label">{t.netTax}{result.inkomstenbelasting === 0 && <span style={{ marginLeft: 4, color: "#15803d", fontSize: 11, fontWeight: 700 }}>*</span>}</div><div className="bi-value red">-{fmt(result.inkomstenbelasting)}</div></div>
              <div className="breakdown-item"><div className="bi-label">{t.zvwLabel}</div><div className="bi-value red">-{fmt(result.zvw)}</div></div>
              {result.reiskostenJaar > 0 && <div className="breakdown-item"><div className="bi-label">{t.travelAllowance}</div><div className="bi-value green">+{fmt(result.reiskostenJaar)}</div></div>}
            </div>
            {result.inkomstenbelasting === 0 && (
              <div style={{ marginTop: 6, padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 12, color: "#15803d", lineHeight: 1.5 }}>
                * {lang === "nl"
                  ? "De heffingskortingen zijn hoger dan de verschuldigde belasting. Dit is correct voor lagere inkomens."
                  : "Tax credits exceed the tax owed. This is correct for lower incomes under Dutch tax law."}
              </div>
            )}

            {mode === "zzp" && <div className="zzp-note">{t.zzpNote}</div>}

            {/* Year comparison */}
            <div style={{ marginTop: 14 }}>
              <button className="expand-btn" onClick={() => setShowCompare(!showCompare)}>
                {showCompare ? "▲" : "▼"} {t.compareToggle} {otherYear}
              </button>
              {showCompare && compareResult && (
                <div className="compare-block">
                  <div className="compare-row" style={{ borderBottom: "2px solid #e0ddd8" }}>
                    <span style={{ fontSize: 11, color: "#aaa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.compareLabel}</span>
                    <span className="compare-val">{year}</span>
                    <span className="compare-val" style={{ color: "#aaa" }}>{otherYear}</span>
                    <span style={{ fontSize: 11, color: "#aaa", fontWeight: 600, textAlign: "right" }}>{t.compareDiff}</span>
                  </div>
                  {t.compareRows.map((label, i) => {
                    const rows = [
                      { a: result.nettoMaand, b: compareResult.nettoMaand },
                      { a: result.nettoJaar, b: compareResult.nettoJaar },
                      { a: result.inkomstenbelasting, b: compareResult.inkomstenbelasting },
                      { a: result.zvw, b: compareResult.zvw },
                      { a: parseFloat(result.effectiveRate), b: parseFloat(compareResult.effectiveRate), isRate: true },
                    ];
                    const row = rows[i];
                    const diff = row.a - row.b;
                    const isNegativeGood = i >= 2;
                    const isGood = isNegativeGood ? diff < 0 : diff > 0;
                    return (
                      <div key={i} className="compare-row">
                        <span style={{ color: "#666", fontSize: 12 }}>{label}</span>
                        <span className="compare-val">{row.isRate ? `${row.a}%` : fmt(row.a)}</span>
                        <span className="compare-val" style={{ color: "#aaa" }}>{row.isRate ? `${row.b}%` : fmt(row.b)}</span>
                        <span className={`compare-diff ${diff === 0 ? "" : isGood ? "pos" : "neg"}`}>
                          {diff === 0 ? "–" : `${diff > 0 ? "+" : ""}${row.isRate ? diff.toFixed(1) + "%" : fmt(Math.abs(diff))}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button className={`copy-btn${copied ? " copied" : ""}`} onClick={() => { navigator.clipboard.writeText(t.copyText(year, mode, result, fmt)).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? t.copied : t.copyBtn}
            </button>

            <div className="disclaimer">{t.disclaimer.replace("{year}", year)}</div>

            <div className="ad-placeholder" style={{ marginTop: 14 }}>{t.adLabel}</div>
          </div>
        )}

        <div className="footer">
          <p>{t.footerBy} <a href="https://nexiotools.nl" target="_blank" rel="noopener noreferrer">nexiotools.nl</a> &mdash; {t.footerRates} {year}</p>
        </div>
      </div>
    </div>
  );
}

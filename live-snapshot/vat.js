/* ============================================================================
 * Breakout — EU VAT calculator (client-side)
 * ----------------------------------------------------------------------------
 * Provides VAT logic for checkout:
 *   - EU country list + rates (effective rates as of mid-2025)
 *   - VAT ID format validation (regex only — not VIES lookup)
 *   - calculate(subtotalAfterDiscount, country, vatId) → { vatRate, vatAmount, reverseCharge }
 *
 * Behaviour:
 *   - Non-EU country  → 0% VAT
 *   - EU country, no VAT ID (or invalid) → standard rate of that country
 *   - EU country (≠ EE) + valid VAT ID format → reverse charge (0%) (B2B intra-EU)
 *   - EU country = EE + valid VAT ID → still charge EE VAT (domestic B2B)
 *
 * Exposed as global: window.VATCalc
 * ============================================================================ */
(function (global) {
  'use strict';

  // ------------------------------------------------------------------------
  // EU member states + standard VAT rate (as of 2025-06)
  // ------------------------------------------------------------------------
  // NOTE: keep rates in sync with backend (src/vat.js mirror).
  var EU_VAT = {
    AT: { name: 'Austria',        rate: 20.0 },
    BE: { name: 'Belgium',        rate: 21.0 },
    BG: { name: 'Bulgaria',       rate: 20.0 },
    HR: { name: 'Croatia',        rate: 25.0 },
    CY: { name: 'Cyprus',         rate: 19.0 },
    CZ: { name: 'Czech Republic', rate: 21.0 },
    DK: { name: 'Denmark',        rate: 25.0 },
    EE: { name: 'Estonia',        rate: 24.0 },
    FI: { name: 'Finland',        rate: 25.5 },
    FR: { name: 'France',         rate: 20.0 },
    DE: { name: 'Germany',        rate: 19.0 },
    GR: { name: 'Greece',         rate: 24.0 },
    HU: { name: 'Hungary',        rate: 27.0 },
    IE: { name: 'Ireland',        rate: 23.0 },
    IT: { name: 'Italy',          rate: 22.0 },
    LV: { name: 'Latvia',         rate: 21.0 },
    LT: { name: 'Lithuania',      rate: 21.0 },
    LU: { name: 'Luxembourg',     rate: 17.0 },
    MT: { name: 'Malta',          rate: 18.0 },
    NL: { name: 'Netherlands',    rate: 21.0 },
    PL: { name: 'Poland',         rate: 23.0 },
    PT: { name: 'Portugal',       rate: 23.0 },
    RO: { name: 'Romania',        rate: 21.0 },
    SK: { name: 'Slovakia',       rate: 23.0 },
    SI: { name: 'Slovenia',       rate: 22.0 },
    SE: { name: 'Sweden',         rate: 25.0 },
    ES: { name: 'Spain',          rate: 21.0 }
  };

  // Popular non-EU countries shown in the dropdown (in addition to "Other").
  var OTHER_COUNTRIES = {
    US: 'United States',
    GB: 'United Kingdom',
    CA: 'Canada',
    AU: 'Australia',
    NZ: 'New Zealand',
    CH: 'Switzerland',
    NO: 'Norway',
    IS: 'Iceland',
    UA: 'Ukraine',
    TR: 'Turkey',
    BR: 'Brazil',
    MX: 'Mexico',
    AR: 'Argentina',
    JP: 'Japan',
    KR: 'South Korea',
    CN: 'China',
    HK: 'Hong Kong',
    SG: 'Singapore',
    IN: 'India',
    ID: 'Indonesia',
    PH: 'Philippines',
    TH: 'Thailand',
    VN: 'Vietnam',
    MY: 'Malaysia',
    AE: 'United Arab Emirates',
    SA: 'Saudi Arabia',
    IL: 'Israel',
    ZA: 'South Africa',
    NG: 'Nigeria',
    EG: 'Egypt',
    RU: 'Russia',
    BY: 'Belarus',
    KZ: 'Kazakhstan',
    GE: 'Georgia',
    MD: 'Moldova',
    RS: 'Serbia',
    AL: 'Albania',
    MK: 'North Macedonia',
    BA: 'Bosnia and Herzegovina',
    XK: 'Kosovo',
    ME: 'Montenegro'
  };

  // ------------------------------------------------------------------------
  // VAT ID regex per country (format-only, no VIES lookup)
  // ------------------------------------------------------------------------
  // Greece uses prefix "EL" in VAT IDs (not "GR").
  var VAT_ID_REGEX = {
    AT: /^ATU\d{8}$/,
    BE: /^BE0?\d{9,10}$/,
    BG: /^BG\d{9,10}$/,
    HR: /^HR\d{11}$/,
    CY: /^CY\d{8}[A-Z]$/,
    CZ: /^CZ\d{8,10}$/,
    DK: /^DK\d{8}$/,
    EE: /^EE\d{9}$/,
    FI: /^FI\d{8}$/,
    FR: /^FR[A-HJ-NP-Z0-9]{2}\d{9}$/,
    DE: /^DE\d{9}$/,
    GR: /^EL\d{9}$/,
    HU: /^HU\d{8}$/,
    IE: /^IE(?:\d{7}[A-W]|\d[A-Z+*]\d{5}[A-W]|\d{7}[A-W][A-I])$/,
    IT: /^IT\d{11}$/,
    LV: /^LV\d{11}$/,
    LT: /^LT(?:\d{9}|\d{12})$/,
    LU: /^LU\d{8}$/,
    MT: /^MT\d{8}$/,
    NL: /^NL\d{9}B\d{2}$/,
    PL: /^PL\d{10}$/,
    PT: /^PT\d{9}$/,
    RO: /^RO\d{2,10}$/,
    SK: /^SK\d{10}$/,
    SI: /^SI\d{8}$/,
    SE: /^SE\d{12}$/,
    ES: /^ES(?:[A-Z]\d{7}[A-Z]|[A-Z]\d{8}|\d{8}[A-Z])$/
  };

  /**
   * Returns true if the given VAT ID matches the format for the country.
   * Strips spaces and uppercases first.
   */
  function isValidVatIdFormat(country, vatId) {
    if (!country || !vatId) return false;
    var cleaned = String(vatId).replace(/[\s.\-]/g, '').toUpperCase();
    // Greek IDs may be entered as "GR..." but the official prefix is "EL"
    if (country === 'GR' && cleaned.indexOf('GR') === 0) {
      cleaned = 'EL' + cleaned.slice(2);
    }
    var rx = VAT_ID_REGEX[country];
    return rx ? rx.test(cleaned) : false;
  }

  /**
   * Calculate VAT for an order.
   * @param {number} subtotal — amount in dollars (already discount-applied)
   * @param {string} country  — ISO 3166-1 alpha-2 country code (e.g. "DE")
   * @param {string} [vatId]  — optional VAT ID entered by user
   * @returns {{vatRate:number, vatAmount:number, reverseCharge:boolean,
   *           countryName:string, isEU:boolean, vatIdValid:boolean}}
   */
  function calculate(subtotal, country, vatId) {
    var sub = Number(subtotal) || 0;
    var ctry = country || '';
    var euInfo = EU_VAT[ctry];

    if (!euInfo) {
      // Non-EU or no country selected
      return {
        vatRate: 0,
        vatAmount: 0,
        reverseCharge: false,
        countryName: OTHER_COUNTRIES[ctry] || '',
        isEU: false,
        vatIdValid: false
      };
    }

    var validId = isValidVatIdFormat(ctry, vatId);

    // Reverse charge only applies for B2B intra-EU sales — NOT for domestic
    // sales from the home country (Estonia). We're an Estonian company, so
    // EE buyers always pay EE VAT.
    var HOME_COUNTRY = 'EE';
    var reverseCharge = validId && ctry !== HOME_COUNTRY;

    var rate = reverseCharge ? 0 : euInfo.rate;
    var vatAmount = Math.round(sub * rate) / 100;

    return {
      vatRate: rate,
      vatAmount: vatAmount,
      reverseCharge: reverseCharge,
      countryName: euInfo.name,
      isEU: true,
      vatIdValid: validId
    };
  }

  /**
   * Build the country <option>s — EU group first (sorted by name), then Other.
   * Returns an HTML string ready to inject into <select>.
   */
  function buildCountryOptions() {
    var euEntries = Object.keys(EU_VAT)
      .map(function (code) { return { code: code, name: EU_VAT[code].name }; })
      .sort(function (a, b) { return a.name.localeCompare(b.name); });

    var otherEntries = Object.keys(OTHER_COUNTRIES)
      .map(function (code) { return { code: code, name: OTHER_COUNTRIES[code] }; })
      .sort(function (a, b) { return a.name.localeCompare(b.name); });

    var html = '<option value="">— Select your country —</option>';
    html += '<optgroup label="European Union">';
    euEntries.forEach(function (e) {
      html += '<option value="' + e.code + '">' + e.name + '</option>';
    });
    html += '</optgroup>';
    html += '<optgroup label="Other countries">';
    otherEntries.forEach(function (e) {
      html += '<option value="' + e.code + '">' + e.name + '</option>';
    });
    html += '</optgroup>';
    return html;
  }

  function isEUCountry(code) {
    return !!EU_VAT[code];
  }

  global.VATCalc = {
    EU_VAT: EU_VAT,
    OTHER_COUNTRIES: OTHER_COUNTRIES,
    calculate: calculate,
    isValidVatIdFormat: isValidVatIdFormat,
    isEUCountry: isEUCountry,
    buildCountryOptions: buildCountryOptions
  };

})(window);

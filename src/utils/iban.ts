/**
 * Checks the input string and validates it as an IBAN.
 * @param iban the input string
 * @returns {boolean} true if the input is a valid IBAN
 */
export const isValidIban = (iban: string) => {
  iban = electronicFormat(iban);

  const ibanFormat = ibanFormats.find(value => value.countryCode === iban.slice(0, 2));
  if(!ibanFormat) return false;

  const ibanStructure = parseStructure(ibanFormat.structure);
  if(!ibanStructure) return false;

  return ibanFormat.length === iban.length
    && ibanStructure.test(iban.slice(4))
    && iso7064Mod97_10(iso13616Prepare(iban)) === 1;
}

/**
 * Checks if the input string is a valid IBAN and formats valid IBANs, adding spaces every fourth character.
 * @param iban the input string
 * @returns {string} the formatted IBAN
 */
export const formatValidIban = (iban: string) => {
  const separator = ' ';
  if(!isValidIban(iban)) return iban;
  return electronicFormat(iban).replace(EVERY_FOUR_CHARS, "$1" + separator);
};

// Code based on https://github.com/arhs/iban.js

const NON_ALPHANUM = /[^a-zA-Z0-9]/g;
const EVERY_FOUR_CHARS =/(.{4})(?!$)/g;

const electronicFormat = (iban: string) => iban.replace(NON_ALPHANUM, '').toUpperCase();

const parseStructure = (structure: string) => {
  // split in blocks of 3 chars
  const structureParts = structure.match(/(.{3})/g);
  if(!structureParts) return;

  const regex = structureParts.map( block => {
    // parse each structure block (1-char + 2-digits)
    let format;
    const pattern = block.slice(0, 1);
    const repeats = parseInt(block.slice(1), 10);

    switch (pattern){
      case "A": format = "0-9A-Za-z"; break;
      case "B": format = "0-9A-Z"; break;
      case "C": format = "A-Za-z"; break;
      case "F": format = "0-9"; break;
      case "L": format = "a-z"; break;
      case "U": format = "A-Z"; break;
      case "W": format = "0-9a-z"; break;
    }

    return '([' + format + ']{' + repeats + '})';
  });

  return new RegExp('^' + regex.join('') + '$');
}

const iso13616Prepare = (iban: string) => {
  iban = iban.toUpperCase();
  iban = iban.slice(4) + iban.slice(0, 4);

  return iban.split('').map(n => {
    const code = n.charCodeAt(0);
    if (code >= "A".charCodeAt(0) && code <= "Z".charCodeAt(0)){
      // A = 10, B = 11, ... Z = 35
      return code - "A".charCodeAt(0) + 10;
    } else {
      return n;
    }
  }).join('');
}

const iso7064Mod97_10 = (iban: string) => {
  let remainder = iban;
  let block;

  while (remainder.length > 2){
    block = remainder.slice(0, 9);
    remainder = parseInt(block, 10) % 97 + remainder.slice(block.length);
  }

  return parseInt(remainder, 10) % 97;
}

const ibanFormats: IbanSpecification[] = [
  {countryCode: "AD", length: 24, structure: "F04F04A12"},
  {countryCode: "AE", length: 23, structure: "F03F16"},
  {countryCode: "AL", length: 28, structure: "F08A16"},
  {countryCode: "AT", length: 20, structure: "F05F11"},
  {countryCode: "AZ", length: 28, structure: "U04A20"},
  {countryCode: "BA", length: 20, structure: "F03F03F08F02"},
  {countryCode: "BE", length: 16, structure: "F03F07F02"},
  {countryCode: "BG", length: 22, structure: "U04F04F02A08"},
  {countryCode: "BH", length: 22, structure: "U04A14"},
  {countryCode: "BR", length: 29, structure: "F08F05F10U01A01"},
  {countryCode: "BY", length: 28, structure: "A04F04A16"},
  {countryCode: "CH", length: 21, structure: "F05A12"},
  {countryCode: "CR", length: 22, structure: "F04F14"},
  {countryCode: "CY", length: 28, structure: "F03F05A16"},
  {countryCode: "CZ", length: 24, structure: "F04F06F10"},
  {countryCode: "DE", length: 22, structure: "F08F10"},
  {countryCode: "DK", length: 18, structure: "F04F09F01"},
  {countryCode: "DO", length: 28, structure: "U04F20"},
  {countryCode: "EE", length: 20, structure: "F02F02F11F01"},
  {countryCode: "EG", length: 29, structure: "F04F04F17"},
  {countryCode: "ES", length: 24, structure: "F04F04F01F01F10"},
  {countryCode: "FI", length: 18, structure: "F06F07F01"},
  {countryCode: "FO", length: 18, structure: "F04F09F01"},
  {countryCode: "FR", length: 27, structure: "F05F05A11F02"},
  {countryCode: "GB", length: 22, structure: "U04F06F08"},
  {countryCode: "GE", length: 22, structure: "U02F16"},
  {countryCode: "GI", length: 23, structure: "U04A15"},
  {countryCode: "GL", length: 18, structure: "F04F09F01"},
  {countryCode: "GR", length: 27, structure: "F03F04A16"},
  {countryCode: "GT", length: 28, structure: "A04A20"},
  {countryCode: "HR", length: 21, structure: "F07F10"},
  {countryCode: "HU", length: 28, structure: "F03F04F01F15F01"},
  {countryCode: "IE", length: 22, structure: "U04F06F08"},
  {countryCode: "IL", length: 23, structure: "F03F03F13"},
  {countryCode: "IS", length: 26, structure: "F04F02F06F10"},
  {countryCode: "IT", length: 27, structure: "U01F05F05A12"},
  {countryCode: "IQ", length: 23, structure: "U04F03A12"},
  {countryCode: "JO", length: 30, structure: "A04F22"},
  {countryCode: "KW", length: 30, structure: "U04A22"},
  {countryCode: "KZ", length: 20, structure: "F03A13"},
  {countryCode: "LB", length: 28, structure: "F04A20"},
  {countryCode: "LC", length: 32, structure: "U04F24"},
  {countryCode: "LI", length: 21, structure: "F05A12"},
  {countryCode: "LT", length: 20, structure: "F05F11"},
  {countryCode: "LU", length: 20, structure: "F03A13"},
  {countryCode: "LV", length: 21, structure: "U04A13"},
  {countryCode: "MC", length: 27, structure: "F05F05A11F02"},
  {countryCode: "MD", length: 24, structure: "U02A18"},
  {countryCode: "ME", length: 22, structure: "F03F13F02"},
  {countryCode: "MK", length: 19, structure: "F03A10F02"},
  {countryCode: "MR", length: 27, structure: "F05F05F11F02"},
  {countryCode: "MT", length: 31, structure: "U04F05A18"},
  {countryCode: "MU", length: 30, structure: "U04F02F02F12F03U03"},
  {countryCode: "NL", length: 18, structure: "U04F10"},
  {countryCode: "NO", length: 15, structure: "F04F06F01"},
  {countryCode: "PK", length: 24, structure: "U04A16"},
  {countryCode: "PL", length: 28, structure: "F08F16"},
  {countryCode: "PS", length: 29, structure: "U04A21"},
  {countryCode: "PT", length: 25, structure: "F04F04F11F02"},
  {countryCode: "QA", length: 29, structure: "U04A21"},
  {countryCode: "RO", length: 24, structure: "U04A16"},
  {countryCode: "RS", length: 22, structure: "F03F13F02"},
  {countryCode: "SA", length: 24, structure: "F02A18"},
  {countryCode: "SC", length: 31, structure: "U04F04F16U03"},
  {countryCode: "SE", length: 24, structure: "F03F16F01"},
  {countryCode: "SI", length: 19, structure: "F05F08F02"},
  {countryCode: "SK", length: 24, structure: "F04F06F10"},
  {countryCode: "SM", length: 27, structure: "U01F05F05A12"},
  {countryCode: "ST", length: 25, structure: "F08F11F02"},
  {countryCode: "SV", length: 28, structure: "U04F20"},
  {countryCode: "TL", length: 23, structure: "F03F14F02"},
  {countryCode: "TN", length: 24, structure: "F02F03F13F02"},
  {countryCode: "TR", length: 26, structure: "F05F01A16"},
  {countryCode: "UA", length: 29, structure: "F25"},
  {countryCode: "VA", length: 22, structure: "F18"},
  {countryCode: "VG", length: 24, structure: "U04F16"},
  {countryCode: "XK", length: 20, structure: "F04F10F02"},
  {countryCode: "AO", length: 25, structure: "F21"},
  {countryCode: "BF", length: 27, structure: "F23"},
  {countryCode: "BI", length: 16, structure: "F12"},
  {countryCode: "BJ", length: 28, structure: "F24"},
  {countryCode: "CI", length: 28, structure: "U02F22"},
  {countryCode: "CM", length: 27, structure: "F23"},
  {countryCode: "CV", length: 25, structure: "F21"},
  {countryCode: "DZ", length: 24, structure: "F20"},
  {countryCode: "IR", length: 26, structure: "F22"},
  {countryCode: "MG", length: 27, structure: "F23"},
  {countryCode: "ML", length: 28, structure: "U01F23"},
  {countryCode: "MZ", length: 25, structure: "F21"},
  {countryCode: "SN", length: 28, structure: "U01F23"},
  {countryCode: "GF", length: 27, structure: "F05F05A11F02"},
  {countryCode: "GP", length: 27, structure: "F05F05A11F02"},
  {countryCode: "MQ", length: 27, structure: "F05F05A11F02"},
  {countryCode: "RE", length: 27, structure: "F05F05A11F02"},
  {countryCode: "PF", length: 27, structure: "F05F05A11F02"},
  {countryCode: "TF", length: 27, structure: "F05F05A11F02"},
  {countryCode: "YT", length: 27, structure: "F05F05A11F02"},
  {countryCode: "NC", length: 27, structure: "F05F05A11F02"},
  {countryCode: "BL", length: 27, structure: "F05F05A11F02"},
  {countryCode: "MF", length: 27, structure: "F05F05A11F02"},
  {countryCode: "PM", length: 27, structure: "F05F05A11F02"},
  {countryCode: "WF", length: 27, structure: "F05F05A11F02"},
]

interface IbanSpecification {
  countryCode: string,
  length: number,
  structure: string,
}
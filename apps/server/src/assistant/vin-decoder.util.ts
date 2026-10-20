export interface DecodedVinInfo {
  vin: string;
  wmiCountry?: string;
  manufacturer?: string;
  modelYear?: number;
  generation?: string;
  exactModel?: string;
  engineFamily?: string;
  engineCode?: string;
  engineSpecs?: string;
  fuelType?: 'Дизель' | 'Бензин' | 'Гибрид' | 'Электро' | string;
  powerHp?: number;
  transmission?: string;
  driveType?: 'Полный привод (AWD / 4WD)' | 'Передний привод (FWD)' | 'Задний привод (RWD)' | string;
  summary: string;
}

const YEAR_CODES: Record<string, number> = {
  1: 2001,
  2: 2002,
  3: 2003,
  4: 2004,
  5: 2005,
  6: 2006,
  7: 2007,
  8: 2008,
  9: 2009,
  A: 2010,
  B: 2011,
  C: 2012,
  D: 2013,
  E: 2014,
  F: 2015,
  G: 2016,
  H: 2017,
  J: 2018,
  K: 2019,
  L: 2020,
  M: 2021,
  N: 2022,
  P: 2023,
  R: 2024,
  S: 2025,
  T: 2026,
};

const CYRILLIC_HOMOGLYPHS: Record<string, string> = {
  А: 'A',
  В: 'B',
  Е: 'E',
  К: 'K',
  М: 'M',
  Н: 'H',
  О: 'O',
  Р: 'P',
  С: 'C',
  Т: 'T',
  У: 'Y',
  Х: 'X',
};

export function normalizeVin(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .toUpperCase()
    .replace(/[АВЕКМНОРСТУХ]/g, (c) => CYRILLIC_HOMOGLYPHS[c] || c)
    .replace(/[^A-Z0-9]/g, '');
}

export function decodeVin(
  rawVin: string,
  brandHint?: string,
  modelHint?: string,
  yearHint?: number,
): DecodedVinInfo | null {
  if (!rawVin) return null;
  const vin = normalizeVin(rawVin);
  if (vin.length !== 17) return null;

  const wmi = vin.slice(0, 3);
  const vds = vin.slice(3, 9);
  const yearChar = vin[9];
  const modelYear = YEAR_CODES[yearChar] || yearHint;

  const result: DecodedVinInfo = {
    vin,
    modelYear,
    summary: `${brandHint || ''} ${modelHint || ''}`.trim(),
  };

  // 1. Manufacturer by WMI
  if (wmi.startsWith('WB') || wmi === 'WBY' || wmi === 'WBS') {
    result.manufacturer = 'BMW AG (Германия)';
  } else if (wmi === 'WAU' || wmi === 'TRU') {
    result.manufacturer = 'Audi AG (Германия)';
  } else if (wmi === 'WVW' || wmi === 'WVG' || wmi === 'WV1' || wmi === 'WV2') {
    result.manufacturer = 'Volkswagen AG (Германия)';
  } else if (wmi === 'TMB') {
    result.manufacturer = 'Škoda Auto (Чехия)';
  } else if (wmi.startsWith('KM') || wmi === '2HM') {
    result.manufacturer = 'Hyundai Motor (Корея)';
  } else if (wmi.startsWith('KN') || wmi === 'U6Y') {
    result.manufacturer = 'Kia Motors (Корея)';
  } else if (wmi === 'Z94') {
    result.manufacturer = 'Хёндэ Мотор Мануфактуринг Рус (Россия)';
  } else if (wmi === 'XWE') {
    result.manufacturer = 'Автотор (Калининград, Россия)';
  } else if (wmi.startsWith('JT')) {
    result.manufacturer = 'Toyota Motor Corporation (Япония)';
  } else if (wmi.startsWith('WD')) {
    result.manufacturer = 'Mercedes-Benz (Германия)';
  }

  const isBmw =
    result.manufacturer?.includes('BMW') ||
    brandHint?.toUpperCase().includes('BMW') ||
    wmi.startsWith('WB');

  // BMW specialized decoder
  if (isBmw) {
    const vdsPrefix = vin.slice(3, 7); // 4-7 characters

    // G30 5-series (2017+)
    if (vdsPrefix === 'JN11' || vdsPrefix === 'JN12') {
      result.generation = '5 серия (G30 Седан)';
      result.exactModel = 'BMW 525d xDrive (G30)';
      result.engineFamily = 'B47';
      result.engineCode = 'B47D20O1';
      result.fuelType = 'Дизель';
      result.powerHp = 231;
      result.engineSpecs =
        'B47D20O1, 2.0L Дизель с двойным турбонаддувом (Bi-Turbo), 231 л.с. (170 кВт), 500 Н·м';
      result.transmission = '8-ступенчатый Steptronic автомат (ZF 8HP50 / GA8HP50Z)';
      result.driveType = 'Полный привод (xDrive)';
      result.summary =
        'BMW 525d xDrive (кузов G30), 2.0L Bi-Turbo дизель B47D20 231 л.с., АКПП ZF 8HP50, полный привод xDrive';
      return result;
    }

    if (vdsPrefix === 'JC31' || vdsPrefix === 'JC32') {
      result.generation = '5 серия (G30 Седан)';
      result.exactModel = 'BMW 520d (G30)';
      result.engineFamily = 'B47';
      result.engineCode = 'B47D20';
      result.fuelType = 'Дизель';
      result.powerHp = 190;
      result.engineSpecs = 'B47D20, 2.0L Турбодизель, 190 л.с. (140 кВт), 400 Н·м';
      result.transmission = '8-ступенчатая АКПП ZF 8HP50';
      result.driveType = 'Задний привод (RWD)';
      result.summary = 'BMW 520d (кузов G30), 2.0L дизель B47 190 л.с., АКПП ZF 8HP';
      return result;
    }

    if (vdsPrefix === 'JC51' || vdsPrefix === 'JC52') {
      result.generation = '5 серия (G30 Седан)';
      result.exactModel = 'BMW 520d xDrive (G30)';
      result.engineFamily = 'B47';
      result.engineCode = 'B47D20';
      result.fuelType = 'Дизель';
      result.powerHp = 190;
      result.engineSpecs = 'B47D20, 2.0L Турбодизель, 190 л.с. (140 кВт), 400 Н·м';
      result.transmission = '8-ступенчатая АКПП ZF 8HP50';
      result.driveType = 'Полный привод (xDrive)';
      result.summary =
        'BMW 520d xDrive (кузов G30), 2.0L дизель B47 190 л.с., АКПП ZF 8HP, xDrive';
      return result;
    }

    if (vdsPrefix === 'JC91' || vdsPrefix === 'JC92') {
      result.generation = '5 серия (G30 Седан)';
      result.exactModel = 'BMW 530d xDrive (G30)';
      result.engineFamily = 'B57';
      result.engineCode = 'B57D30';
      result.fuelType = 'Дизель';
      result.powerHp = 249; // РФ налог
      result.engineSpecs =
        'B57D30, 3.0L Рядная шестёрка Турбодизель, 249/265 л.с., 620 Н·м';
      result.transmission = '8-ступенчатая АКПП ZF 8HP75';
      result.driveType = 'Полный привод (xDrive)';
      result.summary =
        'BMW 530d xDrive (кузов G30), 3.0L рядная шестёрка дизель B57 249 л.с., АКПП ZF 8HP, xDrive';
      return result;
    }

    if (vdsPrefix === 'JA51' || vdsPrefix === 'JA71') {
      result.generation = '5 серия (G30 Седан)';
      result.exactModel = 'BMW 530i xDrive (G30)';
      result.engineFamily = 'B48';
      result.engineCode = 'B48B20';
      result.fuelType = 'Бензин';
      result.powerHp = 249;
      result.engineSpecs =
        'B48B20, 2.0L Турбобензин TwinPower Turbo, 249 л.с. (183 кВт), 350 Н·м';
      result.transmission = '8-ступенчатая АКПП ZF 8HP50';
      result.driveType = 'Полный привод (xDrive)';
      result.summary =
        'BMW 530i xDrive (кузов G30), 2.0L бензин B48 249 л.с., АКПП ZF 8HP, xDrive';
      return result;
    }

    // BMW 5 series fallback based on year (only if model specifically indicates 5-series)
    const is5Series =
      Boolean(modelHint) &&
      /\b5\b|5\s*сери|5er|5\d\d/i.test(modelHint || '') &&
      !/x\d/i.test(modelHint || '');
    const y = modelYear || yearHint || 2019;
    if (is5Series) {
      if (y >= 2017 && y <= 2023) {
        result.generation = '5 серия (кузов G30/G31)';
        result.transmission = '8-ступенчатая АКПП Steptronic (ZF 8HP)';
      } else if (y >= 2010 && y <= 2016) {
        result.generation = '5 серия (кузов F10/F11)';
        result.transmission = '8-ступенчатая АКПП Steptronic (ZF 8HP)';
      } else if (y >= 2003 && y <= 2009) {
        result.generation = '5 серия (кузов E60/E61)';
        result.transmission = '6-ступенчатая АКПП ZF 6HP';
      }
    }

    result.summary = `${result.exactModel || `BMW ${modelHint || '5'}`} (${
      result.generation || ''
    })${result.engineSpecs ? `, мотор ${result.engineSpecs}` : ''}${
      result.transmission ? `, ${result.transmission}` : ''
    }${result.driveType ? `, ${result.driveType}` : ''}`.trim();

    return result;
  }

  // KIA / Hyundai decoding
  const isKiaHyundai =
    brandHint?.toUpperCase().includes('KIA') ||
    brandHint?.toUpperCase().includes('HYUNDAI') ||
    wmi === 'Z94' ||
    wmi.startsWith('KN') ||
    wmi.startsWith('KM');

  if (isKiaHyundai) {
    if (modelHint?.toUpperCase().includes('RIO') || modelHint?.toUpperCase().includes('SOLARIS')) {
      const y = modelYear || yearHint || 2015;
      result.generation = y >= 2017 ? 'Rio IV / Solaris II' : 'Rio III / Solaris I';
      result.engineFamily = 'Gamma';
      result.engineSpecs =
        '1.6L Gamma (G4FC / G4FG) 123 л.с. либо 1.4L (G4FA / G4LC) 100-107 л.с.';
      result.fuelType = 'Бензин';
      result.driveType = 'Передний привод (FWD)';
      result.transmission = 'МКПП 6-ст / АКПП 6-ст';
      result.summary = `${brandHint || 'Kia/Hyundai'} ${modelHint || 'Rio/Solaris'} (${
        result.generation
      }), мотор 1.6 Gamma G4FC/G4FG 123 л.с. (или 1.4 G4FA), передний привод`;
      return result;
    }
  }

  // VAG decoding (Skoda, Audi, VW)
  const isVag =
    brandHint?.toUpperCase().includes('SKODA') ||
    brandHint?.toUpperCase().includes('AUDI') ||
    brandHint?.toUpperCase().includes('VOLKSWAGEN') ||
    wmi === 'TMB' ||
    wmi === 'WAU' ||
    wmi.startsWith('WV');

  if (isVag) {
    if (modelHint?.toUpperCase().includes('YETI')) {
      result.generation = 'Skoda Yeti (кузов 5L)';
      result.engineSpecs = '1.8 TSI (CDAB, 152 л.с., 4x4) / 1.4 TSI (CAXA, 122 л.с.) / 1.2 TSI (CBZB, 105 л.с.)';
      result.summary = `Skoda Yeti (5L), бензиновые турбомоторы EA111/EA888 или 2.0 TDI`;
      return result;
    }
    if (modelHint?.toUpperCase().includes('A3')) {
      result.generation = 'Audi A3';
      result.engineSpecs = '1.4 TFSI (EA211, 150 л.с., DSG) / 2.0 TFSI (190 л.с., quattro)';
      result.summary = `Audi A3, мотор TFSI EA211/EA888, коробка S-Tronic / DSG`;
      return result;
    }
  }

  // Generic fallback summary
  result.summary = `${brandHint || ''} ${modelHint || ''} (${modelYear || yearHint || ''} г.в., VIN: ${vin})`.trim();
  return result;
}

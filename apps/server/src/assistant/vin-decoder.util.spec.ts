import { decodeVin, normalizeVin } from './vin-decoder.util';

describe('vin-decoder.util', () => {
  describe('normalizeVin', () => {
    it('should strip whitespace and non-alphanumerics', () => {
      expect(normalizeVin('  wbajn-11090-bk39459  ')).toBe('WBAJN11090BK39459');
    });

    it('should convert Cyrillic homoglyphs to Latin equivalents', () => {
      // 'В' (cyrillic B), 'А' (cyrillic A), 'К' (cyrillic K)
      const cyrillicVin = 'WВАJN11090ВК39459';
      expect(normalizeVin(cyrillicVin)).toBe('WBAJN11090BK39459');
    });

    it('should return empty string for falsy input', () => {
      expect(normalizeVin('')).toBe('');
      expect(normalizeVin(null as any)).toBe('');
    });
  });

  describe('decodeVin', () => {
    it('should return null for invalid or short VINs', () => {
      expect(decodeVin('')).toBeNull();
      expect(decodeVin('WBAJN11')).toBeNull();
      expect(decodeVin('1234567890123456')).toBeNull(); // 16 chars
    });

    it('should decode BMW 525d xDrive G30 (JN11)', () => {
      const decoded = decodeVin('WBAJN11090BK39459', 'BMW', '5', 2019);
      expect(decoded).not.toBeNull();
      expect(decoded?.manufacturer).toBe('BMW AG (Германия)');
      expect(decoded?.exactModel).toBe('BMW 525d xDrive (G30)');
      expect(decoded?.engineFamily).toBe('B47');
      expect(decoded?.engineCode).toBe('B47D20O1');
      expect(decoded?.powerHp).toBe(231);
      expect(decoded?.fuelType).toBe('Дизель');
      expect(decoded?.driveType).toBe('Полный привод (xDrive)');
      expect(decoded?.modelYear).toBe(2019);
      expect(decoded?.summary).toContain('B47D20');
      expect(decoded?.summary).toContain('231 л.с.');
    });

    it('should decode model year from VIN 10th character when present', () => {
      // 10th char 'K' is 2019
      const decoded = decodeVin('WBAJN1109KBK39459');
      expect(decoded?.modelYear).toBe(2019);
    });

    it('should NOT falsely match BMW 525d when VIN contains "11" in serial number (JN31 regression)', () => {
      // JN31 is 530i, serial number contains "11894"
      const decoded = decodeVin('WBAJN31050BK11894', 'BMW', '5');
      expect(decoded).not.toBeNull();
      expect(decoded?.exactModel).not.toBe('BMW 525d xDrive (G30)');
      expect(decoded?.engineCode).not.toBe('B47D20O1');
    });

    it('should decode BMW 520d G30 (JC31)', () => {
      const decoded = decodeVin('WBAJC31000BK12345', 'BMW', '5');
      expect(decoded?.exactModel).toBe('BMW 520d (G30)');
      expect(decoded?.powerHp).toBe(190);
      expect(decoded?.driveType).toBe('Задний привод (RWD)');
    });

    it('should decode BMW 520d xDrive G30 (JC51)', () => {
      const decoded = decodeVin('WBAJC51000BK12345', 'BMW', '5');
      expect(decoded?.exactModel).toBe('BMW 520d xDrive (G30)');
      expect(decoded?.driveType).toBe('Полный привод (xDrive)');
    });

    it('should decode BMW 530d xDrive G30 (JC91)', () => {
      const decoded = decodeVin('WBAJC91000BK12345', 'BMW', '5');
      expect(decoded?.exactModel).toBe('BMW 530d xDrive (G30)');
      expect(decoded?.engineFamily).toBe('B57');
      expect(decoded?.powerHp).toBe(249);
      expect(decoded?.driveType).toBe('Полный привод (xDrive)');
    });

    it('should decode BMW 530i xDrive G30 (JA51)', () => {
      const decoded = decodeVin('WBAJA51000BK12345', 'BMW', '5');
      expect(decoded?.exactModel).toBe('BMW 530i xDrive (G30)');
      expect(decoded?.engineFamily).toBe('B48');
      expect(decoded?.fuelType).toBe('Бензин');
    });

    it('should correctly decode model year from 2001 to 2009 digits', () => {
      // 10th position: '5' -> 2005, '8' -> 2008
      const vin2005 = 'WBAED51055B123456';
      const vin2008 = 'WBAED51088B123456';
      expect(decodeVin(vin2005)?.modelYear).toBe(2005);
      expect(decodeVin(vin2008)?.modelYear).toBe(2008);
    });

    it('should NOT overwrite BMW X5 with 5-series fallback', () => {
      // WBACR61080L123456 - X5 (G05)
      const decoded = decodeVin('WBACR61080L123456', 'BMW', 'X5', 2020);
      expect(decoded?.generation).toBeUndefined();
      expect(decoded?.summary).not.toContain('5 серия');
    });

    it('should decode Kia/Hyundai and VAG', () => {
      const solaris = decodeVin('Z94CT41DBER123456', 'Hyundai', 'Solaris', 2018);
      expect(solaris?.engineFamily).toBe('Gamma');
      expect(solaris?.summary).toContain('Solaris');

      const yeti = decodeVin('TMBLF75L3C1123456', 'Skoda', 'Yeti', 2012);
      expect(yeti?.summary).toContain('Skoda Yeti');
    });
  });
});

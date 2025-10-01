import { DateTime } from 'luxon';
import { convertToDays } from './index';

describe('Utils Tests', () => {
  describe('convertToDays', () => {
    it('converts date of birth to number of days', () => {
      const dateOfBirth = DateTime.now().minus({ days: 4 }).toJSDate();
      expect(convertToDays(dateOfBirth)).toBe(4);
    });
  });
});

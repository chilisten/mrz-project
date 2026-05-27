export function parseMRZ(text) {
  const lines = text.split('\n')
    .map(l => l.toUpperCase().replace(/[^A-Z0-9<]/g, '').trim())
    .filter(l => l.length >= 28 && (l.includes('<') || /\d{5}/.test(l)));

  if (lines.length < 2) return null;

  const avgLen = lines.reduce((a, b) => a + b.length, 0) / lines.length;

  try {
    if (avgLen > 38 && lines.length >= 2) {
      const l1 = lines[lines.length - 2];
      const l2 = lines[lines.length - 1];
      const country = l1.substring(2, 5).replace(/</g, '');
      const rawName = l1.substring(5);
      const [surnameRaw, givenRaw] = rawName.split('<<');
      const surname = surnameRaw.replace(/</g, '');
      const names = givenRaw ? givenRaw.split('<')[0].replace(/</g, '') : '';
      const docNum = l2.substring(0, 9).replace(/</g, '');
      const dob    = l2.substring(13, 19);
      const sex    = l2.substring(20, 21);
      const expiry = l2.substring(21, 27);
      return { surname, names, docNum, country, dob, sex, expiry };
    }
    if (lines.length >= 3) {
      const l1 = lines[lines.length - 3];
      const l2 = lines[lines.length - 2];
      const l3 = lines[lines.length - 1];
      const country = l1.substring(2, 5).replace(/</g, '');
      const docNum  = l1.substring(5, 14).replace(/</g, '');
      const dob     = l2.substring(0, 6);
      const sex     = l2.substring(7, 8);
      const expiry  = l2.substring(8, 14);
      const [surnameRaw, givenRaw] = l3.split('<<');
      const surname = surnameRaw.replace(/</g, '');
      const names   = givenRaw ? givenRaw.split('<')[0].replace(/</g, '') : '';
      return { surname, names, docNum, country, dob, sex, expiry };
    }
  } catch (e) {
    console.error('MRZ parse error:', e);
  }
  return null;
}

/**
 * Конвертирует MRZ-дату ГГММДД в читаемый формат ДД.ММ.ГГГГ
 *
 * isExpiry=true  → дата окончания: если yy <= текущий год%100+10 → 2000+yy, иначе 1900+yy
 *                  Пример: yy=35, сейчас 2025 → 35 <= 35 → 2035 ✓
 *                  Пример: yy=85 → 85 > 35 → 1985 (старый паспорт)
 *
 * isExpiry=false → дата рождения: если yy <= currentYear%100 → 2000+yy, иначе 1900+yy
 *                  Пример: yy=05 → 05 <= 25 → 2005 ✓
 *                  Пример: yy=90 → 90 > 25 → 1990 ✓
 */
export function formatDate(yymmdd, isExpiry = false) {
  if (!yymmdd || yymmdd.length !== 6) return yymmdd;
  const yy = parseInt(yymmdd.substring(0, 2), 10);
  const mm = yymmdd.substring(2, 4);
  const dd = yymmdd.substring(4, 6);

  const now = new Date();
  const currentYY = now.getFullYear() % 100; // e.g. 25 for 2025

  let year;
  if (isExpiry) {
    // Срок действия: документы выдаются максимум на ~10 лет вперёд
    // yy <= currentYY + 10 → документ из 21 века
    year = yy <= currentYY + 10 ? 2000 + yy : 1900 + yy;
  } else {
    // Дата рождения: если yy <= текущего года двузначного → родился в 21 веке (младше 25)
    year = yy <= currentYY ? 2000 + yy : 1900 + yy;
  }

  return `${dd}.${mm}.${year}`;
}

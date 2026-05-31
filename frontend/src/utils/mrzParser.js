// Заменяет цифры на похожие буквы в полях где должны быть только буквы
function fixLetters(str) {
  if (!str) return str;
  return str
    .replace(/0/g, 'O')
    .replace(/1/g, 'I')
    .replace(/6/g, 'G')
    .replace(/8/g, 'B')
    .replace(/5/g, 'S');
}

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
      const country = fixLetters(l1.substring(2, 5).replace(/</g, ''));
      const rawName = l1.substring(5);
      const [surnameRaw, givenRaw] = rawName.split('<<');
      const surname = fixLetters(surnameRaw.replace(/</g, ''));
      const names = givenRaw ? fixLetters(givenRaw.split('<')[0].replace(/</g, '')) : '';
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
      const country = fixLetters(l1.substring(2, 5).replace(/</g, ''));
      const docNum  = l1.substring(5, 14).replace(/</g, '');
      const dob     = l2.substring(0, 6);
      const sex     = l2.substring(7, 8);
      const expiry  = l2.substring(8, 14);
      const [surnameRaw, givenRaw] = l3.split('<<');
      const surname = fixLetters(surnameRaw.replace(/</g, ''));
      const names   = givenRaw ? fixLetters(givenRaw.split('<')[0].replace(/</g, '')) : '';
      return { surname, names, docNum, country, dob, sex, expiry };
    }
  } catch (e) {
    console.error('MRZ parse error:', e);
  }
  return null;
}

export function formatDate(yymmdd, isExpiry = false) {
  if (!yymmdd || yymmdd.length !== 6) return yymmdd;
  const yy = parseInt(yymmdd.substring(0, 2), 10);
  const mm = yymmdd.substring(2, 4);
  const dd = yymmdd.substring(4, 6);

  const now = new Date();
  const currentYY = now.getFullYear() % 100;

  let year;
  if (isExpiry) {
    year = yy <= currentYY + 10 ? 2000 + yy : 1900 + yy;
  } else {
    year = yy <= currentYY ? 2000 + yy : 1900 + yy;
  }

  return `${dd}.${mm}.${year}`;
}
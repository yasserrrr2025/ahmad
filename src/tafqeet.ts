export function tafqeet(number: number): string {
  const isNegative = number < 0;
  number = Math.abs(number);

  const units = ["", "ألف", "مليون", "مليار", "ترليون"];
  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
  const tens = ["", "عشر", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

  if (number === 0) return "صفر";

  // Split into integer and fractional parts
  const intPart = Math.floor(number);
  const fracPart = Math.round((number - intPart) * 100);

  function convertGroup(n: number): string {
    let result = "";
    const h = Math.floor(n / 100);
    const r = n % 100;
    const t = Math.floor(r / 10);
    const o = r % 10;

    if (h > 0) result += hundreds[h];
    
    if (r > 0) {
      if (h > 0) result += " و ";
      
      if (r === 11) result += "أحد عشر";
      else if (r === 12) result += "اثنا عشر";
      else if (r >= 13 && r <= 19) result += ones[o] + " " + tens[1];
      else {
        if (o > 0) result += ones[o];
        if (t > 1) {
          if (o > 0) result += " و ";
          result += tens[t];
        } else if (t === 1) {
            if (o > 0) result += " و ";
            result += "عشرة";
        }
      }
    }
    return result;
  }

  let result = "";
  let currentNum = intPart;
  let unitIndex = 0;

  while (currentNum > 0) {
    const group = currentNum % 1000;
    if (group > 0) {
      let groupText = convertGroup(group);
      
      if (unitIndex > 0) {
          if (group === 1) groupText = units[unitIndex];
          else if (group === 2) groupText = units[unitIndex] + "ان";
          else if (group >= 3 && group <= 10) groupText = convertGroup(group) + " " + units[unitIndex] + "ات";
          else groupText += " " + units[unitIndex];
      }
      
      if (result !== "") result = groupText + " و " + result;
      else result = groupText;
    }
    currentNum = Math.floor(currentNum / 1000);
    unitIndex++;
  }

  result += " ريال";
  
  if (fracPart > 0) {
      result += " و " + convertGroup(fracPart) + " هللة";
  }

  return (isNegative ? "سالب " : "") + result;
}


export const getChosung = (str: string) => {
  const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  let result = "";
  for(let i=0; i<str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if(code > -1 && code < 11172) {
      result += cho[Math.floor(code/588)];
    } else {
      result += str.charAt(i);
    }
  }
  return result;
};

export const matchSearch = (target: string, search: string) => {
  const targetLower = target.toLowerCase();
  const searchLower = search.toLowerCase();
  
  if (targetLower.includes(searchLower)) return true;
  
  const targetCho = getChosung(targetLower);
  const searchCho = getChosung(searchLower);
  
  return targetCho.includes(searchCho);
};

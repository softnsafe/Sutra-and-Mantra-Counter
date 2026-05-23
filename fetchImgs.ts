import https from "https";
import fs from "fs";

const fetchChapter = (chapterNum: number): Promise<string[]> => {
  return new Promise((resolve) => {
    const url = `https://chi.xinlingfamen.info/subpages/sutras/chapter${String(chapterNum).padStart(3, '0')}.html`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        const regex = /<img.*?src="([^"]+)".*?>/g;
        let match;
        const imgs = [];
        while ((match = regex.exec(data)) !== null) {
          const src = match[1];
          // convert relative src to absolute
          const absSrc = src.replace('../', 'https://chi.xinlingfamen.info/subpages/');
          imgs.push(absSrc);
        }
        resolve(imgs);
      });
    }).on("error", (err) => {
      console.error(err);
      resolve([]);
    });
  });
};

const run = async () => {
  const result: Record<string, string[]> = {};
  for (let i = 1; i <= 17; i++) {
    const imgs = await fetchChapter(i);
    result[`sutra${i}`] = imgs;
  }
  fs.writeFileSync('imgs.json', JSON.stringify(result, null, 2));
};

run();

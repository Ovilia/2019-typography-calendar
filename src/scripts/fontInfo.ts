export default `
1.1 | font-name-a | 这是第一天的字体故事。
1.2 | font-name-b | 这是第二天的字体故事。
`
    .split('\n')
    .filter(l => l)
    .map(line => {
        const parts = line.split('|');
        return {
            date: parts[0].trim(),
            fontFamily: parts[1].trim(),
            fontStory: parts[2].trim()
        }
    });

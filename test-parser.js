const { parseAnswerKeyText } = require('./src/lib/answerKeyParser');

const sampleText = `
31 5 MCQ AE D 1
32 5 MCQ AE C 1
33 5 MCQ AE A 1
34 5 NAT AE 0.16 to 0.17 1
35 5 NAT AE 151.0 to 154.0 1
36 5 MCQ AE B 2
37 5 MCQ AE B 2
38 5 MSQ AE A;B;C 2
39 5 MSQ AE A;D 2
40 5 NAT AE 1.41 to 1.43 2
`;

console.log('Testing Parser...');
const result = parseAnswerKeyText(sampleText);
console.log(JSON.stringify(result, null, 2));

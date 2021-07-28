const parse = require('csv-parse');
const fs = require('fs');
const { execFile } = require('child_process');

const tmpFile = 'tmp/output.html';
const width = '7.5inch';
const height = '4.75inch';

function genHtmlAddress(elem) {
  // Update this with your from address
  return `
    <div class="new-page">
      <div class="return">
        <div>Full Name</div>
        <div>Address Line 1</div>
        <div>Address Line 2</div>
        <div>City, State ZipCode</div>
      </div>

      <div class="address">
        <div class="name">${elem['Response']}</div>
        <div>${elem['Mailing Line 1']}</div>
        <div>${elem['Mailing Line 2']}</div>
        <div>${elem['City']}, ${elem['State']} ${elem['Zip Code']}</div>
      </div>
    </div>
  `;
}

function genHtml(body) {
  const css = fs.readFileSync('./style.css', 'utf8');
  return `
    <html>
      <style>${css}</style>
      <body>${body}</body>
    </html>
  `;
}

const cliArgs = process.argv.slice(2);
const inputFile = cliArgs[0];
const outputFile = cliArgs[1];

if (!inputFile || !outputFile) {
  console.error('Usage: npm run convert ./input_file.csv .output_file.pdf');
  process.exit(1);
}

let input = null;

try {
  input = fs.readFileSync(inputFile, 'utf8');
} catch {
  console.error('Error! Unable to open input file:', inputFile);
  process.exit(1);
}

parse(input, {
  comment: '#',
  relax_column_count: true,
}, async function(err, output){
  header = output.shift();

  if (err) {
    throw err;
  }

  let body = "";
  const rows = output.map((line) => {
    let elem = {};
    for (let i = 0; i < line.length; i++) {
      elem[header[i]] = line[i];
    }

    body += genHtmlAddress(elem);
    return elem;
  });

  outhtml = genHtml(body);
  fs.writeFileSync(tmpFile, outhtml);
  const { stdout } = await execFile('wkhtmltopdf', ['--page-width', width, '--page-height', height, tmpFile, outputFile]);
  console.log('Successfully generated', output.length, 'rows in', outputFile);
});

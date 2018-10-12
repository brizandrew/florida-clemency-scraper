const dateFormat = require('date-fns').format;
const puppeteer = require('puppeteer');
const csvToJson = require('csvtojson');
const jsonToCsv = require('json2csv').parse;
const sleep = require('await-sleep');
const fs = require('fs');
const tqdm = require('ntqdm');

const INPUTS = {
  FIRST_NAME: '#TextBox1',
  LAST_NAME: '#TextBox2',
  DATE_OF_BIRTH: '#TextBox3',
};

const DATA = {
  NAME: '#Label5',
  DOB: '#Label8',
  TYPE: '#Label10',
  EXEC_ORDER_NUM: '#Label11',
  EXEC_ORDER_DATE: '#Label12',
  STATUS: '#Label14',
};

const OUTPUTS = [
  'FIRST_NAME',
  'LAST_NAME',
  'DATE_OF_BIRTH',
  'CLEMENCY_RECORD_FOUND',
  'CLEMENCY_NAME',
  'CLEMENCY_DOB',
  'CLEMENCY_TYPE',
  'CLEMENCY_EXEC_ORDER_NUM',
  'CLEMENCY_EXEC_ORDER_DATE',
  'CLEMENCY_STATUS',
];

const SUBMIT_BUTTON = '#Button1';
const NOT_FOUND = '#Label1';

const URL = 'https://fpcweb.fcor.state.fl.us/default.aspx';

async function run () {
  console.log('Begin scrape...');
  console.log(`Reading csv file: ${process.argv[2]}`);
  const jsonArray = await csvToJson().fromFile(process.argv[2]);

  const browser = await puppeteer.launch({
    headless: process.argv[3] === '--headless',
  });

  try {
    const page = await browser.newPage();

    for (let row of tqdm(jsonArray)) {
      if (row['LAST_NAME'] !== '') {
        // console.log(`Scraping data for ${row['FIRST_NAME']} ${row['LAST_NAME']}`);
        row['DATE_OF_BIRTH'] = dateFormat(new Date(row['DATE_OF_BIRTH']), 'MM/DD/YYYY');

        await page.goto(URL);

        for (let input in INPUTS) {
          await page.click(INPUTS[input]);
          await page.keyboard.type(row[input]);
        }

        await page.evaluate((sel) => {
          document.querySelector(sel).click();
        }, SUBMIT_BUTTON);

        await page.waitForNavigation();

        const recordFound = await page.evaluate((sel) => {
          const node = document.querySelector(sel);
          return node === null;
        }, NOT_FOUND);

        row['CLEMENCY_RECORD_FOUND'] = recordFound ? 'Yes' : 'No';

        if (recordFound) {
          for (let key in DATA) {
            row['CLEMENCY_' + key] = await page.evaluate((sel) => {
              return document.querySelector(sel).innerHTML;
            }, DATA[key]);
          }
        }

        await sleep(1500);
      }
    }

    const opts = { fields: OUTPUTS };
    const csv = jsonToCsv(jsonArray, opts);
    console.log('Saving to csv file: output.csv');
    fs.writeFile('output.csv', csv);
  } catch (err) {
    console.error(err);
  }

  browser.close();
}

run();

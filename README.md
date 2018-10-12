# Florida Clemency Board Scraper
A tool to check the clemency status of a felon on [Florida's clemency review website](https://fpcweb.fcor.state.fl.us/default.aspx).

## How To Download

Clone the repo
```
$ git clone git@github.com:brizandrew/florida-clemency-scraper.git
```

Install it's dependencies
```
$ npm install
```

## How To Use

Make sure you're in the repo's directory.

Make your your csv file has the following fields in it:
- `FIRST_NAME`
- `LAST_NAME`,
- `DATE_OF_BIRTH`

It can have more than these fields which will be transferred over to the output. DATE_OF_BIRTH can be in any javascript parseable format. It will be reformatted to work on the website in the code.


Run the following script substituting the placeholder with the path to your file.

```
$ node index.js PATH_TO_YOUR_FILE
```

You can add the `--headless` flag to the end to have the scraper run in headless mode and look at the progress bar instead.

Once complete, you should see a file in the root directory of your app called `output.csv`. This file contains the three input fields as well as a new `CLEMENCY_RECORD_FOUND` field with either a `Yes` or `No` value. If a record was found the following fields will also be filled if data is available for them on the page:
- `CLEMENCY_NAME`
- `CLEMENCY_DOB`
- `CLEMENCY_TYPE`
- `CLEMENCY_EXEC_ORDER_NUM`
- `CLEMENCY_EXEC_ORDER_DATE`
- `CLEMENCY_STATUS`

/* eslint-disable import/no-commonjs */
const fs = require('fs')
const { unmarshall } = require('@aws-sdk/util-dynamodb')

/**
 * Reads the NoSQL worknbench json file and seeds the database for testing.
 */
const data = JSON.parse(fs.readFileSync('./data-model.json', 'utf8'))
const records = data.DataModel[0].TableData.map(record => unmarshall(record))

module.exports = {
	campiagn_processing: records,
}

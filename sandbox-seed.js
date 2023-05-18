const fs = require('fs')
const AWS = require('aws-sdk')

/**
 * Reads the NoSQL worknbench json file and seeds the database for testing.
 */
const data = JSON.parse(fs.readFileSync('./data-model.json', 'utf8'))
const unmarshall = record => AWS.DynamoDB.Converter.unmarshall(record)
const records = data.DataModel[0].TableData.map(unmarshall)

module.exports = {
	campiagn_processing: records,
}

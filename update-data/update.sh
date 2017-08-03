node dynamoDBtoCSV.js -t blizzard-bits-progression | tee data.csv | node parse.js > ../public/data.json

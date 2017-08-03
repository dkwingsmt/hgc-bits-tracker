node update-data/dynamoDBtoCSV.js -t blizzard-bits-progression | tee data.csv | node update-data/parse.js > public/data.json

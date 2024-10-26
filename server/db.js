const { MongoClient } = require("mongodb");

// Replace the uri string with your connection string.
const uri = "mongodb://127.0.0.1:27017/";
const dbName = "assetStore";
const client = new MongoClient(uri);

let db;

const connectToDb = async() => {
    try{
        const mongoClient = new MongoClient(uri);
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect();
        db = mongoClient.db(dbName);
        console.log('Successfully connected to MongoDB !');
        return db;
    }catch(err){
        console.error('Failed to connect to MongoDB', err);
        throw err;
    }
};

const upsertManyIntoCollection = async (collectionName, records) => {
    try {
        const collection = db.collection(collectionName);
        const bulkOps = []; // Array to store all bulk operations
        console.log('records len:', records.length);
        for (const record of records) {
            const cityDocument = await collection.findOne({ city: record.city });
            if(!cityDocument){
                console.log("is it new city");
                const newCity = {
                    city: record.city,
                    neighborhoods: [
                        {
                            neighborhoodName: record.neighborhood,
                            streets: [
                                {
                                    streetName: record.street,
                                    assets: [record.asset]
                                }
                            ]
                        }
                    ]
                };
                /*bulkOps.push({
                    insertOne: {
                        document: newCity
                    }
                });*/
                await collection.insertOne(newCity);
                continue;
            }
            let neighborhood = cityDocument.neighborhoods.find(n => n.neighborhoodName === record.neighborhood);
            if(!neighborhood){
                console.log("is it new neighborhood");
                bulkOps.push({
                    updateOne: {
                        filter: {city: record.city },
                        update: {
                            $push: {
                                neighborhoods: {
                                    neighborhoodName: record.neighborhood,
                                    streets: [
                                        {
                                            streetName: record.street,
                                            assets: [record.asset]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                });

                continue;
            }
            let street = neighborhood.streets.find(s => s.streetName === record.street);
            if(!street){
                console.log("is it new street");
                bulkOps.push({
                    updateOne: {
                        filter: { 
                            city: record.city,
                            "neighborhoods.neighborhoodName": record.neighborhood
                        },
                        update: {
                            $push: {
                                "neighborhoods.$.streets": {
                                    streetName: record.street,
                                    assets: [record.asset]
                                }
                            }
                        }
                    }
                });
                continue;
            }
            let asset = street.assets.find(a => a.id === record.asset.id);
            if(!asset){
                console.log("is it new asset");
                bulkOps.push({
                    updateOne: {
                        filter: {
                            city: record.city,
                            "neighborhoods.neighborhoodName": record.neighborhood,
                            "neighborhoods.streets.streetName": record.street,
                            "neighborhoods.streets.assets.id": record.asset.id
                        },
                        update: {
                            $push: {
                                "neighborhoods.$[neighborhood].streets.$[street].assets": record.asset
                            }
                        },
                        arrayFilters: [
                            { "neighborhood.neighborhoodName": record.neighborhood },
                            { "street.streetName": record.street }
                        ]
                    }
                });
            }
            continue;
        };

        // Execute all bulk operations in a single request
        if (bulkOps.length > 0) {
            console.log("bulkOps: \n", JSON.stringify(bulkOps));
            console.log("length", bulkOps.length);
            await collection.bulkWrite(bulkOps);
            console.log("Bulk write operations succeeded");
        } else {
            console.log("No operations to perform");
        }
    } catch (error) {
        console.log("Error during bulk write operations:", error);
    }
};

const getAllDocuments = async (collectionName) => {
    try {
        const collection = db.collection(collectionName);
        const all = await collection.find().toArray();
        return all;
    } catch (error) {
        console.log("Error getAllDocuments:", error);
    }
    return undefined;
};

module.exports = {
    connectToDb,
    upsertManyIntoCollection,
    getAllDocuments
}
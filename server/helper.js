
const hebrewToEnglish = {'דירה': "appartments"};

const getOrderData = (data) => {
    let orderDate = [];
    /*const cityNames = new Set(data.map(a => a.city));

    let nameToNeighborhoodDict = {};
    cityNames.forEach((name) => {
        nameToNeighborhoodDict[name] = {"neighborhoods": {}};
    })*/
    data.forEach((item) => {
        var cityName = item.city;
        var neighborhoodName = item.neighborhood;
        var streetName = item.street;

        const foundCity = orderDate.find(({city}) => city === cityName);
        if(!foundCity){
            orderDate.push(
                {
                    "city": cityName, 
                    "neighborhoods": 
                    [
                        {
                            "neighborhoodName": neighborhoodName,
                            "streets": 
                            [
                                {
                                    "streetName": streetName,
                                    "addresses": 
                                    [
                                        {
                                            "id": item.id, 
                                            "floor": item.floor, 
                                            "size": item.size, 
                                            "price": item.price
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            );
            return;
        }
        const foundNeighborhood = foundCity.neighborhoods.find((el) => el.neighborhoodName === neighborhoodName);
        if (!foundNeighborhood) {

            foundCity.neighborhoods.push({
                "neighborhoodName": neighborhoodName,
                "streets": [
                    {
                        "streetName": streetName,
                        "addresses": [
                            {
                                "id": item.id,
                                "floor": item.floor,
                                "size": item.size,
                                "price": item.price
                            }
                        ]
                    }
                ]
            });
            return; 
        }
    
        const foundStreet = foundNeighborhood.streets.find(({ streetName: existingStreetName }) => existingStreetName === streetName);
        if (!foundStreet) {

            foundNeighborhood.streets.push({
                "streetName": streetName,
                "addresses": [
                    {
                        "id": item.id,
                        "floor": item.floor,
                        "size": item.size,
                        "price": item.price
                    }
                ]
            });
            return; 
        }
    
        // If the street already exists, push a new address
        foundStreet.addresses.push({
            "id": item.id,
            "floor": item.floor,
            "size": item.size,
            "price": item.price
        });
    })
    console.log("final return: ", JSON.stringify(orderDate));
    return {orderDate};
    /*
    data.forEach((item) => {
        var cityName = item.city;
        var neighborhood = item.neighborhood;
        var street = item.street;
        nameToNeighborhoodDict[cityName].neighborhoods[neighborhood] = {};
        var neighborhoodToSet = nameToNeighborhoodDict[cityName].neighborhoods[neighborhood];
        console.log("type", typeof(neighborhoodToSet))
        if(!neighborhoodToSet["streets"]){
            neighborhoodToSet["streets"] = {};
        }
        if(!neighborhoodToSet["streets"][street]){
            neighborhoodToSet["streets"][street] = [];
        }
        neighborhoodToSet["streets"][street].push({"id": item.id, "floor": item.floor, "size": item.size, "price": item.price});
    })
    console.log('nameToNeighborhoodDict', nameToNeighborhoodDict);
    return {nameToNeighborhoodDict};
    */
};

module.exports = {
    getOrderData
}
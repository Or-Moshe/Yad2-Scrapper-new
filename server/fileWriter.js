
const xlsx = require('xlsx');
const fs = require('fs');
const { getAllDocuments} = require("./db");

const columns = ["neighborhood", "street", "id", "numRooms", "floor", "size", "price", "link"];

const writeToExcel = async () => {
    try {
        const data = await getAllDocuments("sellingAssets");
        if(!data){
            return;
        }
        // Create a new workbook
        const workbook = xlsx.utils.book_new();

        // Group data by city
        const dataByCity = data.reduce((acc, item) => {
            const city = item.city || 'Unknown City';
            if (!acc[city]) acc[city] = [];
            item.neighborhoods.forEach(neighborhood => {
                neighborhood.streets.forEach(street => {
                    street.assets.forEach(asset => {
                        acc[city].push({
                            neighborhood: neighborhood.neighborhoodName || '',
                            street: street.streetName || '',
                            id: asset.id || '',
                            numRooms: asset.numRooms || '',
                            floor: asset.floor || '',
                            size: asset.size || '',
                            price: asset.price || '',
                            link: asset.link
                        });
                    });
                });
            });
            return acc;
        }, {});

        // Create a new sheet for each city
        Object.keys(dataByCity).forEach(city => {
            // Convert city data to worksheet format
            const worksheet = xlsx.utils.json_to_sheet(dataByCity[city], { header: columns });
            
            // Add sheet to workbook with the city's name
            xlsx.utils.book_append_sheet(workbook, worksheet, city);
        });

        // Write workbook to a file
        xlsx.writeFile(workbook, 'data.xlsx');
        console.log('Data has been written to Excel with separate sheets for each city!');
    } catch (error) {
        console.error('Error writing to Excel:', error);
    }
};

/*const fs = require("fs/promises");
const { parse } = require("json2csv");

const columns = ["city", "neighborhood", "street", "id", "floor", "size", "price"];

const writeToCSV = async(data) => {
    try {
        const formattedData = data.map(item => ({
            city: item.city || '',
            neighborhood: item.neighborhood || '',
            street: item.street || '',
            id: item.asset?.id || '',
            floor: item.asset?.floor || '',
            size: item.asset?.size || '',
            price: item.asset?.price || ''
        }));
        const csv = parse(formattedData, { fields: columns });
        await fs.writeFile('data.csv', csv, {flag: 'w', encoding:"utf-8"} );
        console.log('Data has been appended to file!');
    } catch (error) {
        console.error('Error writing to CSV:', error);
    }
};*/

module.exports = {
    //writeToCSV,
    writeToExcel
}



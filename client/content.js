
const HOST_NAMES = ['facebook', 'yad2'];

//after ole stylesheet loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("window.onload");
    const host = window.location.hostname.split(".")[1];
    if(HOST_NAMES.includes(host)){
        manager[host].get_items();
    }
});


const sendToServer = async(data) => {
    console.log(data);
    try {
        const request = new Request("http://127.0.0.1:3000/selling", {
            method: "POST",
            headers: {'Content-Type': 'application/json', }, // Make sure to set your headers correctly
            body: JSON.stringify( data )
        });
        const response = await fetch(request);
        if(!response.ok){
            throw new Error(response.statusText);
        }
        const res = await response.json();
        if(res.statusCode !== 200){
            throw new Error(res.message);
        }
        console.log(res);
    } catch (error) {
        console.error(error);
    }
};

const trimStartEnd = (str) => {
    if(!str)return undefined;
    str = str.trimStart();
    return str.trimEnd();
};

const getItemData = async(body) => {
    return new Promise((resolve, reject) => {
        let details = {};
        const heading = body.querySelector('[data-testid="heading"]');
        const address = body.querySelector('[data-testid="address"]');
        const buildingDetails = body.querySelector('[data-testid="building-details"]');
        const inPropertyDetails = body.querySelectorAll('[data-testid="in-property-item"]');
        if(heading){
            details['heading'] = heading.innerText;
        }
        if(address){
            details['address'] = address.innerText;
        }
        if(buildingDetails){
            details['buildingDetails'] = buildingDetails.innerText;
        }
        if(inPropertyDetails){
            inPropertyDetails.forEach(element => {
                details[element.innerText] = element.innerText;
            });
        }
        resolve(details);
    }); 
};

const getItems = async() => {
    const items = document.querySelectorAll('[data-nagish="feed-item-list-box"]');
    //forEach does not wait for promises to resolve before moving to the next iteration 
    //instead of using forEach, map us used to create a new array of promises. 
    const dataPromises = Array.from(items).map(async(item) => {
        const url = item.querySelector('a').href;
        const itemId = url.split('/').pop().split('?')[0];
        const contentSections =  item.querySelector('[data-nagish="content-section-title"]').querySelectorAll('span');
        const spansLength = contentSections.length;
        const assetLocation = contentSections[spansLength-2].innerText.split(',');
        const assetLocationLength = assetLocation.length;
        const assetDetails = contentSections[spansLength-1].innerText.split('•');
        const price = item.querySelector('[data-testid="price"]') ? item.querySelector('[data-testid="price"]').innerText : null;
        if(!assetLocation[2] || !assetLocation[1] || !assetLocation[0]){
            return;
        }
        const baseData = {
            type: item.dataset.testid,
            city: trimStartEnd(assetLocation[assetLocationLength-1]),
            neighborhood: trimStartEnd(assetLocation[1]),
            street: trimStartEnd(contentSections[0].innerText),
            assetType: assetLocation[0],
            asset: {
                id: itemId,
                numRooms: assetDetails[0],
                floor: assetDetails[1],
                size: assetDetails[2],
                price: price,
                link: url
            }
        };

        /*const htmlText = (await (await fetch(url)).text()); // html as text
        const body = new DOMParser().parseFromString(htmlText, 'text/html').body;
        const additionalData = await getItemData(body);*/
        return { id: itemId, ...baseData/*, ...additionalData*/ };
    });
    const data = (await Promise.all(dataPromises)).filter(item => item !== undefined); // Filter out undefined
    console.log(data);
    //sendToServer(data);
};


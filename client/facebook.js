const facebook = {

    getItems: () => {
        console.log("getitems from facebook");
        if(window.location.pathname.includes('marketplace')){
            getFromMP();
        }
    },

    getFromMP: () =>{
        
    }
};


export default class AppModel {
    static async getMenu() {
        try{
            const menuResponse = await fetch('http://localhost:4321/menu'); // get запрос по-умолчанию
            const menuBody = await menuResponse.json();

            if(menuResponse.status !== 200){
                return Promise.reject(menuBody);
            }

            return menuBody.menu;
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }


    static async addMenu({ menuID, variant = -1, day} = {
        menuID: null,
        variant: -1,
        day: ''
    }) {
        try{
            const addmenuResponse = await fetch(
                'http://localhost:4321/menu',
                {
                    method: 'POST',
                    body: JSON.stringify({ menuID, variant, day}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(addmenuResponse.status !== 200){
                const addTaslistkBody = await addmenuResponse.json();
                return Promise.reject(addTaslistkBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Menu '${variant}' was successfully added to list of dish lists`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async addDish({dishID, name, typeID} = {
        dishID: null,
        name: '',
        typeID: null
    }) {
        try{
            const addDishResponse = await fetch(
                'http://localhost:4321/dishs',
                {
                    method: 'POST',
                    body: JSON.stringify({dishID, name, typeID}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(addDishResponse.status !== 200){
                const addDishBody = await addDishResponse.json();
                return Promise.reject(addDishBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Dish '${name}' was successfully added to list of dishs`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async addDishToMenu({dishID, menuID} = {
        dishID: null,
        menuID: null
    }) {
        try{
            const addDishResponse = await fetch(
                'http://localhost:4321/dishs',
                {
                    method: 'POST',
                    body: JSON.stringify({dishID, menuID}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(addDishResponse.status !== 200){
                const addDishBody = await addDishResponse.json();
                return Promise.reject(addDishBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Dish '${dishID}' was successfully added to menu '${menuID}'`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateDish({dishID, name, typeID} = {
        dishID: null,
        name: '',
        typeID: null
    }) {
        try{
            const updateDishResponse = await fetch(
                `http://localhost:4321/dishs/${dishID}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({name, typeID}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(updateDishResponse.status !== 200){
                const updateDishBody = await updateDishResponse.json();
                return Promise.reject(updateDishBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Dish '${name}' was successfully update`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateDishes({reordereddishes = []} = {
        reordereddishes: []
    }) {
        try{
            const updateDishsResponse = await fetch(
                `http://localhost:4321/dishs`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ reordereddishes}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(updateDishsResponse.status !== 200){
                const updateDishsBody = await updateDishsResponse.json();
                return Promise.reject(updateDishsBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Dish was successfully changed`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async deleteDish({dishID } = {
        dishID: null
    }) {
        try{
            const deleteDishResponse = await fetch(
                `http://localhost:4321/dishs/${dishID}`,
                {
                    method: 'DELETE'
                }
            ); // get запрос по-умолчанию

            if(deleteDishResponse.status !== 200){
                const deleteDishBody = await deleteDishResponse.json();
                return Promise.reject(deleteDishBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Dish (ID = '${dishID}') was successfully delete from dish list`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async deleteDishFromMenu({dishID, menuID} = {
        dishID: null,
        menuID: null
    }) {
        try{
            const deleteDishResponse = await fetch(
                `http://localhost:4321/dishs/${dishID, menuID}`,
                {
                    method: 'DELETE'
                }
            ); // get запрос по-умолчанию

            if(deleteDishResponse.status !== 200){
                const deleteDishBody = await deleteDishResponse.json();
                return Promise.reject(deleteDishBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Dish (ID = '${dishID}', menuID=${menuID}) was successfully delete from dish list`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }


    static async moveDish({dishID, srcmenuID, destmenuID} = {
        dishID: null,
        srcmenuID: null,
        destmenuID: null
    }) {
        try{
            const moveDishResponse = await fetch(
                `http://localhost:4321/Menu`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({dishID, srcmenuID, destmenuID}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(moveDishResponse.status !== 200){
                const moveDishBody = await moveDishResponse.json();
                return Promise.reject(moveDishBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Dish '${dishID}}' was successfully moved from ${srcmenuID} to ${destmenuID} `
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }
}
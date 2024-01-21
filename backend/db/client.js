import pg from 'pg';

export default class DB {
    #dbClient = null;
    #dbHost = '';
    #dbPort = '';
    #dbName = '';
    #dbLogin = '';
    #dbPassword = '';

    constructor(){
        this.#dbHost = process.env.DB_HOST;
        this.#dbPort = process.env.DB_PORT;
        this.#dbName = process.env.DB_NAME;
        this.#dbLogin = process.env.DB_LOGIN;
        this.#dbPassword = process.env.DB_PASSWORD;

        this.#dbClient = new pg.Client({
            user: this.#dbLogin,
            password: this.#dbPassword,
            host: this.#dbHost,
            port: this.#dbPort,
            database: this.#dbName
        })
    }

    async connect() {
        try{
            await this.#dbClient.connect();
            console.log('DB connection established');

        } catch(error){
            console.error('Unable to connect to DB: ', error);
            return Promise.reject(error);
        }
    }

    async disconnect() {
        try{
            await this.#dbClient.end();
            console.log('DB connection was closed');
            

        } catch(error){
            console.error('Unable to disconnect to DB: ', error);
            return Promise.reject(error);
            
        }
    }
    async getMenu(){
        try {
            const menu = await this.#dbClient.query(
                'select * from menu order by variant;'

            );
            return menu.rows;

        } catch (error) {
            console.error('Unable get menu, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }
    async getDishes(){
        try {
            const dishes = await this.#dbClient.query(
                'select dishes.id, type_id, type, name, position from dishes join types t on t.id = dishes.type_id order by position;'

            );
            return dishes.rows;

        } catch (error) {
            console.error('Unable get dishes, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }


    async getTypes(){
        try {
            const dishes = await this.#dbClient.query(
                'select * from types order by position;'

            );
            return dishes.rows;

        } catch (error) {
            console.error('Unable get dishes, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }


    async getDishesFromMenu({
        menuID
    } = {menuID: null}){
        if(!menuID){
            const errMsg = `Get dishes from menu by menuID error: wrong params (id: ${menuID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        try {
            const result = await this.#dbClient.query(
                'select dish_id from menu;'

            );
            const {dish_id: dishesID} = result.rows[0];
            // const str_dishesID = '';
            // for(let dishID of dishesID){
            //     const str_dishesID = str_dishesID + "\'" + dishID + "\',";

            // }
            // console.log(str_dishesID);
            

            
            return dishesID;

        } catch (error) {
            console.error('Unable get dishes, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }

    async addMenu({
        menuID,
        variant,
        day
    } = {
        menuID: null,
        variant: -1,
        day: ''
    }){
        if(!menuID || !day || variant < 0){
            const errMsg = `Add menu error: wrong params (id: ${menuID}, day: ${day}, variant: ${variant})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'insert into menu (id, day, variant) values ($1, $2, $3);',
                [menuID, day, variant]

            );

        } catch (error) {
            console.error('Unable add menu, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }

    async addDish({
        dishID,
        name,
        typeID,

    } = {
        dishID: null,
        name: '',
        typeID: null,
    }){
        if(!dishID || !name || !typeID){
            const errMsg = `Add dish error: wrong params (id: ${dishID}, name: ${name}, typeID: ${typeID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'insert into dishes (id, name, type_id) values ($1, $2, $3);',
                [dishID, name, typeID]

            );
            

        } catch (error) {
            console.error('Unable add dish, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }
    async updateDish({
        dishID,
        name,
        typeID
    } = {
        dishID: null,
        name: '',
        typeID: null,
    }){
        if((!name && !typeID) || !dishID){
            const errMsg = `Update dish error: wrong params (id: ${dishID}, name: ${name}, typeID: ${position})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        console.log(dishID,
            name,
            typeID);

        let query = null;
        const queryParams = [];
        if(name && typeID){
            query = 'update dishes set name = $1, type_id = $2 where id = $3;';
            queryParams.push(name, typeID, dishID);
        } else if(name){
            
            query = 'update dishes set name = $1 where id = $2;';
            queryParams.push(name, dishID);
            
        } else {
            query = 'update dishes set type_id = $1 where id = $2;';
            queryParams.push(typeID, dishID);
        }
        try {
            await this.#dbClient.query(
                query,
                queryParams
            );

        } catch (error) {
            console.error('Unable update dish, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }

    }

    async editMenu({
        menuID,
        day,
        variant
    } = {
        menuID: null,
        day: '',
        variant: -1,
    }){
        if((!variant && !day) || !menuID){
            const errMsg = `Update menu error: wrong params (id: ${menuID}, day: ${day}, variant: ${variant})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        // console.log(dishID,
        //     name,
        //     typeID);

        let query = null;
        const queryParams = [];
        if(day && variant){
            query = 'update menu set day = $1, variant = $2 where id = $3;';
            queryParams.push(day, variant, menuID);
        } else if(day){
            
            query = 'update menu set day = $1 where id = $2;';
            queryParams.push(day, menuID);
            
        } else {
            query = 'update menu set variant = $1 where id = $2;';
            queryParams.push(variant, menuID);
        }
        try {
            await this.#dbClient.query(
                query,
                queryParams
            );

        } catch (error) {
            console.error('Unable update dish, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }

    }

    async deleteDish({
        dishID
    } = {
        dishID: null
    }){
        if(!dishID){
            const errMsg = `Delete dish error: wrong params (id: ${dishID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        console.log(dishID);
        try {

            
            await this.#dbClient.query(
                'delete from dishes where id = $1;',
                [dishID]

            );
            await this.#dbClient.query(
                'update menu set dish_id = array_remove(dish_id, $1)',
                [dishID]

            );

        } catch (error) {
            console.error('Unable delete dish, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }

    }

    async deleteMenu({
        menuID
    } = {
        menuID: null
    }){
        if(!menuID){
            const errMsg = `Delete menu error: wrong params (id: ${menuID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        console.log(menuID);
        try {

            
            await this.#dbClient.query(
                'delete from menu where id = $1;',
                [menuID]

            );
            

        } catch (error) {
            console.error('Unable delete menu, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }

    }

    async deleteDishFromMenu({
        dishID,
        menuID
    } = {
        dishID: null,
        menuID: null
    }){
        if(!dishID || !menuID){
            const errMsg = `Delete dish from menu error: wrong params (id: ${dishID}, menuID: ${menuID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        console.log(dishID);
        try {

            
            
            await this.#dbClient.query(
                'update menu set dish_id = array_remove(dish_id, $1) where id = $2;',
                [dishID, menuID]

            );

        } catch (error) {
            console.error('Unable delete dish, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }

    }


    async moveDish({
        dishID,
        srcmenuID,
        destmenuID
    } = {
        dishID: null,
        srcmenuID: null,
        destmenuID: null
    }){
        if(!dishID || !srcmenuID || !destmenuID){
            const errMsg = `Move dish error: wrong params (id: ${dishID}, srcID: ${srcmenuID}, destID: ${destmenuID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            
            await this.#dbClient.query(
                'update menu set dish_id = array_append(dish_id,$1) where id = $2;',
                [dishID, destmenuID]

            );
            await this.#dbClient.query(
                'update menu set dish_id = array_remove(dish_id, $1) where id = $2;',
                [dishID, srcmenuID]

            );

        } catch (error) {
            console.error('Unable move dish, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }

    }

    async addDishToMenu({
        dishID,
        menuID
    } = {
        dishID: null,
        menuID: null
    }){
        if(!dishID || !menuID){
            const errMsg = `Add dish to menu error: wrong params (id: ${dishID}, menuID: ${menuID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            
            await this.#dbClient.query(
                'update menu set dish_id = array_append(dish_id,$1) where id = $2;',
                [dishID, menuID]

            );
            

        } catch (error) {
            console.error('Unable move dish, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }

    }
};
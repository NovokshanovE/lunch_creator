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
    async getTaskLists(){
        try {
            const tasklists = await this.#dbClient.query(
                'select * from tasklist order by position;'

            );
            return tasklists.rows;

        } catch (error) {
            console.error('Unable get tasklists, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }
    async getTasks(){
        try {
            const tasks = await this.#dbClient.query(
                'select * from tasks order by tasklist_id, position;'

            );
            return tasks.rows;

        } catch (error) {
            console.error('Unable get tasks, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }

    async addTasklist({
        tasklistID,
        name,
        position = -1
    } = {
        tasklistID: null,
        name: '',
        position: -1
    }){
        if(!tasklistID || !name || position < 0){
            const errMsg = `Add tasklist error: wrong params (id: ${tasklistID}, name: ${name}, position: ${position})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'insert into tasklist (id, name, position) values ($1, $2, $3);',
                [tasklistID, name, position]

            );

        } catch (error) {
            console.error('Unable add tasklist, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }

    async addTask({
        taskID,
        text,
        position = -1,
        tasklistID
    } = {
        taskID: null,
        text: '',
        position:-1,
        tasklistID: null
    }){
        if(!tasklistID || !text || position < 0 || !taskID){
            const errMsg = `Add tasklist error: wrong params (id: ${taskID}, text: ${text}, position: ${position}, tasklistId: ${tasklistID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'insert into tasks (id, text, position, tasklist_id) values ($1, $2, $3, $4);',
                [taskID, text, position, tasklistID]

            );
            await this.#dbClient.query(
                'update tasklist set tasks = array_append(tasks, $1) where id = $2;',
                [taskID, tasklistID]

            );

        } catch (error) {
            console.error('Unable add tasklist, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }
    }
    async updateTask({
        taskID,
        text,
        position = -1
    } = {
        taskID: null,
        text: '',
        position:-1,
    }){
        if((!text && position < 0) || !taskID){
            const errMsg = `Update task error: wrong params (id: ${taskID}, text: ${text}, position: ${position})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        let query = null;
        const queryParams = [];
        if(text && position >= 0){
            query = 'update tasks set text = $1, position = $2 where id = $3;';
            queryParams.push(text, position, taskID);
        } else if(text){
            
            query = 'update tasks set text = $1 where id = $2;';
            queryParams.push(text, taskID);
            
        } else {
            query = 'update tasks set position = $1 where id = $2;';
            queryParams.push(position, taskID);
        }
        try {
            await this.#dbClient.query(
                query,
                queryParams
            );

        } catch (error) {
            console.error('Unable update tasks, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }

    }

    async deleteTask({
        taskID
    } = {
        taskID: null
    }){
        if(!taskID){
            const errMsg = `Delete task error: wrong params (id: ${taskID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }
        console.log(taskID);
        try {

            const queryResult = await this.#dbClient.query(
                'select tasklist_id from tasks where id = $1;',
                [taskID]

            );
            const {tasklist_id: tasklistID} = queryResult.rows[0];
            await this.#dbClient.query(
                'delete from tasks where id = $1;',
                [taskID]

            );
            await this.#dbClient.query(
                'update tasklist set tasks = array_remove(tasks, $1) where id = $2;',
                [taskID, tasklistID]

            );

        } catch (error) {
            console.error('Unable delete task, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }

    }


    async moveTask({
        taskID,
        srcTasklistID,
        destTasklistID
    } = {
        taskID: null,
        srcTasklistID: null,
        destTasklistID: null
    }){
        if(!taskID || !srcTasklistID || !destTasklistID){
            const errMsg = `Move task error: wrong params (id: ${taskID}, srcID: ${srcTasklistID}, destID: ${destTasklistID})`;
            console.error(errMsg);
            return Promise.reject({
                type: 'client',
                error: new Error(errMsg)
            });
        }

        try {

            await this.#dbClient.query(
                'update tasks set tasklist_id = $1 where id = $2;',
                [destTasklistID, taskID]

            );
            
            await this.#dbClient.query(
                'update tasklist set tasks = array_append(tasks,$1) where id = $2;',
                [taskID, destTasklistID]

            );
            await this.#dbClient.query(
                'update tasklist set tasks = array_remove(tasks, $1) where id = $2;',
                [taskID, srcTasklistID]

            );

        } catch (error) {
            console.error('Unable move task, error: ', error);
            return Promise.reject({
                type: 'internal',
                error
            });

        }

    }
};
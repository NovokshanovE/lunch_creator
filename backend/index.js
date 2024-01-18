import dotenv from 'dotenv';
import express, { response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url'
import DB from './db/client.js';
import { timeStamp } from 'console';

const __filename = fileURLToPath(import.meta.url); //полный путь к файлу
const __dirname = path.dirname(__filename);   //полный путь к директории


console.log(__filename, __dirname);

dotenv.config(
    {
        path: './backend/.env'
    }
);

const appHost = process.env.APP_HOST;
const appPort = process.env.APP_PORT;

console.log(appHost, appPort);
console.log(process.env);

const app = express();
const db = new DB();

// loggin middleware
app.use('*', (req, res, next) => {
    
    console.log(
        req.method,
        req.baseUrl || req.url,
        new Date().toISOString()
    );
    next(); // следующий обработчик
});

// middleware for static app files
app.use('/', express.static(path.resolve(__dirname, '../dist')));

// get tasklists and tasks
app.get('/tasklists', async (req, res) => {
    try {
        const [dbTasklists, dbTasks] = await Promise.all([db.getTaskLists(),db.getTasks()]);
        
        const tasks = dbTasks.map(({id, text, position}) => ({
            taskID: id, text, position
        })); 

        const tasklists = dbTasklists.map(tasklist => ({
            tasklistID: tasklist.id,
            name: tasklist.name,
            position: tasklist.position,
            tasks: tasks.filter(task => tasklist.tasks.indexOf(task.taskID) !== -1)
        }));

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ tasklists });


    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Getting tasklists and tasks error: ${err.error.message || err.error}`
        });
    }
});
// body parsing middleware
app.use('/tasklists', express.json())
app.post('/tasklists', async (req, res) => {
    try{
        const { tasklistID, name, position } = req.body;
        await db.addTasklist({ tasklistID, name, position});
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Add tasklist error: ${err.error.message || err.error}`
        });
    }
});


// body parsing middleware
app.use('/tasks', express.json())
// add task
app.post('/tasks', async (req, res) => {
    try{
        const { taskID, text, position, tasklistID} = req.body;
        await db.addTask({ taskID, text, position, tasklistID});
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Add task error: ${err.error.message || err.error}`
        });
    }
});

// body parsing middleware
app.use('/tasks/:taskID', express.json());
// edit task params
app.patch('/tasks/:taskID', async (req, res) => {
    try{
        const {taskID} = req.params;
        const { text, position} = req.body;
        await db.updateTask({ taskID, text, position});
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Update task params error: ${err.error.message || err.error}`
        });
    }
});

// edit several tasks position
app.patch('/tasks', async ( req, res) => {
    try{
        const { reorderedTasks } = req.body;

        await Promise.all(reorderedTasks.map(({ taskID, position}) => db.updateTask({ taskID,  position})));
        
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Update tasks error: ${err.error.message || err.error}`
        });
    }
});

// delete task
app.delete('/tasks/:taskID', async (req, res) => {
    try{
        const { taskID } = req.params;
        await db.deleteTask({ taskID });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Delete task error: ${err.error.message || err.error}`
        });
    }
});



// move task between tasklists
app.patch('/tasklists', async (req, res) => {
    try{
        const {taskID, srcTasklistID, destTasklistID } = req.body;
        await db.moveTask({taskID, srcTasklistID, destTasklistID  });

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.send();

    } catch(err) {
        switch(err.type){
            case 'client':
                res.statusCode = 400;
                res.statusMessage = 'Bad request';
                break;
            default:
                res.statusCode = 500;
                res.statusMessage = 'Internal server error';
        }
        
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Move task error: ${err.error.message || err.error}`
        });
    }
})




const server = app.listen(Number(appPort), appHost, async () => {

    try{
        await db.connect()
    } catch(error){
        console.log('Task manager app shut down');
        process.exit(100);
    }

    console.log(`Task manager app started at host http://${appHost}:${appPort}`);

    console.log(await db.getTaskLists());
    // await db.moveTask({
    //     taskID: '8384e864-d359-4c38-b3a8-1e0dd929cbd0',
    //     srcTasklistID: 'bdde8b73-e5d3-4972-91cc-fab71967f55c',
    //     destTasklistID: 'e550ac89-c93c-4944-aee5-9f4d65e9b7c7'
    // });
    // console.log(await db.getTaskLists());
    // console.log(await db.getTasks());
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closed HYYP server')
    server.close(async () => {
        await db.disconnect();
        console.log('HTTP server closed');
    });
});
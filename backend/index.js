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

// get menu and dishes
app.get('/menu', async (req, res) => {
    try {
        
        const [dbmenu, dbDishes] = await Promise.all([db.getMenu(),db.getDishes()]);
        
        const dishes = dbDishes.map(({id, type, name, position, type_id}) => ({
            dishID: id, type, name, position, type_id
        })); 
        
        const menu = dbmenu.map(menu => ({
            menuID: menu.id,
            variant: menu.variant,
            day: menu.day,
            dishes: dishes.filter(dish => menu.dish_id.indexOf(dish.dishID) !== -1)
        }));
        

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ menu });


    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Getting menu and dishes error: ${ err.error}`
        });
    }
});

app.get('/dishes', async (req, res) => {
    try {
        
        const [dbDishes] = await Promise.all([db.getDishes()]);
        
        const dishes = dbDishes.map(({id, type, name, position, type_id}) => ({
            dishID: id, type, name, position, type_id
        })); 
        
        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ dishes });


    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Getting menu and dishes error: ${ err.error}`
        });
    }
});

app.get('/types', async (req, res) => {
    try {
        
        const [dbTypes] = await Promise.all([db.getTypes()]);
        
        const types = dbTypes.map(({id, type, position}) => ({
            typeID: id, type, position
        })); 
        
        
        

        res.statusCode = 200;
        res.statusMessage = 'OK';
        res.json({ types });


    } catch (err) {
        res.statusCode = 500;
        res.statusMessage = 'Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Getting menu and dishes error: ${ err.error}`
        });
    }
});
// // body parsing middleware
app.use('/menu', express.json())
app.post('/menu', async (req, res) => {
    try{
        const { menuID, variant, day} = req.body;
        await db.addMenu({ menuID, variant, day});
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
            message: `Add menu error: ${ err.error}`
        });
    }
});


// body parsing middleware
app.use('/dishes', express.json())
// add dish
app.post('/dishes', async (req, res) => {
    try{
        const { dishID, name, typeID} = req.body;
        await db.addDish({ dishID, name, typeID});
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
            message: `Add dish error: ${ err.error}`
        });
    }
});

app.use('/dishes/:dishID', express.json())
// add dish to menu
app.post('/dishes/:dishID', async (req, res) => {
    try{
        const {dishID} = req.params;
        const { menuID} = req.body;
        await db.addDishToMenu({ dishID, menuID});
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
            message: `Add dish error: ${ err.error}`
        });
    }
});

// body parsing middleware
app.use('/dishes/:dishID', express.json());
// edit dish params
app.patch('/dishes/:dishID', async (req, res) => {
    try{
        const {dishID} = req.params;
        const { name, typeID} = req.body;
        console.log({dishID, name, typeID});
        await db.updateDish({ dishID, name, typeID});
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
            message: `Update dish params error: ${err.error}`
        });
    }
});

// edit several dishes position
app.patch('/dishes', async ( req, res) => {
    try{
        const { reordereddishes } = req.body;

        await Promise.all(reordereddishes.map(({ dishID, typeID}) => db.updateTask({ dishID,  typeID})));
        
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
            message: `Update dishes error: ${ err.error}`
        });
    }
});

app.patch('/menu/:menuID', async ( req, res) => {
    try{
        const { menuID } = req.params;
        const { day, variant } = req.body;

        await db.editMenu({menuID, day, variant});
        
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
            message: `Update menu error: ${ err.error}`
        });
    }
});

// delete dish
app.delete('/dishes/:dishID', async (req, res) => {
    try{
        const { dishID } = req.params;
        await db.deleteDish({ dishID });

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
            message: `Delete dish error: ${ err.error}`
        });
    }
});


app.delete('/menu/:menuID', async (req, res) => {
    try{
        const { menuID } = req.params;
        await db.deleteMenu({ menuID });

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
            message: `Delete menu error: ${ err.error}`
        });
    }
});


app.delete('/dishes', async (req, res) => {
    try{
        const { dishID, menuID} = req.body;
        await db.deleteDishFromMenu({ dishID , menuID});

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
            message: `Delete dish from menu by id error: ${ err.error}`
        });
    }
});



// move dish between menu
app.patch('/menu', async (req, res) => {
    try{
        const {dishID, srcmenuID, destmenuID } = req.body;
        await db.moveDish({dishID, srcmenuID, destmenuID  });

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
            message: `Move dish error: ${ err.error}`
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

    console.log(await db.getMenu());
    // await db.moveTask({
    //     dishID: '8384e864-d359-4c38-b3a8-1e0dd929cbd0',
    //     srcmenuID: 'bdde8b73-e5d3-4972-91cc-fab71967f55c',
    //     destmenuID: 'e550ac89-c93c-4944-aee5-9f4d65e9b7c7'
    // });
    // console.log(await db.getmenu());
    // console.log(await db.getdishes());
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closed HYYP server')
    server.close(async () => {
        await db.disconnect();
        console.log('HTTP server closed');
    });
});
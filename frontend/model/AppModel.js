

export default class AppModel {
    static async getTaskLists() {
        try{
            const tasklistResponse = await fetch('http://localhost:4321/tasklists'); // get запрос по-умолчанию
            const tasklistsBody = await tasklistResponse.json();

            if(tasklistResponse.status !== 200){
                return Promise.reject(tasklistsBody);
            }

            return tasklistsBody.tasklists;
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }


    static async addTaskLists({tasklistID, name, position = -1} = {
        tasklistID: null,
        name: '',
        position: -1
    }) {
        try{
            const addTasklistResponse = await fetch(
                'http://localhost:4321/tasklists',
                {
                    method: 'POST',
                    body: JSON.stringify({tasklistID, name, position}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(addTasklistResponse.status !== 200){
                const addTaslistkBody = await addTasklistResponse.json();
                return Promise.reject(addTaslistkBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Task list '${name}' was successfully added to list of task lists`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async addTask({taskID, text, position, tasklistID = -1} = {
        taskID: null,
        text: '',
        position: -1,
        tasklistID: null
    }) {
        try{
            const addTaskResponse = await fetch(
                'http://localhost:4321/tasks',
                {
                    method: 'POST',
                    body: JSON.stringify({taskID, text, position, tasklistID}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(addTaskResponse.status !== 200){
                const addTaskBody = await addTaskResponse.json();
                return Promise.reject(addTaskBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Task '${text}' was successfully added to list of tasks`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateTask({taskID, text, position = -1} = {
        taskID: null,
        text: '',
        position: -1
    }) {
        try{
            const updateTaskResponse = await fetch(
                `http://localhost:4321/tasks/${taskID}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({text, position}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(updateTaskResponse.status !== 200){
                const updateTaskBody = await updateTaskResponse.json();
                return Promise.reject(updateTaskBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Task '${text}' was successfully update`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async updateTasks({reorderedTasks = []} = {
        reorderedTasks: []
    }) {
        try{
            const updateTasksResponse = await fetch(
                `http://localhost:4321/tasks`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({ reorderedTasks}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(updateTasksResponse.status !== 200){
                const updateTasksBody = await updateTasksResponse.json();
                return Promise.reject(updateTasksBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Task was successfully changed`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }

    static async deleteTask({taskID } = {
        taskID: null
    }) {
        try{
            const deleteTaskResponse = await fetch(
                `http://localhost:4321/tasks/${taskID}`,
                {
                    method: 'DELETE'
                }
            ); // get запрос по-умолчанию

            if(deleteTaskResponse.status !== 200){
                const deleteTaskBody = await deleteTaskResponse.json();
                return Promise.reject(deleteTaskBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Task (ID = '${taskID}') was successfully delete from task list`
            };
        } catch(err){
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: err.message
            });
        }
    }


    static async moveTask({taskID, srcTasklistID, destTasklistID} = {
        taskID: null,
        srcTasklistID: null,
        destTasklistID: null
    }) {
        try{
            const moveTaskResponse = await fetch(
                `http://localhost:4321/tasklists`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({taskID, srcTasklistID, destTasklistID}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            ); // get запрос по-умолчанию

            if(moveTaskResponse.status !== 200){
                const moveTaskBody = await moveTaskResponse.json();
                return Promise.reject(moveTaskBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: `Task '${taskID}}' was successfully moved from ${srcTasklistID} to ${destTasklistID} `
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
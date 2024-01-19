import Dishlist from './Dishlist';
import AppModel from '../model/AppModel.js';

export default class App {
  #tasklists = [];

  onEscapeKeydown = (event) => {
    if (event.key === 'Escape') {
      const input = document.querySelector('.tasklist-adder__input');
      input.style.display = 'none';
      input.value = '';

      document.querySelector('.tasklist-adder__btn')
        .style.display = 'inherit';
    }
  };

  onInputKeydown = async (event) => {
    if (event.key !== 'Enter') return;

    if (event.target.value) {

      const tasklistID = crypto.randomUUID();

      try{
        const addDishlistResult = await AppModel.addDishLists({
          tasklistID,
          name: event.target.value,
          position: this.#tasklists.length
        });

        const  newDishlist = new Dishlist({
          tasklistID,
          name: event.target.value,
          position: this.#tasklists.length,
          onDropDishInDishlist: this.onDropDishInDishlist,
          addNotification: this.addNotification
  
        });

        this.#tasklists.push(newDishlist);
        newDishlist.render();

        
        this.addNotification({ text: addDishlistResult.message, type: 'success'});

      } catch (err) {
        this.addNotification({ text: err.message, type: 'error'});
        console.error(err);

      };

      
    }

    event.target.style.display = 'none';
    event.target.value = '';

    document.querySelector('.tasklist-adder__btn')
      .style.display = 'inherit';
  };

  onDropDishInDishlist = async (evt) => {
    evt.stopPropagation();

    const destDishlistElement = evt.currentTarget;
    destDishlistElement.classList.remove('tasklist_droppable');

    const movedDishID = localStorage.getItem('movedDishID');
    const srcDishlistID = localStorage.getItem('srcDishlistID');
    const destDishlistID = destDishlistElement.getAttribute('id');

    localStorage.setItem('movedDishID', '');
    localStorage.setItem('srcDishlistID', '');

    if (!destDishlistElement.querySelector(`[id="${movedDishID}"]`)) return;

    const srcDishlist = this.#tasklists.find(tasklist => tasklist.tasklistID === srcDishlistID);
    const destDishlist = this.#tasklists.find(tasklist => tasklist.tasklistID === destDishlistID);
    
    try {
      
      if (srcDishlistID !== destDishlistID) {
        
        await AppModel.moveDish({
          taskID: movedDishID,
          srcDishlistID,
          destDishlistID
        });
        // console.log('hqwjqjwq');
        const movedDish = srcDishlist.deleteDish({ taskID: movedDishID });
        destDishlist.pushDish({ task: movedDish });
  
        await srcDishlist.reorderDishs();
        // console.log('hqwjqjwq');
      }
  
      await destDishlist.reorderDishs();
      // console.log('hqwjqjwq');

      
      this.addNotification({ text: `Dish (ID: ${movedDishID}) move between tasklists`, type: 'success'});
    } catch(err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);

    }
    // const destDishsIDs = Array.from(
    //   destDishlistElement.querySelector('.tasklist__tasks-list').children,
    //   elem => elem.getAttribute('id')
    // );

    // destDishsIDs.forEach((taskID, position) => {
    //   destDishlist.getDishById({ taskID }).taskPosition = position;
    // });

    // console.log(this.#tasklists);
  };

 

  editDish = async ({ taskID, newDishName }) => {
    let fDish = null;
    for (let tasklist of this.#tasklists) {
      fDish = tasklist.getDishById({ taskID });
      if (fDish) break;
    }

    const curDishName = fDish.taskName;
    if (!newDishName || newDishName === curDishName) return;

    try{
      const updateDishResult = await AppModel.updateDish({ taskID, text: newDishName});

      fDish.taskName = newDishName;
      document.querySelector(`[id="${taskID}"] span.task__text`).innerHTML = newDishName;

      console.log(updateDishResult);
      this.addNotification({ text: updateDishResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);

    }

    
  };

  deleteDish = async ({ taskID }) => {
    let fDish = null;
    let fDishlist = null;
    for (let tasklist of this.#tasklists) {
      fDishlist = tasklist;
      fDish = tasklist.getDishById({ taskID });
      if (fDish) break;
    }


    try{
      const deleteDishResult = await AppModel.deleteDish({ taskID });

      fDishlist.deleteDish({ taskID });
      document.getElementById(taskID).remove();

      this.addNotification({ text: deleteDishResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);
    }

    
  };

  initAddDishModal() {
    const addDishModal = document.getElementById('modal-add-task');
    const cancelHandler = () => {
      addDishModal.close();
      localStorage.setItem('addDishDishlistID', '');
      addDishModal.querySelector('.app-modal__input').value = '';
    };

    const okHandler = () => {
      const tasklistID = localStorage.getItem('addDishDishlistID');
      const modalInput = addDishModal.querySelector('.app-modal__input');

      if(tasklistID && modalInput.value){
        this.#tasklists.find(tasklist => tasklist.tasklistID === tasklistID).appendNewDish({ text: modalInput.value});

      }

      cancelHandler();
    };

    addDishModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    addDishModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    addDishModal.addEventListener('close', cancelHandler);
  }

  initEditDishModal() {
    const editDishModal = document.getElementById('modal-edit-task');
    const cancelHandler = () => {
      editDishModal.close();
      localStorage.setItem('editDishID', '');
      editDishModal.querySelector('.app-modal__input').value = '';
    };

    const okHandler = () => {
      const taskID = localStorage.getItem('editDishID');
      const modalInput = editDishModal.querySelector('.app-modal__input');

      if(taskID && modalInput.value){
        this.editDish({taskID, newDishName: modalInput.value});

      }

      cancelHandler();
    };

    editDishModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    editDishModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    editDishModal.addEventListener('close', cancelHandler);
  }

  initDeleteDishModal() {
    const deleteDishModal = document.getElementById('modal-delete-task');
    const cancelHandler = () => {
      deleteDishModal.close();
      localStorage.setItem('deleteDishID', '');
    };

    const okHandler = () => {
      const taskID = localStorage.getItem('deleteDishID');

      if(taskID){
        this.deleteDish({taskID});

      }

      cancelHandler();
    };

    deleteDishModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    deleteDishModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    deleteDishModal.addEventListener('close', cancelHandler);
  }


  initNotifications() {
    const notifications = document.getElementById('app-notifications');
    notifications.show();
  }


  addNotification = ({text, type}) => {
    const notifications = document.getElementById('app-notifications');

    const notificationID = crypto.randomUUID();
    const notification = document.createElement('div');
    notification.classList.add(
      'notification',
      type === 'success' ? 'notification-success': 'notification-error'
    );

    notification.setAttribute('id', notificationID);
    notification.innerHTML = text;

    notifications.appendChild(notification);

    setTimeout(() => {document.getElementById(notificationID).remove();}, 5000)
  };

  async init() {
    document.querySelector('.tasklist-adder__btn')
      .addEventListener(
        'click',
        (event) => {
          event.target.style.display = 'none';

          const input = document.querySelector('.tasklist-adder__input');
          input.style.display = 'inherit';
          input.focus();
        }
      );

    document.addEventListener('keydown', this.onEscapeKeydown);

    document.querySelector('.tasklist-adder__input')
      .addEventListener('keydown', this.onInputKeydown);

    document.getElementById('theme-switch')
      .addEventListener('change', (evt) => {
        (evt.target.checked
          ? document.body.classList.add('dark-theme')
          : document.body.classList.remove('dark-theme'));
      });

    this.initAddDishModal();
    this.initEditDishModal(); 
    this.initDeleteDishModal();
    this.initNotifications();


    document.addEventListener('dragover', (evt) => {
      evt.preventDefault();

      const draggedElement = document.querySelector('.task.task_selected');
      const draggedElementPrevList = draggedElement.closest('.tasklist');

      const currentElement = evt.target;
      const prevDroppable = document.querySelector('.tasklist_droppable');
      let curDroppable = evt.target;
      while (!curDroppable.matches('.tasklist') && curDroppable !== document.body) {
        curDroppable = curDroppable.parentElement;
      }

      if (curDroppable !== prevDroppable) {
        if (prevDroppable) prevDroppable.classList.remove('tasklist_droppable');

        if (curDroppable.matches('.tasklist')) {
          curDroppable.classList.add('tasklist_droppable');
        }
      }

      if (!curDroppable.matches('.tasklist') || draggedElement === currentElement) return;

      if (curDroppable === draggedElementPrevList) {
        if (!currentElement.matches('.task')) return;

        const nextElement = (currentElement === draggedElement.nextElementSibling)
          ? currentElement.nextElementSibling
          : currentElement;

        curDroppable.querySelector('.tasklist__tasks-list')
          .insertBefore(draggedElement, nextElement);

        return;
      }

      if (currentElement.matches('.task')) {
        curDroppable.querySelector('.tasklist__tasks-list')
          .insertBefore(draggedElement, currentElement);

        return;
      }

      if (!curDroppable.querySelector('.tasklist__tasks-list').children.length) {
        curDroppable.querySelector('.tasklist__tasks-list')
          .appendChild(draggedElement);
      }
    });

    try{
      const tasklists = await AppModel.getDishLists();
      
      for(const tasklist of tasklists){
        const tasklistObj = new Dishlist({
          tasklistID: tasklist.tasklistID,
          name: tasklist.name,
          position: tasklist.position,
          onDropDishInDishlist: this.onDropDishInDishlist,
          addNotification: this.addNotification
          // onEditDish: this.onEditDish,
        });

        this.#tasklists.push(tasklistObj);
        tasklistObj.render();

        for( const task of tasklist.tasks){
          tasklistObj.addNewDishLocal({
            taskID: task.taskID,
            text: task.text,
            position: task.position
          });
        
        }
      }

    } catch( err) {
      this.addNotification({ text: err.message, type: 'error'});
      console.error(err);
    }
  }
};

import Menu from './Menu';
import AppModel from '../model/AppModel.js';

export default class App {
  #menus = [];

  onEscapeKeydown = (event) => {
    if (event.key === 'Escape') {
      const input = document.querySelector('.menu-adder__input');
      input.style.display = 'none';
      input.value = '';

      document.querySelector('.menu-adder__btn')
        .style.display = 'inherit';
    }
  };

  onInputKeydown = async (event) => {
    if (event.key !== 'Enter') return;

    if (event.target.value) {

      const menuID = crypto.randomUUID();

      try{
        const addMenuResult = await AppModel.addMenu({
          menuID,
          name: event.target.value,
          variant: this.#menus.length
        });

        const  newMenu = new Menu({
          menuID,
          name: event.target.value,
          variant: this.#menus.length,
          onDropDishInMenu: this.onDropDishInMenu,
          addNotification: this.addNotification
  
        });

        this.#menus.push(newMenu);
        newMenu.render();

        
        this.addNotification({ name: addMenuResult.message, type: 'success'});

      } catch (err) {
        this.addNotification({ name: err.message, type: 'error'});
        console.error(err);

      };

      
    }

    event.target.style.display = 'none';
    event.target.value = '';

    document.querySelector('.menu-adder__btn')
      .style.display = 'inherit';
  };

  onDropDishInMenu = async (evt) => {
    evt.stopPropagation();

    const destMenuElement = evt.currentTarget;
    destMenuElement.classList.remove('menu_droppable');

    const movedDishID = localStorage.getItem('movedDishID');
    const srcmenuID = localStorage.getItem('srcmenuID');
    const destmenuID = destMenuElement.getAttribute('id');

    localStorage.setItem('movedDishID', '');
    localStorage.setItem('srcmenuID', '');

    if (!destMenuElement.querySelector(`[id="${movedDishID}"]`)) return;

    const srcMenu = this.#menus.find(menu => menu.menuID === srcmenuID);
    const destMenu = this.#menus.find(menu => menu.menuID === destmenuID);
    
    try {
      
      if (srcmenuID !== destmenuID) {
        console.log({
          dishID: movedDishID,
          srcmenuID,
          destmenuID
        });
        
        await AppModel.moveDish({
          dishID: movedDishID,
          srcmenuID,
          destmenuID
        });
        // console.log('hqwjqjwq');
        const movedDish = srcMenu.deleteDish({ dishID: movedDishID });
        destMenu.pushDish({ dish: movedDish });
  
        // await srcMenu.reorderDishes();
        // console.log('hqwjqjwq');
      }
  
      // await destMenu.reorderDishes();
      // console.log('hqwjqjwq');

      
      this.addNotification({ name: `Dish (ID: ${movedDishID}) move between menus`, type: 'success'});
    } catch(err) {
      this.addNotification({ name: err.message, type: 'error'});
      console.error(err);

    }
    // const destDishsIDs = Array.from(
    //   destMenuElement.querySelector('.menu__dishes-list').children,
    //   elem => elem.getAttribute('id')
    // );

    // destDishsIDs.forEach((dishID, position) => {
    //   destMenu.getDishById({ dishID }).dishPosition = position;
    // });

    // console.log(this.#menus);
  };

 

  editDish = async ({ dishID, newDishName }) => {
    let fDish = null;
    for (let menu of this.#menus) {
      fDish = menu.getDishById({ dishID });
      if (fDish) break;
    }

    const curDishName = fDish.dishName;
    if (!newDishName || newDishName === curDishName) return;

    try{
      const updateDishResult = await AppModel.updateDish({ dishID, name: newDishName});

      fDish.dishName = newDishName;
      document.querySelector(`[id="${dishID}"] span.dish__text`).innerHTML = newDishName;

      // console.log(updateDishResult);
      this.addNotification({ name: updateDishResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ name: err.message, type: 'error'});
      console.error(err);

    }

    
  };

  deleteDish = async ({ dishID }) => {
    let fDish = null;
    let fMenu = null;
    for (let menu of this.#menus) {
      fMenu = menu;
      fDish = menu.getDishById({ dishID });
      if (fDish) break;
    }


    try{
      const deleteDishResult = await AppModel.deleteDish({ dishID });

      fMenu.deleteDish({ dishID });
      document.getElementById(dishID).remove();

      this.addNotification({ name: deleteDishResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ name: err.message, type: 'error'});
      console.error(err);
    }

    
  };


  deleteDishFromMenu = async ({ dishID }) => {
    const menuID = localStorage.getItem('deleteDishFromMenuID');
    let fDish = null;
    let fMenu = null;
    for (let menu of this.#menus) {
      if(menu.menuID === menuID){
        fMenu = menu;
        fDish = menu.getDishById({ dishID });

      }
      
      if (fDish) break;
    }
    try{

      const deleteDishResult = await AppModel.deleteDishFromMenu({ dishID , menuID});

      fMenu.deleteDish({ dishID });
      document.getElementById(menuID).getElementsByClassName('menu__dishes-list')[0].children[dishID].remove();

      this.addNotification({ name: deleteDishResult.message, type: 'success'});
      
      this.addNotification({ name: deleteDishResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ name: err.message, type: 'error'});
      console.error(err);
    }

    
  };

 async initAddDishToMenuModal() {
    const addDishModal = document.getElementById('modal-add-dish');
    const dishes = await AppModel.getDishes();
    const label_element = document.getElementById('label_add_element_to_menu');
    // console.log(dishes);
    
    const selectElement = document.createElement('select');
    const id_selected = crypto.randomUUID();//'selected_add_to_menu';
    localStorage.setItem('selected_add_to_menu', id_selected);
    selectElement.setAttribute('id', id_selected);
    selectElement.setAttribute('class', 'app-modal__select');
    for(let dish of dishes){
      const optionElement = document.createElement('option');
      optionElement.innerHTML = `${dish['name']} [${dish['type']}]`;
      optionElement.setAttribute('value', dish['dishID']);
      selectElement.appendChild(optionElement);

    }
    label_element.after(selectElement);



    const cancelHandler = () => {
      addDishModal.close();
      localStorage.setItem('addDishMenuID', '');
      localStorage.setItem('selected_add_dish', '');
      addDishModal.querySelector('.app-modal__select').value = '';
    };

    const okHandler = () => {
      const menuID = localStorage.getItem('addDishMenuID');
      // const modalInput = addDishModal.querySelector('.app-modal__input');
      const id_selected = localStorage.getItem('selected_add_to_menu');
      const selectElement = document.getElementById(id_selected);
      const dishID = String(selectElement.options[selectElement.selectedIndex].value);
      // console.log(dishID);
      if(menuID){
        this.#menus.find(menu => menu.menuID === menuID).appendNewDishToMenu({ dishID });

      }

      cancelHandler();
    };

    addDishModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    addDishModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    addDishModal.addEventListener('close', cancelHandler);
  }

  async initAddDishModal(){
    const addDishModal = document.getElementById('modal-add-dish-to-base');
    const types = await AppModel.getTypes();
    const buttom_element = document.getElementById('buttoms_module_add');
    console.log(types);

    const selectElement = document.createElement('select');
    const id_selected = crypto.randomUUID();
    localStorage.setItem('selected_add_dish', id_selected);
    selectElement.setAttribute('id', id_selected);
    selectElement.setAttribute('class', 'app-modal__select');
    for(let type of types){
      const optionElement = document.createElement('option');
      optionElement.innerHTML = type['type'];
      optionElement.setAttribute('value', type['typeID']);
      selectElement.appendChild(optionElement);

    }
    buttom_element.before(selectElement);
    
    const cancelHandler = () => {
      addDishModal.close();
      localStorage.setItem('addDishMenuID', '');
      
      addDishModal.querySelector('.app-modal__select').value = '';
      const id_selected = localStorage.getItem('selected_add_dish');
      const selectElement = document.getElementById(id_selected);
      // selectElement.remove();
      localStorage.setItem('selected_add_dish', '');

    };

    const okHandler = async () => {
      const modalInput = addDishModal.querySelector('.app-modal__input');
      const id_selected = localStorage.getItem('selected_add_dish');
      const selectElement = document.getElementById(id_selected);
      const typeID = String(selectElement.options[selectElement.selectedIndex].value);
      const name = modalInput.value;
      const dishID = crypto.randomUUID();
      await AppModel.addDish({dishID, name, typeID});
      
      // document.render;
      // document.getElementById('selected_add_to_menu').remove();
      // this.initAddDish();

      //this.initAddDishToMenuModal();

      cancelHandler();
    };

    addDishModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    addDishModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    addDishModal.addEventListener('close', cancelHandler);
  }


  async initAddMenuModal() {
    const addDishModal = document.getElementById('modal-add-dish-to-base');
    const menus = await AppModel.getMenu();
    const buttom_element = document.getElementById('buttoms_module_add');
    console.log(types);

    const selectElement = document.createElement('select');
    const id_selected = crypto.randomUUID();
    localStorage.setItem('selected_add_dish', id_selected);
    selectElement.setAttribute('id', id_selected);
    selectElement.setAttribute('class', 'app-modal__select');
    for(let type of types){
      const optionElement = document.createElement('option');
      optionElement.innerHTML = type['type'];
      optionElement.setAttribute('value', type['typeID']);
      selectElement.appendChild(optionElement);

    }
    buttom_element.before(selectElement);
    
    const cancelHandler = () => {
      addDishModal.close();
      localStorage.setItem('addDishMenuID', '');
      localStorage.setItem('selected_add_dish', '');
      addDishModal.querySelector('.app-modal__select').value = '';

    };

    const okHandler = async () => {
      const modalInput = addDishModal.querySelector('.app-modal__input');
      const id_selected = localStorage.getItem('selected_add_dish');
      const selectElement = document.getElementById(id_selected);
      const typeID = String(selectElement.options[selectElement.selectedIndex].value);
      const name = modalInput.value;
      const dishID = crypto.randomUUID();
      await AppModel.addDish({dishID, name, typeID});
      // document.getElementById('selected_add_to_menu').remove();
      // this.initDeleteDishFromMenuModal

      //this.initAddDishToMenuModal();

      cancelHandler();
    };

    addDishModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    addDishModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    addDishModal.addEventListener('close', cancelHandler);
  }

  initEditDishModal() {
    const editDishModal = document.getElementById('modal-edit-dish');
    const cancelHandler = () => {
      editDishModal.close();
      localStorage.setItem('editDishID', '');
      editDishModal.querySelector('.app-modal__input').value = '';
    };

    const okHandler = () => {
      const dishID = localStorage.getItem('editDishID');
      const modalInput = editDishModal.querySelector('.app-modal__input');

      if(dishID && modalInput.value){
        this.editDish({dishID, newDishName: modalInput.value});

      }

      cancelHandler();
    };

    editDishModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    editDishModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    editDishModal.addEventListener('close', cancelHandler);
  }

  initDeleteDishModal() {
    const deleteDishModal = document.getElementById('modal-delete-dish-from-base');
    const cancelHandler = () => {
      deleteDishModal.close();
      localStorage.setItem('deleteDishID', '');
    };

    // const okHandler = () => {
    //   const dishID = localStorage.getItem('deleteDishID');

    //   if(dishID){
    //     this.deleteDish({dishID});

    //   }

    //   cancelHandler();
    // };

    // deleteDishModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    deleteDishModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    deleteDishModal.addEventListener('close', cancelHandler);
  }

  initDeleteDishFromMenuModal() {
    const deleteDishModal = document.getElementById('modal-delete-dish');
    
    const cancelHandler = () => {
      deleteDishModal.close();
      localStorage.setItem('deleteDishID', '');
    };




    const okHandler = () => {
      const dishID = localStorage.getItem('deleteDishID');

      
        
        // this.#menus.find(menu => menu.menuID === menuID).appendNewDishToMenu({ dishID });
  
        
      this.deleteDishFromMenu({dishID});

      

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


  addNotification = ({name, type}) => {
    const notifications = document.getElementById('app-notifications');

    const notificationID = crypto.randomUUID();
    const notification = document.createElement('div');
    notification.classList.add(
      'notification',
      type === 'success' ? 'notification-success': 'notification-error'
    );

    notification.setAttribute('id', notificationID);
    notification.innerHTML = name;

    notifications.appendChild(notification);

    setTimeout(() => {document.getElementById(notificationID).remove();}, 5000)
  };

  async init() {
    document.querySelector('.menu-adder__btn')
      .addEventListener(
        'click',
        (event) => {
          event.target.style.display = 'none';

          const input = document.querySelector('.menu-adder__input');
          input.style.display = 'inherit';
          input.focus();
        }
      );

    document.addEventListener('keydown', this.onEscapeKeydown);

    // document.querySelector('.menu-adder__input')
    //   .addEventListener('keydown', this.onInputKeydown);

    document.getElementById('theme-switch')
      .addEventListener('change', (evt) => {
        (evt.target.checked
          ? document.body.classList.add('dark-theme')
          : document.body.classList.remove('dark-theme'));
      });

    this.initAddDishToMenuModal();
    this.initEditDishModal(); 
    // this.initDeleteDishModal();
    this.initNotifications();
    this.initDeleteDishFromMenuModal()
    this.initAddDishModal();
    this.initDeleteDishModal();

    const addMenuBtn = document.getElementById('menu-adder__btn');
    addMenuBtn.addEventListener('click', () => {
      document.getElementById('modal-add-menu').showModal();
    });
    


    document.getElementById('append-btn').addEventListener('click', () => {
      document.getElementById('modal-add-dish-to-base').showModal();
    });

    document.getElementById('change-btn').addEventListener('click', () => {
      document.getElementById('modal-edit-dish').showModal();
    });

    document.getElementById('delete-btn').addEventListener('click', () => {
      document.getElementById('modal-delete-dish-from-base').showModal();
    });
    
    document.addEventListener('dragover', (evt) => {
      evt.preventDefault();

      const draggedElement = document.querySelector('.dish.dish_selected');
      const draggedElementPrevList = draggedElement.closest('.menu');

      const currentElement = evt.target;
      const prevDroppable = document.querySelector('.menu_droppable');
      let curDroppable = evt.target;
      while (!curDroppable.matches('.menu') && curDroppable !== document.body) {
        curDroppable = curDroppable.parentElement;
      }

      if (curDroppable !== prevDroppable) {
        if (prevDroppable) prevDroppable.classList.remove('menu_droppable');

        if (curDroppable.matches('.menu')) {
          curDroppable.classList.add('menu_droppable');
        }
      }

      if (!curDroppable.matches('.menu') || draggedElement === currentElement) return;

      if (curDroppable === draggedElementPrevList) {
        if (!currentElement.matches('.dish')) return;

        const nextElement = (currentElement === draggedElement.nextElementSibling)
          ? currentElement.nextElementSibling
          : currentElement;

        curDroppable.querySelector('.menu__dishes-list')
          .insertBefore(draggedElement, nextElement);

        return;
      }

      if (currentElement.matches('.dish')) {
        curDroppable.querySelector('.menu__dishes-list')
          .insertBefore(draggedElement, currentElement);

        return;
      }

      if (!curDroppable.querySelector('.menu__dishes-list').children.length) {
        curDroppable.querySelector('.menu__dishes-list')
          .appendChild(draggedElement);
      }
    });

    try{
      const menus = await AppModel.getMenu();
      console.log(menus);
      for(const menu of menus){
        const menuObj = new Menu({
          menuID: menu.menuID,
          day: menu.day,
          variant: menu.variant,
          onDropDishInMenu: this.onDropDishInMenu,
          addNotification: this.addNotification
          // onEditDish: this.onEditDish,
        });

        this.#menus.push(menuObj);
        menuObj.render();

        for( const dish of menu.dishes){
          menuObj.addNewDishLocal({
            dishID: dish.dishID,
            name: dish.name,
            typeID: dish.type_id,
            position: dish.position,
            type: dish.type,
            menuID: menu.menuID
          });
          // console.log(dish.name);
        
        }
      }

    } catch( err) {
      this.addNotification({ name: err.message, type: 'error'});
      console.error(err);
    }
  }
};

import Menu from './Menu';
import AppModel from '../model/AppModel.js';

export default class App {
  #menus = [];

  onEscapeKeydown = (event) => {
    if (event.key === 'Escape') {
      const input = document.querySelector('.menu-adder__input');
      // input.style.display = 'none';
      // input.value = '';

      // document.querySelector('.menu-adder__btn')
      //   .style.display = 'inherit';
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

    // document.querySelector('.menu-adder__btn')
    //   .style.display = 'inherit';
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
      const dishes = await AppModel.getDishes();
      let curType = '';
      //console.log(menus);
      //console.log(dishID);
     // console.log(menus);
      let flag = true;
      
      for( let dish of dishes){
        //console.log("---", dish.dishID, "---", dishID);
        if(dish.dishID === movedDishID){
          //console.log("YES");
          curType = dish.type_id;
          
        }
      }
      for( let dish of destMenu.dishes){
        //console.log(dish.dishType, curType);
        if(dish.dishType === curType){

          this.addNotification({ name: "To many same types", type: 'error'});
          flag = false;
          location.reload();
          return;
        }
      }


      if (srcmenuID !== destmenuID && flag) {
        //console.log({
        //   dishID: movedDishID,
        //   srcmenuID,
        //   destmenuID
        // });
        
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
      //location.reload();
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

 

  editDish = async ({ dishID, newDishName, typeID }) => {
    let fDish = null;
    for (let menu of this.#menus) {
      fDish = menu.getDishById({ dishID });
      for(let dish of menu.dishes){
        if(dish.dishID != dishID && dish.dishType === typeID){
          this.addNotification({ name: `Error: This type is already busy in menu ${menu.menuDay} №${menu.menuVariant}`, type: 'error'});
          return;
        }
      }
      if (fDish) break;
    }
    
    // const curDishName = fDish.dishName();
    if (!newDishName) return;

    try{
      const updateDishResult = await AppModel.updateDish({ dishID: dishID, name: newDishName, typeID: typeID});
      // console.log(dishID);
      if(fDish){
        fDish.dishName = newDishName;
        document.querySelector(`[id="${dishID}"] span.dish__text`).innerHTML = newDishName;
      }
      
      
      

      // console.log(updateDishResult);
      this.addNotification({ name: updateDishResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ name: err.message, type: 'error'});
      console.error(err);

    }

    
  };
  deleteMenu = async ({menuID}) => {
    if(document.getElementById(menuID)){
      document.getElementById(menuID).remove();
    }
    const deleteMenuIndex = this.#menus.findIndex(menu => menu.menuID === menuID);

    if (deleteMenuIndex === -1) return;


    const [deletedMenu] = this.#menus.splice(deleteMenuIndex, 1);

    
    console.log(document.getElementById(menuID));

    AppModel.deleteMenu({menuID});
    
    
  }
  deleteDish = async ({ dishID }) => {
    //console.log(dishID);
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
      //console.log(dishID);
      if(document.getElementById(dishID)){
        document.getElementById(dishID).remove();
      }
        

      this.addNotification({ name: deleteDishResult.message, type: 'success'});

    } catch (err) {
      this.addNotification({ name: err.message, type: 'error'});
      console.error(err);
    }

    
  };

  addDishToMenu = async ({menuID, dishID}) => {

    let curMenu = null;
    //console.log({menuID, dishID});
    if(!menuID){
      return;

    }
    curMenu = this.#menus.find(menu => menu.menuID === menuID);//.appendNewDishToMenu({ dishID });
    try{
      const dishes = await AppModel.getDishes();
      let curType = '';
      //console.log(menus);
      //console.log(dishID);
     // console.log(menus);
      
      
      for( let dish of dishes){
        //console.log("---", dish.dishID, "---", dishID);
        if(dish.dishID === dishID){
          //console.log("YES");
          curType = dish.type_id;
          
          }
        }
        
      //console.log(curMenu.dishes);
      for( let dish of curMenu.dishes){
        //console.log(dish.dishType, curType);
        if(dish.dishType === curType){

          this.addNotification({ name: "To many same types", type: 'error'});
          return;
        }
      }

      curMenu.appendNewDishToMenu({ dishID });
      this.addNotification({ name: "success", type: 'success'});
    }

    catch (err) {
      this.addNotification({ name: err.message, type: 'error'});
      console.error(err);
    }

  }

  addMenu = async ({variant, day }) => {
    //console.log({ variant, day });


    try{
      for(let m_i of this.#menus){
        // console.log("------");
        // console.log(m_i.menuDay);
        // console.log(typeof(m_i.menuVariant));
        // console.log("------");
        // console.log(typeof(day));
        // console.log(typeof(variant));
        // console.log("------");
        if(m_i.menuDay === day && String(m_i.menuVariant) === variant){
          this.addNotification({ name: "This menu was alredy created", type: 'error'});
          return;
        }
      }
      const menuID = crypto.randomUUID();
      const addMenuResult = await AppModel.addMenu({menuID, variant, day});
      const newMenu = new Menu({
        menuID,
        day: day,
        variant: variant,
        onDropDishInMenu: this.onDropDishInMenu,
        addNotification: this.addNotification});
      this.#menus.push(newMenu);

        //this.#menus.push(newMenu);
      newMenu.render();

      this.addNotification({ name: addMenuResult.message, type: 'success'});

    } catch (err) {
      this.addNotification({ name: err.message, type: 'error'});
      console.error(err);
    }

    
  };


  editMenu = async ({menuID, variant, day }) => {
    //console.log({ variant, day });


    try{
      let curMenu = null;
      for(let m_i of this.#menus){
        if(m_i.menuDay === day && String(m_i.menuVariant) === variant && m_i.menuID != menuID){
          this.addNotification({ name: "This menu was alredy created", type: 'error'});
          return;
        }
        if(m_i.menuID === menuID){
          curMenu = m_i;
        }
      }
      
      const editMenuResult = await AppModel.editMenu({menuID, variant, day});
      if(document.getElementById(menuID)){
        document.getElementById(menuID).remove();
      }

      // curMenu.editMenu({variant, day});
      location.reload();

      // for(const menu of this.#menus){
      //   const menuObj = menu;

      //   //this.#menus.push(menuObj);
      //   menuObj.render();
      //   for(let dish of menuObj.dishes){
      //     dish.render();
      //   }
      // }
      
      //curMenu.render();

      this.addNotification({ name: editMenuResult.message, type: 'success'});

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
      //console.log({menuID, dishID});
      this.addDishToMenu({menuID, dishID});
      

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
    //console.log(types);

    const selectElement = document.createElement('select');
    const id_selected = 'selected_add_dish';//crypto.randomUUID();
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
      const id_selected = 'selected_add_dish';//localStorage.getItem('selected_add_dish');
      const selectElement = document.getElementById(id_selected);
      console
      const typeID = String(selectElement.options[selectElement.selectedIndex].value);
      const name = modalInput.value;
      const dishID = crypto.randomUUID();
      await AppModel.addDish({dishID, name, typeID});
      location.reload();
      
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
    const addMenuModal = document.getElementById('modal-add-menu');
    //const selectElement = document.createElement('select');
    //const menus = await AppModel.getMenu();
    // const buttom_element = document.getElementById('buttoms_module_add_menu');
    // console.log("Menu:", menus);
    // const variants = [];
      
    
    // const id_selected = 'selected_add_menu';//crypto.randomUUID();
    // localStorage.setItem('selected_add_menu', id_selected);
    // selectElement.setAttribute('id', id_selected);
    // selectElement.setAttribute('class', 'app-modal__select');
    // let count = 0;
    // let i = -1;

    // let m_i = 0;
    // const selectDay = document.getElementById('week_select_add');
    // const day_selected = String(selectDay.options[selectDay.selectedIndex].value);
    // while(count <= 10){
    //   i+=1;
      
    //   for(let m_i of menus){
    //     if(m_i.day === day_selected && i===m_i.variant){

    //     }
    //   }
        
        
      
      
    //     console.log("variant = ", i+1);
    //       const optionElement = document.createElement('option');
    //       optionElement.innerHTML = i;
    //       optionElement.setAttribute('value', i);
    //       selectElement.appendChild(optionElement);
    //       count += 1;
        
    //   }
    // }
    // buttom_element.before(selectElement);
    const cancelHandler = () => {
      addMenuModal.close();
      localStorage.setItem('addDishMenuID', '');
      localStorage.setItem('selected_add_menu', '');
      //addMenuModal.querySelector('.app-modal__select').value = 0;
      //document.setE('number-input-add-menu');
      const id_selected = localStorage.getItem('selected_add_menu');
      const selectElement = document.getElementById(id_selected);
      // selectElement.remove();
      localStorage.setItem('selected_add_dish', '');
      // location.reload();

    };
    const okHandler = async () => {
      
      //const modalInput = addMenuModal.querySelector('.app-modal__input');
      const id_selected = 'selected_add_menu';//localStorage.getItem('selected_add_menu');
      const selectVariant = document.getElementById('number-input-add-menu');
      const selectDay = document.getElementById('week_select_add');
      const variant = selectVariant.value;
      const day = String(selectDay.options[selectDay.selectedIndex].value);
      //console.log(variant);
      this.addMenu({variant, day});

      // document.getElementById('selected_add_to_menu').remove();
      // this.initDeleteDishFromMenuModal

      //this.initAddDishToMenuModal();

      cancelHandler();
    };

    addMenuModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    addMenuModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    addMenuModal.addEventListener('close', cancelHandler);
  }

  async initEditDishModal() {
    const editDishModal = document.getElementById('modal-edit-dish');
    
    
    
    const types = await AppModel.getTypes();
    const input_element = document.getElementById('modal-edit-dish-input');
    //console.log(types);

    const selectElement = document.createElement('select');
    const id_selected = 'selected_edit_dish';//crypto.randomUUID();
    localStorage.setItem('selected_edit_dish', id_selected);
    selectElement.setAttribute('id', id_selected);
    selectElement.setAttribute('class', 'app-modal__select');
    for(let type of types){
      const optionElement = document.createElement('option');
      optionElement.innerHTML = type['type'];
      optionElement.setAttribute('value', type['typeID']);
      selectElement.appendChild(optionElement);

    }
    input_element.after(selectElement);

    const dishes = await AppModel.getDishes();
    // console.log(dishes);
    
    const selectElementDish = document.createElement('select');
    const id_selected1 = 'selected_dish_update';crypto.randomUUID();//'selected_add_to_menu';
    localStorage.setItem('selected_dish_update', id_selected1);
    selectElementDish.setAttribute('id', id_selected1);
    selectElementDish.setAttribute('class', 'app-modal__select');
    for(let dish of dishes){
      const optionElement = document.createElement('option');
      optionElement.innerHTML = `${dish['name']} [${dish['type']}]`;
      optionElement.setAttribute('value', "_"+dish['dishID']);
      selectElementDish.appendChild(optionElement);

    }
    input_element.before(selectElementDish);





    const cancelHandler = () => {
      editDishModal.close();
      localStorage.setItem('editDishID', '');
      editDishModal.querySelector('.app-modal__input').value = '';
      location.reload();
    };

    const okHandler = () => {
      // const dishID = localStorage.getItem('selected_dish_update');
      const modalInput = editDishModal.querySelector('.app-modal__input');
      const id_selected = 'selected_edit_dish';//localStorage.getItem('selected_add_menu');
      const selectElement = document.getElementById(id_selected);
      const typeID = String(selectElement.options[selectElement.selectedIndex].value);
      const id_selected1 = 'selected_dish_update';//localStorage.getItem('selected_add_menu');
      const selectElement1 = document.getElementById(id_selected1);
      const dishID = String(selectElement1.options[selectElement1.selectedIndex].value).replace('_','');

      if(dishID && modalInput.value){
        this.editDish({dishID, newDishName: modalInput.value, typeID});

      }

      cancelHandler();
    };

    editDishModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    editDishModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    editDishModal.addEventListener('close', cancelHandler);
  }

  async initDeleteDishModal() {
    const deleteDishModal = document.getElementById('modal-delete-dish-from-base');

    const dishes = await AppModel.getDishes();
    const buttom_element = document.getElementById('buttoms_module_delete_from_base');
    //console.log(dishes);

    const selectElement = document.createElement('select');
    const id_selected = 'deleteDishID';//crypto.randomUUID();
    localStorage.setItem('deleteDishID', id_selected);
    selectElement.setAttribute('id', id_selected);
    selectElement.setAttribute('class', 'app-modal__select');
    for(let dish of dishes){
      const optionElement = document.createElement('option');
      optionElement.innerHTML = `${dish.name} [${dish['type']}]\n ${dish.dishID}` ;
      optionElement.setAttribute('value', "_"+dish.dishID);
      selectElement.appendChild(optionElement);

    }
    buttom_element.before(selectElement);
    const cancelHandler = () => {
      deleteDishModal.close();
      localStorage.setItem('deleteDishID', '');
      location.reload();
    };

    const okHandler = () => {
      const id_selected = 'deleteDishID';//localStorage.getItem('deleteDishID');
      const selectVariant = document.getElementById(id_selected);
      const dishID = String(selectVariant.options[selectVariant.selectedIndex].value).replace('_', '');

      //console.log(dishID);
      if(dishID){
        this.deleteDish({dishID});
      }

      cancelHandler();
    };

    deleteDishModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
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


  async initDeleteMenuModal() {
    const deleteMenuModal = document.getElementById('modal-delete-menu');
    //const menuID = localStorage.getItem('delete_Menu');
    console
    const cancelHandler = () => {
      deleteMenuModal.close();
      localStorage.setItem('deleteDishID', '');
    };




    const okHandler = () => {
      const menuID = localStorage.getItem('delete_Menu');

      
        
        // this.#menus.find(menu => menu.menuID === menuID).appendNewDishToMenu({ dishID });
  
      //console.log("nwnklcnwlenklcnlkwnk----------------");
      this.deleteMenu({menuID});

      

      cancelHandler();
    };

    deleteMenuModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    deleteMenuModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    deleteMenuModal.addEventListener('close', cancelHandler);
  }

  async initEditMenuModal() {
    const editMenuModal = document.getElementById('modal-edit-menu');
    // const selectElement = document.createElement('select');
    // const menus = await AppModel.getMenu();
    // const buttom_element = document.getElementById('buttoms_module_edit_menu');
    // console.log("Menu:", menus);
    // const variants = [];
      
    
    // const id_selected = 'selected_edit_menu';//crypto.randomUUID();
    // localStorage.setItem('selected_edit_menu', id_selected);
    // selectElement.setAttribute('id', id_selected);
    // selectElement.setAttribute('class', 'app-modal__select');
    // let count = 0;
    // let i = -1;

    // let m_i = 0;
    // while(count <= 10){
    //   i+=1;
      
    //   if(i < menus.length){
        
    //     if(menus[m_i]['variant'] != i+1){
    //       console.log("variant = ", i+1);
    //       const optionElement = document.createElement('option');
    //       optionElement.innerHTML = i;
    //       optionElement.setAttribute('value', i);
    //       selectElement.appendChild(optionElement);
    //       count += 1;
    //     }
    //   }
    //   else {
    //     console.log("variant = ", i+1);
    //       const optionElement = document.createElement('option');
    //       optionElement.innerHTML = i;
    //       optionElement.setAttribute('value', i);
    //       selectElement.appendChild(optionElement);
    //       count += 1;
        
    //   }
    // }
    // buttom_element.before(selectElement);
    const cancelHandler = () => {
      editMenuModal.close();
      localStorage.setItem('addDishMenuID', '');
      localStorage.setItem('selected_edit_menu', '');
      // editMenuModal.querySelector('.app-modal__select').value = '';
      const id_selected = localStorage.getItem('selected_edit_menu');
      const selectElement = document.getElementById(id_selected);
      // selectElement.remove();
      localStorage.setItem('selected_add_dish', '');
      // location.reload();

    };
    const okHandler = async () => {
      
      //const modalInput = editMenuModal.querySelector('.app-modal__input');
      const id_selected = 'selected_edit_menu';//localStorage.getItem('selected_add_menu');
      const selectVariant = document.getElementById('number-input-edit-menu');
      const selectDay = document.getElementById('week_select_edit');
      const variant = selectVariant.value;
      const day = String(selectDay.options[selectDay.selectedIndex].value);
      const menuID = localStorage.getItem('edit_Menu');
      //console.log(variant);
      this.editMenu({menuID,variant, day});
      // const newMenu = new Menu({
      //   menuID,
      //   day: day,
      //   variant: variant,
      //   onDropDishInMenu: this.onDropDishInMenu,
      //   addNotification: this.addNotification});
      // this.#menus.push(newMenu);

      //   this.#menus.push(newMenu);
        // newMenu.render();

      // document.getElementById('selected_add_to_menu').remove();
      // this.initDeleteDishFromMenuModal

      //this.initAddDishToMenuModal();

      cancelHandler();
    };

    editMenuModal.querySelector('.modal-ok-btn').addEventListener('click', okHandler);
    editMenuModal.querySelector('.modal-cancel-btn').addEventListener('click', cancelHandler);
    editMenuModal.addEventListener('close', cancelHandler);
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
          // event.target.style.display = 'none';

          const input = document.querySelector('.menu-adder__input');
          // input.style.display = 'inherit';
          // input.focus();
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
    this.initAddMenuModal();
    this.initDeleteMenuModal();
    this.initEditMenuModal();
    

    

    const addMenuBtn = document.getElementById('menu-adder__btn');
    addMenuBtn.addEventListener('click', async () => {
      // const selectElement = document.getElementById('variant_select');
      // const menus = await AppModel.getMenu();
      // const buttom_element = document.getElementById('buttoms_module_add');
      // console.log("Menu:", menus);
      // const variants = [];
        
      
      // const id_selected = crypto.randomUUID();
      // localStorage.setItem('selected_add_dish', id_selected);
      // selectElement.setAttribute('id', id_selected);
      // selectElement.setAttribute('class', 'app-modal__select');
      // let count = 0;
      // let i = -1;
      // while(count <= 10){
      //   i+=1;
      //   if(i < menus.length){
      //     console.log(count);
      //     if(menus[i]['variant'] != i+1){
      //       const optionElement = document.createElement('option');
      //       optionElement.innerHTML = i;
      //       optionElement.setAttribute('value', i);
      //       selectElement.appendChild(optionElement);
      //       count += 1;
      //     }
      //   }
      //   else {
      //     count += 1;
      //   }
        
        
        

      // }
      // buttom_element.before(selectElement);
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
      //console.log(menus);
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

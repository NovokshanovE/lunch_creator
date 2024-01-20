import Dish from './Dish';
import AppModel from '../model/AppModel';
export default class Menu {
  #dishes = [];
  #menuDay = '';
  #menuID = null;
  #menuVariant = -1;

  constructor({
    menuID = null,
    variant,
    day,
    onDropDishInMenu,
    addNotification
  }) {
    this.#menuDay = day;
    this.#menuID = menuID || crypto.randomUUID();
    this.#menuVariant = variant;
    this.onDropDishInMenu = onDropDishInMenu;
    this.addNotification = addNotification
  }

  get menuID() { return this.#menuID; }

  get menuVariant() { return this.#menuVariant; }

  pushDish = ({ dish }) => this.#dishes.push(dish);

  getDishById = ({ dishID }) => this.#dishes.find(dish => dish.dishID === dishID);

  deleteDish = async ({ dishID }) => {
    const deleteDishIndex = this.#dishes.findIndex(dish => dish.dishID === dishID);

    if (deleteDishIndex === -1) return;

    // const menus = await AppModel.getMenu();
    // // console.log(menus);
    // for(const menu of menus){
      
    //   if(menu.)
    //   for( const dish of menu.dishes){
    //     if(dish.dishID = dishID){
    //       this.addNewDishLocal({
    //         dishID: dish.dishID,
    //         name: dish.name,
    //         typeID: dish.type_id,
    //         position: dish.position,
    //         type: dish.type,
    //         menuID: menu.menuID
    //       });
    //     }
        

    //     // console.log(dish.name);
      
    //   }
    // }

    const [deletedDish] = this.#dishes.splice(deleteDishIndex, 1);

    return deletedDish;
  };

  reorderDishes = async () => {
    console.log(document.querySelector(`[id="${this.#menuID}"] .menu__dishes-list`));
    const orderedDishsIDs = Array.from(
      document.querySelector(`[id="${this.#menuID}"] .menu__dishes-list`).children,
      elem => elem.getAttribute('id')
    );


    const reorderedDishesInfo = [];


    orderedDishsIDs.forEach((dishID, position) => {
      const dish = this.#dishes.find(dish => dish.dishID === dishID);
      if(dish.dishPosition !== position){
        dish.dishPosition = position;
        reorderedDishesInfo.push({
          dishID,
          position
        });
      }
    });

    if(reorderedDishesInfo.length > 0){
      try{
        await AppModel.updateDishes({
          reordereddishes: reorderedDishesInfo
        });
      } catch(err){
        this.addNotification({ name: err.message, type: 'error'});
        console.error(err);
      }

    }

    console.log(this.#dishes);
  };

  appendNewDish = async ({ name }) => {
    

    try {
      const dishID = crypto.randomUUID();
      const addDishResult = await AppModel.addDish({
        dishID: dishID,
        name: name,
        position: this.#dishes.length,
        menuID: this.#menuID
      });

      this.addNewDishLocal({
        dishID,
        name: name, 
        position: this.#dishes.length
      });

      this.addNotification({ name: addDishResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ name: err.message, type: 'error'});
      console.error(err);
    }

    
  };

  appendNewDishToMenu = async ({ dishID }) => {
    

    try {
      
      const addDishResult = await AppModel.addDishToMenu({
        dishID: dishID,
        menuID: this.#menuID
      });
      
      const menus = await AppModel.getMenu();
      // console.log(menus);
      for(const menu of menus){
        
        if(this.#menuID === menu.menuID){
          for( const dish of menu.dishes){
            if(dish.dishID === dishID){
              this.addNewDishLocal({
                dishID: dish.dishID,
                name: dish.name,
                typeID: dish.type_id,
                position: dish.position,
                type: dish.type,
                menuID: menu.menuID
              });
            }u
        }
        
          

          // console.log(dish.name);
        
        }
      }
      


      this.addNotification({ name: addDishResult.message, type: 'success'});
    } catch (err) {
      this.addNotification({ name: err.message, type: 'error'});
      console.error(err);
    }

    
  };


  addNewDishLocal = ({dishID = null,
    name,
    position,
    typeID = null,
    type, menuID = null}) => {
    const newDish = new Dish({
      dishID, name,
      position,
      typeID,
      type,
      menuID
    });
    this.#dishes.push(newDish);
    console.log(name);
    const newDishElement = newDish.render();
    document.querySelector(`[id="${this.#menuID}"] .menu__dishes-list`)
      .appendChild(newDishElement);
  };
  render() {
    const liElement = document.createElement('li');
    liElement.classList.add(
      'menus-list__item',
      'menu'
    );
    liElement.setAttribute('id', this.#menuID);
    liElement.addEventListener(
      'dragstart',
      () => localStorage.setItem('srcmenuID', this.#menuID)
    );
    liElement.addEventListener('drop', this.onDropDishInMenu);

    const h2Element = document.createElement('h2');
    h2Element.classList.add('menu__name');
    h2Element.innerHTML = this.#menuDay + " Вариант №"+this.#menuVariant;
    liElement.appendChild(h2Element);

    const innerUlElement = document.createElement('ul');
    innerUlElement.classList.add('menu__dishes-list');
    liElement.appendChild(innerUlElement);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('menu__add-dish-btn');
    button.innerHTML = '&#10010; Добавить карточку';
    button.addEventListener('click', () => {
      localStorage.setItem('addDishMenuID', this.#menuID);
      document.getElementById('modal-add-dish').showModal();
    });
    liElement.appendChild(button);

    const adderElement = document.querySelector('.menu-adder');
    adderElement.parentElement.insertBefore(liElement, adderElement);
  }
};

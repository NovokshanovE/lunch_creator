export default class Dish {
  #dishID = '';
  #dishName = '';
  #dishPosition = -1;
  #dishType = '';
  #dishTypeID = null
  #menuID = null;
  constructor({
    dishID = null,
    name,
    position,
    typeID = null,
    type,
    menuID = null
  }) {
    this.#dishID = dishID || crypto.randomUUID();
    this.#dishName = name;
    this.#dishPosition = position;
    this.#dishTypeID = typeID;
    this.#dishType = type
    this.#menuID = menuID;
    // //conslole.log(this.#menuID);
  }

  get dishID() { return this.#dishID; }

  get dishName() { return this.#dishName; }
  get dishType() {return this.#dishTypeID}
  set dishName(value) {
    if (typeof value === 'string') {
      this.#dishName = value;
    }
  }

  set menuID(value){
    this.#menuID = value;
  }

  get menuID(){
    return this.#menuID;
  }

  get dishPosition() { return this.#dishPosition; }
  set dishPosition(value) {
    if (typeof value === 'number' && value >= 0) {
      this.#dishPosition = value;
    }
  }

  render() {
    const liElement = document.createElement('li');
    liElement.classList.add('menu__dishes-list-item', 'dish');
    liElement.setAttribute('id', this.#dishID);
    liElement.setAttribute('draggable', true);
    liElement.addEventListener('dragstart', (evt) => {
      evt.target.classList.add('dish_selected');
      localStorage.setItem('movedDishID', this.#dishID);
    });
    liElement.addEventListener('dragend', (evt) => evt.target.classList.remove('dish_selected'));

    const span = document.createElement('span');
    span.classList.add('dish__text');
    span.innerHTML = this.#dishName;
    liElement.appendChild(span);

    const controlsDiv = document.createElement('div');
    controlsDiv.classList.add('dish__controls');

    const lowerRowDiv = document.createElement('div');
    lowerRowDiv.classList.add('dish__controls-row');

    // const editBtn = document.createElement('button');
    // editBtn.setAttribute('type', 'button');
    // editBtn.classList.add('dish__contol-btn', 'edit-icon');
    // editBtn.addEventListener('click', () => {
    //   localStorage.setItem('editDishID', this.#dishID);
    //   document.getElementById('modal-edit-dish').showModal();
    // });
    // lowerRowDiv.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.setAttribute('type', 'button');
    deleteBtn.classList.add('dish__contol-btn', 'delete-icon');
    deleteBtn.addEventListener('click', () => {
      localStorage.setItem('deleteDishID', this.#dishID);
      localStorage.setItem('deleteDishFromMenuID', this.#menuID);
      const deleteDishModal = document.getElementById('modal-delete-dish');
      deleteDishModal.querySelector('.app-modal__question').innerHTML = `Задача '${this.#dishName}' будет удалена. Прододлжить?`;

      deleteDishModal.showModal();


      
    });
    lowerRowDiv.appendChild(deleteBtn);

    controlsDiv.appendChild(lowerRowDiv);

    liElement.appendChild(controlsDiv);

    return liElement;
  }
};

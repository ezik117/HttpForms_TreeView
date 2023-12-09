/*
ОПИСАНИЕ:
  Элемент HTML TreeView.

АВТОР:
  Ермолаев А.Н. (copyrighted)

ИСТОРИЯ ИЗМЕНЕНИЙ:
  2023.12.04 - Добавлен атрибут 'data-id', который теперь содержит идентификатор элементов. 
               Классический HTML element ID больше не используется.

*/

class treeView
{
  /* ====== ВНУТРЕННИЕ ПЕРЕМЕННЫЕ ========================================== */

  _componentId = null; // id DOM элемента
  _base = null; // DOM элемент
  _selectedNode = null; // последний выбранный узел
  _lastClickTimestamp = null; // время в мкс для детектирования двойного щелчка
  _storedEditableText = ""; // для хранения редактируемого текста и отмены по ESC 

  /* ====== ВНУТРЕННИЕ ФУНКЦИИ ============================================= */

  // -- конструктор -----------------------------------------------------------
  /**
   * 
   * @param {DOMElement} componentId - контейнер. Объект типа <DIV>.
   */
  constructor(componentId)
  {
    this._componentId = componentId;
    this._base = document.getElementById(componentId);
    if (!this._base)
    {
      console.log("[ERROR] TreeView base component with ID " + componentId + " is not found!");
      return;
    }
    this._base._base = this; // сохраним ссылку на объект текущего класса в DOM элементе

    // установим события 
    let nodes = this._base.getElementsByClassName("tv-row");
    for (let i=0; i<nodes.length; i++)
    {
        nodes[i].addEventListener("click", this._onNode_click, false);
        nodes[i].addEventListener("dblclick", this._onNode_dblclick, false);
        nodes[i].addEventListener("contextmenu", this._onNode_contextmenu, false);
    }

    this._lastClickTimestamp = Date.now();
  }

  // --------------------------------------------------------------------------
  /**
   * Cобытие. обработка двойного щелчка на узле.
   * 
   * @param {MouseEvent} e 
   * @returns 
   */
  _onNode_dblclick(e)
  {
    let obj = e.currentTarget.closest(".tv-control")._base;

    if (e.currentTarget.contentEditable == "true") return; // элемент редактируется, щелчки не обрабатываются

    if (e.currentTarget.classList.contains("tv-folder"))
    {
      // раскрыть/закрыть
      if (e.currentTarget.classList.contains("tv-folder-expanded"))
      {
        e.currentTarget.nextElementSibling.classList.add("tv-collapse");
        e.currentTarget.classList.remove("tv-folder-expanded");
      }
      else
      {
        e.currentTarget.nextElementSibling.classList.remove("tv-collapse");
        e.currentTarget.classList.add("tv-folder-expanded");
      }
    }
    if (obj.onNode_dblclick != null)
    {
      if (obj.getNodeType(e.currentTarget) == "folder")
      {
        obj.onNode_dblclick(e.currentTarget, e); // вызов пользовательской функции
      }
      else
      {
        if (obj.generateOnNodeDoubleClick)
        {
          obj.onNode_dblclick(e.currentTarget, e); // вызов пользовательской функции
        }
      }
    } 
    e.stopPropagation();
  }

  // --------------------------------------------------------------------------
  /**
   * Cобытие. обработка щелчка на узле.
   * 
   * @param {MouseEvent} e 
   * @returns 
   */
  _onNode_click(e)
  {
    let obj = e.currentTarget.closest(".tv-control")._base;

    if (e.currentTarget.contentEditable == "true") return; // элемент редактируется, щелчки не обрабатываются

    // детектирование двойного щелчка
    if ((Date.now() - obj._lastClickTimestamp < 500) && (obj.SelectedNode == e.currentTarget))
    {
      // это второй щелчок из dbl click
      return;
    }
    obj._lastClickTimestamp = Date.now();

    obj.SelectedNode = e.currentTarget;
    if (obj.onNode_click != null)
    {
      if (obj.getNodeType(e.currentTarget) == "node")
      {
        obj.onNode_click(e.currentTarget, e); // вызов пользовательской функции
      }
      else
      {
        if (obj.generateOnFolderClick) obj.onNode_click(e.currentTarget, e); // вызов пользовательской функции
      }
    }
    e.stopPropagation();
  }

  // --------------------------------------------------------------------------
  /**
   * Cобытие. обработка щелчка ПКМ на узле.
   * 
   * @param {MouseEvent} e 
   * @returns 
   */
  _onNode_contextmenu(e)
  {
    let obj = e.currentTarget.closest(".tv-control")._base;

    if (e.currentTarget.contentEditable == "true") return; // элемент редактируется, щелчки не обрабатываются

    if (obj.onNode_contextmenu != null)
    {
        obj.onNode_contextmenu(e.currentTarget, e); // вызов пользовательской функции
    }
    e.stopPropagation();
  }

  // --------------------------------------------------------------------------
  /**
   * Возвращает узел (DOMElement) по "data-id'. Если передан DOMElement возвращает его же.
   * 
   * @param {DOMElement | string} val - DOM элемент узла или 'data-id' узла.
   * @returns {DOMElement} - DOM-элемент узла если найдено или null.
   */
  _getElement(val)
  {
    if (!val) return null;

    let ret;
    if (typeof val === 'string')
      ret = this._base.querySelector(`[data-id='${val}']`);
    else
      ret = val;
    return ret;
  }

  // --------------------------------------------------------------------------
  /**
   * Выводит в консоль сообщение.
   * 
   * @param {object} msg 
   */
  _d(msg)
  {
    console.log(msg);
  }

  // --------------------------------------------------------------------------
  // -- вспомогательная функция для addNode и addFolder
  _addNode(parentNode, node1, node2, addToFolder)
  {
    let parent = this._getElement(parentNode);

    if (parent == null)
    {
      this._base.children[0].appendChild(node1); // append node
      if (node2 != null) node1.insertAdjacentElement('afterend', node2);
    }
    else
    {
      if (this.getNodeType(parent) == "node")
      {
        parent.insertAdjacentElement('afterend', node1); // insert after
        if (node2 != null) node1.insertAdjacentElement('afterend', node2);
      }
      else if (this.getNodeType(parent) == "folder")
      {
        if (parent.classList.contains("tv-folder-expanded") || addToFolder)
        {
          parent.nextElementSibling.children[0].appendChild(node1); // append into folder
          if (node2 != null) node1.insertAdjacentElement('afterend', node2);
        }
        else
        {
          parent.nextElementSibling.children[0].insertAdjacentElement('afterend', node1); // insert after
          if (node2 != null) node1.insertAdjacentElement('afterend', node2);
        }
      }
    }
  }

  // --------------------------------------------------------------------------
  // вызывает пользовательскую функцию onNode_beforeRemove
  /* IN: ID элемента без префикса # или ссылка на DOM элемент
     OUT: true, если можно удалять, false, если нельзя */
  _onNode_beforeRemove(node)
  {
    let el = this._getElement(node);
    let type = this.getNodeType(el);
    let hasNodes = false;
    if (type == "folder")
    {
      if (el.nextElementSibling.children.length > 0) hasNodes = true;
    }

    let canRemove = true;
    if (this.onNode_beforeRemove != null) canRemove = this.onNode_beforeRemove(el, this.getNodeInfo(el));
    if (canRemove === undefined) canRemove = true;
    return canRemove;
  }

  // --------------------------------------------------------------------------
  // вызывает пользовательскую функцию onNode_select
  /* IN: ID элемента без префикса # или ссылка на DOM элемент */
  _onNode_select(node)
  {
    let el = this._getElement(node);
    if (this.onNode_select != null) this.onNode_select(el);
  }

  // --------------------------------------------------------------------------
  // callback функция для EventHandler функции editNode()
  _editNode_keydown(e)
  {
    if (e.keyCode == 13 || e.keyCode == 27)
    {
      let obj = e.currentTarget.closest(".tv-control")._base;
      e.currentTarget.removeEventListener("focusout", obj._editNode_focusout);
      e.currentTarget.removeEventListener("keydown", obj._edidNode_keydown);
      e.currentTarget.classList.remove("tv-editable");
      e.currentTarget.contentEditable = "false";
      e.preventDefault();
      if (e.keyCode == 13 && obj.onNode_changed != null) obj.onNode_changed(e.currentTarget);
      if (e.keyCode == 27)
      {
        let obj = e.currentTarget.closest(".tv-control")._base;
        e.currentTarget.children[0].textContent = obj._storedEditableText;
      }
    }

  }

  // --------------------------------------------------------------------------
  // callback функция для EventHandler функции editNode()
  _editNode_focusout(e)
  {
    let obj = e.currentTarget.closest(".tv-control")._base;
    e.currentTarget.removeEventListener("focusout", obj._editNode_focusout);
    e.currentTarget.removeEventListener("keydown", obj._edidNode_keydown);
    e.currentTarget.classList.remove("tv-editable");
    e.currentTarget.contentEditable = "false";
    if (obj.onNode_changed != null) obj.onNode_changed(e.currentTarget);
  }

  /**
   * Раскрывает все узлы TreeView являющиеся родительскими для укзанного.
   * 
   * @param {DOMElement | string} node - DOM элемент узла или 'data-id' узла.
   */
  _expandNodePath(node)
  {
    let parent = null;
    do{
      parent = this.getParentNode(node);
      if (parent != null)
      {
        this.openFolder(parent, true);
      }
      node = parent;
    } while (parent != null);
  }

  // --------------------------------------------------------------------------
  // рекурсивная функция вставки элементов для loadJSON()
  _loadJSON(nodes, parent)
  {
    nodes.forEach(d => {
      if (d.type == "folder")
      {
        let p = this.addFolder(parent, d.id, d.text, true);
        this._loadJSON(d.nodes, p);
      }
      else if (d.type == "node")
      {
        this.addNode(parent, d.id, d.text, true);
      }
    });
  }

  // --------------------------------------------------------------------------
  // рекурсивная функция сохранения элементов для saveJSON()
  _saveJSON(parent, arr)
  {
    let rows = parent.children[0].children;

    for (let i=0; i<rows.length; i++)
    {
      if (this.getNodeType(rows[i]) == "node")
      {
        let node = {id: rows[i].id, text: rows[i].textContent, type: "node"};
        arr.nodes.push(node);
      }
      else if (this.getNodeType(rows[i]) == "folder")
      {
        let node = {id: rows[i].id, text: rows[i].textContent, type: "folder", nodes:[]};
        this._saveJSON(rows[i].nextElementSibling, node);
        arr.nodes.push(node);
      }
    }
  }

  /* ====== ПУБЛИЧНЫЕ ПЕРЕМЕННЫЕ =========================================== */

  // --------------------------------------------------------------------------
  /**
   * Возвращает DOM-элемент выбранного узла или null.
   * 
   * @returns {DOMElement} - DOM-элемент выбранного узла или null.
   */
  get SelectedNode()
  {
    return this._selectedNode;
  }

  // --------------------------------------------------------------------------
  /**
   * Выбирает узел, подсвечивает его и раскрывает все его родительские папки.
   * 
   * @param {DOMElement | string} node - DOM элемент узла или 'data-id' узла.
   */
  set SelectedNode(val)
  {
    // проверка переданного значения на допустимый тип
    if (val != null)
    {
      let checkResult = typeof(val) === "string";
      if (!checkResult)
      {
        try {
          checkResult = val.nodeName === "DIV";
        } catch {
          checkResult = false;
        }
      }
      if (!checkResult)
      {
        console.log("ERROR: Value must be 'null', string or DOM element");
        return;
      }
    }

    let el = this._getElement(val);

    let oldSelectedNode = this._selectedNode;

    if (this._selectedNode != null) this._selectedNode.classList.remove("tv-selected");
    this._selectedNode = el;
    if (el != null) 
    {
      el.classList.add("tv-selected");
      this._expandNodePath(el);

      if (oldSelectedNode != el) this._onNode_select(el);
    }
  }

  // --------------------------------------------------------------------------
  /**
   * Вовращает 'data-id' выбранного узла или null.
   * 
   * @returns {string} - Строковое значение 'data-id'.
   */
  get SelectedNodeId()
  {
    try
    {
      return this._selectedNode.getAttribute("data-id");
    }
    catch
    {
      return null;
    }
  }


  /**
   * Если true, то будет вызываться событие onNode_click для одиночного щелчка
   * на папке. По умолчанию отключено, т.к. двойной щелчок порождает вначале
   * событие onNode_click, а затем onNode_dblclick
   */
  generateOnFolderClick = false;

  /**
   * Если true, то будет вызываться событие onNode_dblclick для двойного щелчка
   * на узле. По умолчанию отключено, т.к. двойной щелчок порождает вначале
   * событие onNode_click, а затем onNode_dblclick
   */
  generateOnNodeDoubleClick = false;


  /* ====== ПУБЛИЧНЫЕ ФУНКЦИИ ============================================== */

  // --------------------------------------------------------------------------
 /**
  * Возвращает тип узла.
  * 
  * @param {DOMElement | string} node - DOM элемент узла или 'data-id' узла. 
  * @returns {string} - тип узла: "folder", "node", "null"
  */
  getNodeType(node)
  {
    let el = this._getElement(node);

    if (el.classList.contains("tv-folder")) return "folder";
    if (el.classList.contains("tv-node")) return "node";
    return "null";
  }

    // --------------------------------------------------------------------------
  /**
  * Возвращает основную информацию об узле.
  * 
  * @param {DOMElement | string} node - DOM элемент узла или 'data-id' узла. 
  * @returns {object} - id ('data-id'),
  *                     text (название),
  *                     type (тип узла),
  *                     expanded (true/false - развернут узел или нет),
  *                     length (количество дочерних элементов, если есть)
  */
  getNodeInfo(node)
  {
    let el = this._getElement(node);
    let info = {};
    if (el == null) return;
    info.id = el.getAttribute("data-id");
    info.text = el.children[0].textContent;
    info.type = this.getNodeType(el);
    info.expanded = (el.classList.contains("tv-folder-expanded") ? true : false);
    info.length = 0;
    if (info.type == "folder") info.length = el.nextElementSibling.children[0].children.length;

    return info;
  }

  // --------------------------------------------------------------------------
 /**
  * Добавляет узел типа "папка" к дереву.
  * 
  * @param {DOMElement} parentNode - Элемент или 'data-id' родительского узла, если null добавляет в корневой список
  * @param {string} newFolderId - 'data-id' новой папки, если не null
  * @param {string} newFolderText - Текст узла
  * @param {boolean} addToFolder - Если true и parentNode это папка, то добавляет узел как дочерний элемент, если false-то добавляет после с тем же уровнем
  * @returns {DOMElement} - DOM-элемент нового узла
  */
  addNode(parentNode, newNodeId, newNodeText, addToFolder=false)
  {
    let nodeRow = document.createElement("div");
    nodeRow.classList.add("tv-row", "tv-node");
    if (newNodeId != null) nodeRow.setAttribute("data-id", newNodeId);

    let nodeCol = document.createElement("div");
    nodeCol.classList.add("tv-col");

    let text = document.createTextNode(String(newNodeText));

    nodeCol.appendChild(text);
    nodeRow.appendChild(nodeCol);
    nodeRow.addEventListener("click", this._onNode_click);
    nodeRow.addEventListener("dblclick", this._onNode_dblclick);
    nodeRow.addEventListener("contextmenu", this._onNode_contextmenu);

    this._addNode(parentNode, nodeRow, null, addToFolder);

    return nodeRow;
  }

  // --------------------------------------------------------------------------
 /**
  * Добавляет узел типа "папка" к дереву.
  * 
  * @param {DOMElement} parentNode - Элемент или 'data-id' родительского узла, если null добавляет в корневой список
  * @param {string} newFolderId - 'data-id' новой папки, если не null
  * @param {string} newFolderText - Текст узла
  * @param {boolean} addToFolder - Если true и parentNode это папка, то добавляет узел как дочерний элемент, если false-то добавляет после с тем же уровнем
  * @returns {DOMElement} - DOM-элемент нового узла
  */
  addFolder(parentNode, newFolderId, newFolderText, addToFolder=false)
  {
    let folderRow = document.createElement("div");
    folderRow.classList.add("tv-row", "tv-folder");
    if (newFolderId != null) folderRow.setAttribute("data-id", newFolderId);

    let folderCol = document.createElement("div");
    folderCol.classList.add("tv-col");

    let text = document.createTextNode(String(newFolderText));

    folderCol.appendChild(text);
    folderRow.appendChild(folderCol);
    folderRow.addEventListener("click", this._onNode_click);
    folderRow.addEventListener("dblclick", this._onNode_dblclick);
    folderRow.addEventListener("contextmenu", this._onNode_contextmenu);

    let groupRow = document.createElement("div");
    groupRow.classList.add("tv-group-row", "tv-collapse");

    let groupCol = document.createElement("div");
    groupCol.classList.add("tv-group-col");

    groupRow.appendChild(groupCol);

    this._addNode(parentNode, folderRow, groupRow, addToFolder);

    return folderRow;
  }

  // --------------------------------------------------------------------------
  /**
   * Раскрывает / сворачивает указанную папку.
   * 
   * @param {DOMElement | string} node - DOM элемент узла или 'data-id' узла.
   * @param {boolean} expand - Если true (по умолчанию)-то раскрывает папку, если false-сворачивает.
   */
  openFolder(node, expand=true)
  {
    let el = this._getElement(node);

    if (el == null) return;
    if (this.getNodeType(el) != "folder") return;

    if (expand)
    {
      el.nextElementSibling.classList.remove("tv-collapse");
      el.classList.add("tv-folder-expanded");
    }
    else
    {
      el.nextElementSibling.classList.add("tv-collapse");
      el.classList.remove("tv-folder-expanded");
    }
  }

  // --------------------------------------------------------------------------
  /**
   * Раскрывает все узлы TreeView.
   */
  expandAll()
  {
    let nodes = this._base.getElementsByClassName("tv-folder");
    for (let i=0; i<nodes.length; i++)
    {
      this.openFolder(nodes[i]);
    }
  }

  // --------------------------------------------------------------------------
  /**
   * Сворачивает все узлы TreeView.
   */
  collapseAll()
  {
    let nodes = this._base.getElementsByClassName("tv-folder");
    for (let i=0; i<nodes.length; i++)
    {
      this.openFolder(nodes[i], false);
    }
  }


  // --------------------------------------------------------------------------
  /**
   * Удаляет указанный узел из TreeView.
   * 
   * @param {DOMElement | string} node - DOM элемент узла или 'data-id' узла.
   */
  deleteNode(node)
  {
    let el = this._getElement(node);
    if (el == null) return;

    if (!this._onNode_beforeRemove(el)) return;

    if (this.getNodeType(el) == "node")
    {
      el.remove();
    }
    else
    {
      el.nextElementSibling.remove();
      el.remove();
    }
  }

  // --------------------------------------------------------------------------
  /** 
   * Переводит выбранный узел в режим редактирования текста (прямой ручной ввод).
   * 
   * @param {DOMElement | string} node - DOM элемент узла или 'data-id' узла.
   * @param {boolean} enableEditing - если true, то узел переводится в режим редактирования,
   *                                  false - отменяет.
   */  
  setNodeEditable(node, enableEditing)
  {
    let el = this._getElement(node);
    if (el == null) return;

    if (enableEditing)
    {
      this._storedEditableText = el.textContent;
      el.contentEditable = "true";
      el.focus();
      el.addEventListener("keydown", this._editNode_keydown);
      el.addEventListener("focusout", this._editNode_focusout);
      el.classList.add("tv-editable");
    }
    else
    {
      el.contentEditable = "false";
      el.removeEventListener("keydown", this._editNode_keydown);
      el.removeEventListener("focusout", this._editNode_focusout);
      el.classList.remove("tv-editable");
    }
  }


  // --------------------------------------------------------------------------
  /** 
   * Удалить все содержимое из TreeView (очистка дерева).
   */  
  clear()
  {
    while (this._base.children[0].firstChild) {
      this._base.children[0].removeChild(this._base.children[0].lastChild);
    }
  }

  // --------------------------------------------------------------------------
  /** 
   * Задает текст в укзанном узле.
   * 
   * @param {DOMElement | string} node - DOM элемент узла или 'data-id' узла.
   * @param {string} text - новый текст узла TreeView.
   */  
  setNodeText(node, text)
  {
    let el = this._getElement(node);
    if (el == null) return;

    el.children[0].textContent = text;
    if (this.onNode_changed != null) this.onNode_changed(el);
  }

  // --------------------------------------------------------------------------
  /** 
   * Загружает компонент TreeView из JSON.
   * Предварительно удаляет старый контент.
   * 
   * @param {string} data - древовидная структура данных в JSON формате
   */  
  loadJSON(data)
  {
    this.clear();
    let arr = JSON.parse(data);
    
    this._loadJSON(arr.nodes, null);

    if (this.onData_loaded != null) this.onData_loaded();
  }

  // --------------------------------------------------------------------------
  /**
   * Экспортирует структуру TreeView в JSON.
   * 
   * @returns {string}: строковые данные в JSON формате
   */ 
  saveJSON()
  {
    let arr = {};
    arr.treeId = this._componentId;
    arr.nodes = [];
    this._saveJSON(this._base, arr);
    return JSON.stringify(arr);
  }

  // --------------------------------------------------------------------------
  /**
   * Возвращает DOM элемент узла по его 'data-id'.
   * 
   * @param {string} id - Строка с идентификатором 'data-id' узла.
   * @returns {object} - DOM-элемент узла
   */
  getNodeById(id)
  {
    return this._getElement(id);
  }

  // --------------------------------------------------------------------------
  // возвращает родительский элемент выбранного узла.
  /* IN: node - элемент или ID элемента
     OUT: ссылка на элемент, или Null, если родителя нет
  */ 
  getParentNode(node)
  {
    let el = this._getElement(node);
    if (el == null) return null;

    let parent = el.closest(".tv-group-col").parentElement;
    if (parent.classList.contains("tv-control")) return null;

    return parent.previousElementSibling;
  }

  // --------------------------------------------------------------------------
  /**
   * Возвращает цепочку родительских элементов выбранного узла начиная с корневого в виде массива.
   * Массив может содержать либо названия узлов, либо DOM-элементы.
   * 
   * @param {DOMElement | string} node - DOM элемент узла или 'data-id' узла.
   * @param {boolean} asText - Если true, то в массив будут помещены только названия узлов,
   *                     если false - то DOM-элементы.
   * @returns {Array} - Массив с цепочкой узлов от родительского до указанного без самого узла.
   */
  getNodeFullPath(node, asText = false)
  {
    let ret = [];
    let parent;
    do{
      parent = this.getParentNode(node);
      if (parent != null)
      {
        if (asText)
          ret.unshift(parent.children[0].textContent);
        else
          ret.unshift(parent);
      }
      node = parent;
    } while (parent != null);
  
    return ret;
  }



  /* ====== ПОЛЬЗОВАТЕЛЬСКИЕ СОБЫТИЯ ========================================*/

  // --------------------------------------------------------------------------
  /** 
   * Ссылка на пользовательскую функцию двойного щелчка onNode_dblclick(node, e)
   */
  onNode_dblclick = null;


  // --------------------------------------------------------------------------
  /** 
   * Ссылка на пользовательскую функцию двойного щелчка onNode_dblclick(node, e)
   */
  onNode_click = null;

  // --------------------------------------------------------------------------
  /** 
   * Ссылка на пользовательскую функцию щелчка ПКМ (вызов контекстного меню) onNode_contextmenu(node, e)
   */
  onNode_contextmenu = null;

  // --------------------------------------------------------------------------
  /** 
   * Ссылка на пользовательскую функцию события возникающего перед удалением узла.
   * onNode_beforeRemove(node, type, hasNodes), где:
   * - node - удаляемый элемент (DOM element)
   * - info - информация об элементе (getNodeInfo())
   * - hasNodes - true, если удаляемый узел содержит дочерние элементы.
   * Если пользовательская функция возвращает false, то удаление отменяется.
   */
  onNode_beforeRemove = null;

  // --------------------------------------------------------------------------
  /** 
   * Ссылка на пользовательскую функцию события возникающего при выборе узла (узел подсвечивается)
   */
  onNode_select = null;

  // --------------------------------------------------------------------------
  /** 
   * Ссылка на пользовательскую функцию события возникающего после изменения текста узла
   */
  onNode_changed = null;

  // --------------------------------------------------------------------------
  /** 
   * Ссылка на пользовательскую функцию события возникающего после загрузки данных JSON
   */
  onData_loaded = null;

  // --------------------------------------------------------------------------
  // СВОЙСТВА
  /*
    SelectedNode (get; set) - выбрать / получить выбранный узел
    generateOnFolderClick (get; set) - генеририровть событие одиночного щелчка на папке
    generateOnNodeDoubleClick (get; set) - генерировать событие двойного щелчка на узле
  */


}


/* 
ВСТАВКА:
 - Вставить узел:
   -- Если выбран узел, то вставит после него.
   -- Если выбрана папка и папка не открыта, то вставит после нее
   -- Если выбрана папка и папка открыта, то вставит в конец вложенных узлов папки.
 - Добавить узел:
   -- Вне зависимости от выбранного узла добавляет в конец корневых элементов
 - Вставить папку:
    -- Если выбран узел, то вставит после него.
   -- Если выбрана папка и папка не открыта, то вставит после нее
   -- Если выбрана папка и папка открыта, то вставит в конец вложенных узлов папки.
 - Добавить папку:
   -- Вне зависимости от выбранного узла добавляет в конец корневых элементов

 */

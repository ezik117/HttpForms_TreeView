
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
    }

    this._lastClickTimestamp = Date.now();
  }

  // --------------------------------------------------------------------------
  // событие. обработка двойного щелчка на узле
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
        obj.onNode_dblclick(e.currentTarget); // вызов пользовательской функции
      }
      else
      {
        if (obj.generateOnNodeDoubleClick)
        {
          obj.onNode_dblclick(e.currentTarget); // вызов пользовательской функции
        }
      }
    } 
    e.stopPropagation();
  }

  // --------------------------------------------------------------------------
  // событие. обработка щелчка на узле
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
        obj.onNode_click(e.currentTarget); // вызов пользовательской функции
      }
      else
      {
        if (obj.generateOnFolderClick) obj.onNode_click(e.currentTarget); // вызов пользовательской функции
      }
    }
    e.stopPropagation();
  }

  // --------------------------------------------------------------------------
  // возвращает объект по ID если передана строка или сам объект
  /* IN: ID элемента без префикса # или ссылка на DOM элемент
     OUT: ссылка на DOM элемент */
  _getElement(val)
  {
    if (!val) return null;

    let ret;
    if (typeof val === 'string')
      ret = this._base.querySelector("#" + val);
    else
      ret = val;
    return ret;
  }

  // --------------------------------------------------------------------------
  _d(msg)
  {
    console.log(msg);
  }

  // --------------------------------------------------------------------------
  // -- вспомогательная функция для addNode и addFolder
  _addNode(parentNode, node1, node2, noExpand)
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
        if (parent.classList.contains("tv-folder-expanded") || noExpand)
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
  // getter для this._selectedNode
  get SelectedNode()
  {
    return this._selectedNode;
  }

  // --------------------------------------------------------------------------
  // setter для this._selectedNode
  set SelectedNode(val)
  {
    let el = this._getElement(val);

    let oldSelectedNode = this._selectedNode;

    if (this._selectedNode != null) this._selectedNode.classList.remove("tv-selected");
    this._selectedNode = el;
    if (el != null) 
    {
      el.classList.add("tv-selected");
      if (oldSelectedNode != el) this._onNode_select(el);
    }
  }

  // если true, то будет вызываться событие onNode_click для одиночного щелчка
  // на папке. По умолчанию отключено, т.к. двойной щелчок порождает вначале
  // событие onNode_click, а затем onNode_dblclick
  generateOnFolderClick = false;

  // если true, то будет вызываться событие onNode_dblclick для двойного щелчка
  // на узле. По умолчанию отключено, т.к. двойной щелчок порождает вначале
  // событие onNode_click, а затем onNode_dblclick
  generateOnNodeDoubleClick = false;


  /* ====== ПУБЛИЧНЫЕ ФУНКЦИИ ============================================== */

  // --------------------------------------------------------------------------
  // возвращает тип узла
  /* IN: элемент или ID узла
     OUT: одно из значений: "folder", "node", "null"
  */
  getNodeType(node)
  {
    let el = this._getElement(node);

    if (el.classList.contains("tv-folder")) return "folder";
    if (el.classList.contains("tv-node")) return "node";
    return "null";
  }

    // --------------------------------------------------------------------------
  // возвращает информацию об узле
  /* IN: элемент или ID узла
     OUT: id, text, type, expanded, length (количество элементов в списке)
  */
  getNodeInfo(node)
  {
    let el = this._getElement(node);
    let info = {};
    if (el == null) return;
    info.id = el.id;
    info.text = el.children[0].textContent;
    info.type = this.getNodeType(el);
    info.expanded = (el.classList.contains("tv-folder-expanded") ? true : false);
    info.length = 0;
    if (info.type == "folder") info.length = el.nextElementSibling.children[0].children.length;

    return info;
  }

  // --------------------------------------------------------------------------
  // добавить узел
  /* IN: parentNode - элемент или ID родительского узла, если null добавляет в корневой список
         newNodeId - ID нового узла, если не null
         newNodeText - текст узла
         noExpand=false - если true и parent=folder, то вставляет в папку, если false-то добавляет после
    OUT: возвращает объект DOM нового узла
  */
  addNode(parentNode, newNodeId, newNodeText, noExpand=false)
  {
    let nodeRow = document.createElement("div");
    nodeRow.classList.add("tv-row", "tv-node");
    if (newNodeId != null) nodeRow.setAttribute("id", newNodeId);

    let nodeCol = document.createElement("div");
    nodeCol.classList.add("tv-col");

    let text = document.createTextNode(String(newNodeText));

    nodeCol.appendChild(text);
    nodeRow.appendChild(nodeCol);
    nodeRow.addEventListener("click", this._onNode_click);
    nodeRow.addEventListener("dblclick", this._onNode_dblclick);

    this._addNode(parentNode, nodeRow, null, noExpand);

    return nodeRow;
  }

  // --------------------------------------------------------------------------
  // добавить папку
  /* IN: parentNode - элемент или ID родительского узла, если null добавляет в корневой список
         newFolderId - ID новой папки, если не null
         newFolderText - текст папки
         noExpand=false - если true и parent=folder, то вставляет в папку, если false-то добавляет после
    OUT: возвращает объект DOM новой папки
  */
  addFolder(parentNode, newFolderId, newFolderText, noExpand=false)
  {
    let folderRow = document.createElement("div");
    folderRow.classList.add("tv-row", "tv-folder");
    if (newFolderId != null) folderRow.setAttribute("id", newFolderId);

    let folderCol = document.createElement("div");
    folderCol.classList.add("tv-col");

    let text = document.createTextNode(String(newFolderText));

    folderCol.appendChild(text);
    folderRow.appendChild(folderCol);
    folderRow.addEventListener("click", this._onNode_click);
    folderRow.addEventListener("dblclick", this._onNode_dblclick);

    let groupRow = document.createElement("div");
    groupRow.classList.add("tv-group-row", "tv-collapse");

    let groupCol = document.createElement("div");
    groupCol.classList.add("tv-group-col");

    groupRow.appendChild(groupCol);

    this._addNode(parentNode, folderRow, groupRow, noExpand);

    return folderRow;
  }

  // --------------------------------------------------------------------------
  // открывает/закрывает папку
  /* IN: node - элемент или ID элемента
         expand - если false то закрывает, иначе открывает. true по умолчанию
     OUT: -
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
  // раскрывает/закрывает все узлы
  /* IN: expand - если false то закрывает, иначе открывает. true по умолчанию
     OUT: -
  */
  expandAll(expand=true)
  {
    let nodes = this._base.getElementsByClassName("tv-folder");
    for (let i=0; i<nodes.length; i++)
    {
      if (expand)
        this.openFolder(nodes[i]);
      else
        this.openFolder(nodes[i], false);
    }
  }

  // --------------------------------------------------------------------------
  // удаляет узел или папку
  /* IN: node - элемент или ID элемента
     OUT: -
  */
  delNode(node)
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
  // переводит выбранный узел в режим редактирования текста
  /* IN: node - элемент или ID элемента
     OUT: -
  */  
  editNode(node)
  {
    let el = this._getElement(node);
    if (el == null) return;

    this._storedEditableText = el.textContent;
    el.contentEditable = "true";
    el.focus();
    el.addEventListener("keydown", this._editNode_keydown);
    el.addEventListener("focusout", this._editNode_focusout);
    el.classList.add("tv-editable");
  }


  // --------------------------------------------------------------------------
  // удалить все содержимое 
  /* IN: -
     OUT: -
  */  
  clear()
  {
    while (this._base.children[0].firstChild) {
      this._base.children[0].removeChild(this._base.children[0].lastChild);
    }
  }

  // --------------------------------------------------------------------------
  // меняет текст в укзанном узле
  /* IN: node - элемент или ID элемента
     OUT: -
  */  
  changeNode(node, text)
  {
    let el = this._getElement(node);
    if (el == null) return;

    el.children[0].textContent = text;
    if (this.onNode_changed != null) this.onNode_changed(el);
  }

  // --------------------------------------------------------------------------
  // загружает компонент из JSON 
  /* IN: data - данные в JSON формате
     OUT: -
  */  
  loadJSON(data)
  {
    this.clear();
    let arr = JSON.parse(data);
    
    this._loadJSON(arr.nodes, null);

    if (this.onData_loaded != null) this.onData_loaded();
  }

  // --------------------------------------------------------------------------
  // экспортирует компонент в JSON 
  /* IN: data - 
     OUT: строковые данные в JSON формате
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
  // возвращает цепочку родительских элементов выбранного узла начиная с корневого
  /* IN: node - элемент или ID элемента
         asText - если true, то возвращает названия узлов, иначе возвращает ссылки на объекты
     OUT: массив ссылок на элементы, или пустой массив, если родителя нет
  */
  getFullPath(node, asText = false)
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
  // пользовательская обработка двойного щелчка onNode_dblclick(node)
  /* IN: node - ссылка на DOM объект
     OUT: -
  */
  onNode_dblclick = null;


  // --------------------------------------------------------------------------
  // пользовательская обработка одинарного щелчка onNode_click(node)
  /* IN: node - ссылка на DOM объект
     OUT: -
  */
  onNode_click = null;

  // --------------------------------------------------------------------------
  // событие до удаления узла/папки onNode_beforeRemove(node, type, hasNodes)
  // IN: node - удаляемый элемент (DOM element), info - информация об элементе (getNodeInfo())
  // OUT: если функция возвращает false, то удаление отменяется 
  onNode_beforeRemove = null;

  // --------------------------------------------------------------------------
  // событие выбора узла/папки onNode_select(node)
  /* IN: node - ссылка на DOM объект
     OUT: -
  */
  onNode_select = null;

  // --------------------------------------------------------------------------
  // событие изменение текста узла onNode_changed(node)
  /* IN: node - ссылка на DOM объект
     OUT: -
  */
  onNode_changed = null;

  // --------------------------------------------------------------------------
  // событие возникающее после загрузки данных JSON
  /* IN: -
     OUT: -
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
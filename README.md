# HTTP КОМПОНЕНТЫ: TreeView

Класс TreeView для отображения иерархического контента

## СВОЙСТВА

Свойство | Тип | Описание
-------- | --- | --------
SelectedNode | get: элемент,<br>set: ID элемента или элемент | get: возвращает DIV элемент "tv-row" выбранного узла.<br>set: устанавливает выбранный узел
generateOnFolderClick | boolean | Указывает, будет ли генирироваться событие (onNode_click) по одиночному щелчку ПКМ на папке. По умочанию равно false, т.к. в связи с особенностью HTML при двойном щелчке генерируется не только событие dblclick, но и два click события.
generateOnNodeDoubleClick | boolean | Указывает, будет ли генирироваться событие (onNode_dblclick) по двойному щелчку ПКМ на узле. По умочанию равно false, т.к. в связи с особенностью HTML при двойном щелчке генерируется не только событие dblclick, но и два click события.

## МЕТОДЫ

Метод |  Описание
----- | ---------
constructor(componentId: String) | Конструктор. Инициализирует объект класса TreeView с укзанным ID элемента.
getNodeType(node: Element или String): String | Возвращет тип узла: папка или узел.<br>IN: node - ID элемента или элемент.<br>OUT: одно из значений: "folder", "node", "null".
getNodeInfo(node: Element или String): Dictionary | Возвращает информацию об узле в виде словаря.<br>IN: node - ID элемента или сам элемент.<br>OUT: id:String - ID элемента "tv-row", если есть; text:String - текст узла; type:String - тип узла как в функции getNodeType(); expanded:Boolean - если папка, то открыты ли дочерние узлы; length:Integer - если папка,  то количество дочерних узлов, если узел - то ноль.
addNode(parentNode: Element или String, newNodeId: String, newNodeText: String, addToFolder: Boolean = false): Element | В зависимости от значения parentNode, addToFolder и состояния папки, добавляет или вставляет новый узел. Если папка находится в раскрытом состоянии, то добавляет новый узел в выбранную папку. Если папка свернута, то вставляет узел после выделенного.<br>IN: parentNode - ID или элемент родительского узла. Если равен null, то новый узел будет добавлен в конец корневого списка, иначе вставлен после указанного узла. newNodeId - ID элемента нового узла. newNodeText - текст нового узла. addToFolder - если равно true и parentNode это папка, то вставляет в указанную папку. Если false, то действует в зависимости от состояния папки.<br>OUT: возвращает созданный элемент DIV с классом "tv-row".
addFolder(parentNode: Element или String, newFolderId: String, newFolderText: String, addToFolder: Boolean = false): Element | В зависимости от значения parentNode, addToFolder и состояния папки, добавляет или вставляет новую папку. Если папка находится в раскрытом состоянии, то добавляет новую папку в выбранную папку. Если папка свернута, то вставляет папку после выделенной.<br>IN: parentNode - ID или элемент родительского узла. Если равен null, то новая папка будет добавлена в конец корневого списка, иначе вставлена после указанного узла. newFolderId - ID элемента новой папки. newFolderText - текст новой папки. addToFolder - если равно true и parentNode это папка, то вставляет в указанную папку. Если false, то действует в зависимости от состояния папки.<br>OUT: возвращает созданный элемент DIV с классом "tv-row".
openFolder(node: Element или String, expand: Boolean = true) | Раскрывает или сворачивает содержимое папки.<br>IN: node - ID элемента или сам элемент папки. expand - если true (по умолчанию), то раскрывает содержимое папки, иначе сворачивает.
expandAll(expand: Boolean = true) | Разворачивает или сворачивает все папки.<br>IN: node - ID элемента или сам элемент папки. expand - если true (по умолчанию), то раскрывает содержимое папок, иначе сворачивает.
delNode(node: Element или String) | Удаляет узел или папку. <br>IN: node - ID элемента или сам элемент.
editNode(node: Element или String) | Переводит указанный узел или папку в режим редактирования с клавиатуры. Редактирование заканчивается при потере фокуса или нажании клавиши "Enter", при этом введенные изменения сохраняются. При нажатии клавиши "Esc", внесенные изменения отменяются.<br>IN: node - ID элемента или сам элемент.
clear() | Очищает все содержимое TreeView.
changeNode(node: Element или String, text: String) | Меняет текст указанного узла или папки. <br>IN: node - ID элемента или сам элемент. text - новый текст узла.
loadJSON(data: String) | Загружает в TreeView содержимое указанное в строке в формате Json. <br>IN: data - стока в формате Json.
saveJSON(): String | Выгружает содержимое TreeView в формат Json. <br> OUT: Строка в формате Json.
getParentNode(node: Element или String): Element | Возвращает элемент выбранного узла или папки. Если укзана корневая папка, то возвращает null.
getFullPath(node: Element или String, asText: Boolean = false): Array | Возвращает полный путь к указанному узлу или папке (за исключением самого узла или папки) в виде массива, где первый элемент это корневая папка, а последний это прямой родитель укзанного узла или папки. В случае, если указанный узел или папка являются корневыми, будет возвращет пустой массив. <br>IN: node - ID элемента или сам элемент. asText - если true, то в массиве будут названия узлов, если false - сслыки на объекты DIV с классом "tv-row". <br>OUT: массив.

## СОБЫТИЯ

> События являются условными. Это пользовательская функция выполняющаяся в основном контексте класса при каком-либо действии. Объявлена как ссылка на функцию.

Событие |  Описание
------- | ---------
onNode_dblclick(node: Element, e: MouseEvent) | Пользовательская функция обработки двойного щелчка мыши.
onNode_click(node: Element, e: MouseEvent) | Пользовательская функция обработки одинарного щелчка мыши.
onNode_beforeRemove(node: Element, info: Array): Boolean | Пользовательская функция вызваемая до удаления узла или папки. Позволяет отменить удаление: если возвращаемое функцией значение равно false, то удаления не происходит; Если true или не определено, то узел или папка удаляются. Параметр info содержит информацию возвращаемую методом getNodeInfo()
onNode_select(node: Element) | Возникает при выборе узла или папки либо с помощью мыши либо с помощью присвоения значения свойству SelectedNode.
onNode_changed(node: Element) | Возникает при изменении текста узла или папки.
onData_loaded() | Возникает по завершении загрузки TreeView из Json строки.

## JSON-формат

{
   "treeId":"",
   "nodes": [
    {
        "id": "Node_ID",
        "text": "Node name",
        "type": "node"
    },
    {
        "id": "Folder_ID",
        "text": "Folder name",
        "type": "folder",
        "nodes": [
        {
            "id": "Node_ID",
            "text": "Node name",
            "type": "node"
        }]
    }
}

## ПРИМЕРЫ

```html
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" type="text/css" href="/treeview.css" />
    </head>

    <body>

        <script src="/treeview.js"></script>

        <img style="display:none" src="/tv_node_expanded.png"><!--cached image-->
        <img style="display:none" src="/tv_node_collapsed.png"><!--cached image-->
        <img style="display:none" src="/tv_node.png"><!--cached image-->

        <div class="tv-control" id="treeView1">
            <div class="tv-group-col">
                <!--defining a row with type 'node'-->
                <div class="tv-row tv-node"><div class="tv-col">Element 1.0</div></div>
                <!--node end-->

                <!--defining a row with type 'folder'-->
                <div class="tv-row tv-folder tv-folder-expanded" id="n30r"><div class="tv-col" id="n30c">Element 2.0</div></div>
                <!--require group container-->
                <div class="tv-group-row"><div class="tv-group-col">
                    <div class="tv-row tv-node"><div class="tv-col">Element 2.1</div></div>
                    <div class="tv-row tv-node"><div class="tv-col">Element 2.2</div></div>
                </div></div>
                <!--container end-->
                <!--folder end-->

            </div>  
        </div>
    </body>
</html>
```

```javascript
log = function(msg) {
  let out = document.getElementById("stdout");
  out.value += msg + "\n";
  out.scrollTop = out.scrollHeight;
}

var treeView1 = new treeView("treeView1");
treeView1.generateOnNodeDoubleClick = true;

treeView1.onNode_beforeRemove = function(node, info) {
  if (info.type == "folder" && info.length != 0)
  {
    log("error [Can't remove. Folder is full]");
    alert("Can't remove. Folder is full");
    return false;
  }
  log("node was removed [" + node.textContent + "]");
};

treeView1.onNode_click = function(node) {
  log("click on node: [" + node.textContent + "]");
};

treeView1.onNode_dblclick = function(node) {
  console.log(node);
  log("double click on node [" + node.textContent + "]");
  if (this.getNodeInfo(node).type == "node") treeView1.editNode(node);
};

treeView1.onNode_select = function(node) {
  log("selected node [" + node.textContent + "]");
};

treeView1.onNode_changed = function(node) {
  log("changed node [" + node.textContent + "]");
};

treeView1.onData_loaded = function() {
  log("JSON data was loaded");
};

treeView1.SelectedNode = "n10";
```

## СКРИНШОТЫ

![](https://github.com/ezik117/HttpForms_TreeView/blob/main/tv_sample1.png)
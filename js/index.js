/*
 * 初始化记录栏
 */
function initExpSpan() {
  for (var i = 0; i < allExpData.length; i++) {
    (function (j) {
      var expSpan = createExpSpan(j + 1);
      record.appendChild(expSpan);
    })(i)
  }
}

/* 
 * 初始化工具栏
 */
function initTools(array) {
  for (var index = 0; index < array.length; index++) {
    const element = array[index];
    var elP = document.createElement("p");
    var elImg = document.createElement("img");
    var elSpan = document.createElement("span");
    elP.className = 'tools_tool';
    elImg.className = element.class;
    elImg.src = element.src;
    elImg.id = 'img' + index;
    elImg.alt = element.alt;
    elImg.title = element.title;
    if (index == array.length - 1) {
      elImg.draggable = false;
      elImg.className += ' pipeImg';
    }
    elSpan.appendChild(document.createTextNode(element.title));
    elP.appendChild(elImg);
    elP.appendChild(elSpan);
    side_bar.appendChild(elP);
  }
  initLine(array[array.length - 1].child); // 初始化线 默认为数据的最后一条
}

/* 
 * 初始化线 
 */
function initLine(array) {
  var lineWrap = document.createElement('div');
  var lineHorizon = document.createElement('div');
  var lineVertical = document.createElement('div');
  lineWrap.className = 'line_wrap';
  lineHorizon.className = 'line_horizon';
  lineVertical.className = 'line_vertical';
  for (var index = 0; index < array.length; index++) {
    const element = array[index];
    var elP = document.createElement("p");
    var elImg = document.createElement("img");
    var elSpan = document.createElement("span");
    elP.className = 'tools_tool';
    elImg.className = element.class;
    elImg.src = element.src;
    elImg.id = 'imgLine' + index;
    elImg.alt = element.alt;
    elImg.title = element.title;
    elSpan.appendChild(document.createTextNode(element.title));
    elP.appendChild(elImg);
    elP.appendChild(elSpan);
    if (index < array.length / 2) {
      lineHorizon.appendChild(elP);
      lineWrap.appendChild(lineHorizon);
    } else {
      lineVertical.appendChild(elP);
      lineWrap.appendChild(lineVertical);
    }
  }
  side_bar.appendChild(lineWrap);

  // 导管的点击
  var pipeImg = document.querySelector('.pipeImg');
  pipeImg.onclick = function (e) {
    lineWrap.style.top = e.pageY + 10 + 'px';
    lineWrap.style.left = e.pageX + 10 + 'px';
    addSelecteClass(lineWrap);
  }
}

/* 
 * 添加 删除 类名
 */
function addSelecteClass(target) {
  if (target.className.indexOf('selected') == -1) {
    target.className += ' selected';
  } else {
    target.className = 'line_wrap';
  }
}

/* 
 * 监听dragstart
 */
function onDragStart(event) { //target 为 拖动的元素
  var target = event.target;
  if (!target.className) return;

  /* 从sidebar 中的 含有tools_tool类名的盒子 拖出 flag=true*/
  flag = target.parentNode.className.indexOf('tools_tool') > -1;
  if (flag) {
    //dataTransfer.setData()方法设置数据类型和拖动的数据
    event.dataTransfer.setData('Text', target.className);
    copy_id = target.id;
    copy_alt = target.alt;
    copy_title = target.title;
    copy_src = target.src;
    var childrenNodes = target.parentNode.parentNode.children;
    for (var i = 0; i < childrenNodes.length; i++) { // 获取复制的序号
      if (childrenNodes[i].children[0].src == copy_src) {
        line_type = childrenNodes[i].parentNode.className;
        if (line_type.indexOf('line_') != -1) { // 拖动为线
          copy_line_flag = true;
        } else {
          copy_line_flag = false;
        }
        copy_index = i;
        break;
      }
    }
  }

  //修改拖动元素的透明度
  target.style.opacity = "0.5";
  /* 鼠标与元素原点距离 */
  dx = event.offsetX;
  dy = event.offsetY;
  dragElWidth = target.naturalWidth / 2; // 图片的原始尺寸
  draElheight = target.naturalHeight / 2;
}

/* 
 * 监听drop
 */
function onDrop(event) {

  event.preventDefault();
  event.target.style.backgroundColor = "";
  if (!copy_id) return; // 无ID 不执行放置

  var data = event.dataTransfer.getData("Text"); // 拖动元素的 类名
  var dataID = copy_id; // 拖动元素的 ID
  //放置的元素
  var dragNode = document.getElementsByClassName(data)[0];
  // 放置的位置
  var top = 0,
    left = 0;
  /* 放置目标为droptarget内 */
  if (event.target.className.indexOf('droptarget') == -1 && event.target.parentNode.className.indexOf(
      'droptarget') == -1 && event.target.parentNode.parentNode.parentNode.className.indexOf(
      'droptarget') == -1) return;

  if (event.target.className.indexOf('droptarget') != -1 || flag) { //从sidebar出来的，允许放在图片
    if (flag) { // 分情况
      dragNode.className = data + 1; // 每次拖动 类名后添加1 区别开来

      /* 获取图片对应路径 */
      dragNode.src = getImgSrc(data);

      var marginLeft = getCss(document.querySelector('.droptarget'), "marginLeft");
      if (event.target.tagName == 'DIV') { // 直接目标为droptarget
        top = event.offsetY + event.target.scrollTop - 10 - parseInt(draElheight);
        left = event.offsetX + event.target.scrollLeft - 10 - parseInt(dragElWidth);

        if (left <= 0 || top <= 0) return;
        event.target.appendChild(dragNode);
      } else if (event.target.tagName == 'IMG') { // 放置在图片
        if (!marginLeft) marginLeft = 0;
        top = event.pageY - 70 - parseInt(draElheight);
        left = event.pageX - side_bar.offsetWidth - parseInt(marginLeft) - parseInt(dragElWidth);
        if (left <= 0) {
          left = 0;
        } else if (top <= 0) {
          top = 0
        };
        droptarget.appendChild(dragNode);
      } else if (event.target.tagName == 'SPAN') { //放置在文字或格子
        top = event.pageY - droptarget.offsetTop - 10; // 10为弥补值
        left = event.pageX - capture.offsetLeft - 10 - 10; //10为margin-left 另一个10为弥补值

        if (left <= 0 || top <= 0) return;
        droptarget.appendChild(dragNode);
      }

      /* 生成底部描述文字 */
      if (!copy_line_flag) { // 如果不是线
        createImgDesc(left, top);
      }

      /* 复制 还原一份在工具栏 */
      var img = document.createElement('img');
      img.src = copy_src;
      img.alt = copy_alt;
      img.title = copy_title;
      img.id = dataID;
      img.className = data + 0; // 类名需要再添加上0 以示区分
      if (copy_line_flag) { //拖动的是线
        var line_box = document.querySelector('.' + line_type);
        line_box.children[copy_index].insertBefore(img, line_box.children[copy_index].children[0]);
      } else {
        side_bar.children[copy_index].insertBefore(img, side_bar.children[copy_index].children[0]);
      }
      if (dataID) {
        document.querySelector('.droptarget #' + dataID).id = ''; //清空id
      }
    }

    dragNode.style.top = top + 'px';
    dragNode.style.left = left + 'px';
  }
}

/*
 * 生成底部描述文字 
 */
function createImgDesc(left, top) {
  var spanNode = document.createElement('span');
  spanNode.style.top = top - 20 + 'px';
  spanNode.style.left = left + 'px';
  spanNode.appendChild(document.createTextNode("双击编辑"));
  droptarget.appendChild(spanNode);
}

/* 
 *根据class获取图片对应路径 
 */
function getImgSrc(className) {
  for (var index = 0; index < toolLists.length; index++) {
    const element = toolLists[index];
    if (className.indexOf(element.class) != -1) { // 非 线
      return toolLists[index].originsrc;
    } else { // 线
      var array = toolLists[toolLists.length - 1].child;
      for (var i = 0; i < array.length; i++) {
        var el = array[i];
        if (className.indexOf(el.class) != -1) {
          return array[i].originsrc;
        }
      }
    }
  }
}

/* 
 * 监听放置目标的点击事件
 */
function droptargetClick(e) {
  clearTimeout(timer);
  timer = setTimeout(function () {
    deleteTarget = null;
    for (var i = 0; i < droptarget.children.length; i++) {
      if (droptarget.children[i].tagName != 'INPUT') {
        droptarget.children[i].style.borderColor = 'transparent';
      }
    }
    if (e.target.tagName == 'INPUT') { //目标为input
      e.target.focus(); //双击后，再单击 进行focus
      inputTarget = e.target;
      enterFlag = true; // focus
      return;
    } else { //如果点击不为input
      if (enterFlag) { // 必须focus后
        trans2Span(inputTarget); //转为span
        enterFlag = false;
      }
    }
    if (e.target.className.indexOf('droptarget') == -1 && e.target.className.indexOf('td') == -1 && e.target
      .className.indexOf('tr') == -1 && e.target.className.indexOf('table') == -1) {
      e.target.style.border = '2px solid #00a0e9';
      deleteFlag = true;
      deleteTarget = e.target;
    }
  }, 200);

  var lineWrap = document.querySelector('.line_wrap');
  lineWrap.className = 'line_wrap'; //关闭导管
}

/* 
 * 监听放置目标的双击事件
 */
function droptargetDbClick(e) {
  clearTimeout(timer);
  var dbtarget = e.target;
  if (dbtarget.tagName == 'INPUT') {
    return;
  }
  if (dbtarget.tagName == 'SPAN' && dbtarget.className.indexOf('td') == -1) {
    dbtarget.style.border = '2px solid #dbdbdb';
    trans2Input(e.target); // 双击span 变为input
  } else if (dbtarget.tagName == 'IMG') {
    return; // 暂时未使用
    var tempSrc = dbtarget.src.split('.');
    if (tempSrc[0].split("@").length == 1) {
      tempSrc[0] += '@1366';
    } else {
      tempSrc[0] = tempSrc[0].split("@")[0];
    }
    dbtarget.src = tempSrc.join('.');
  }
}

/* 
 * 监听侧边栏的点击事件
 */
function sideBarClick(e) {
  for (var i = 0; i < side_bar.children.length; i++) {
    side_bar.children[i].style.border = '';
  }
  if (e.target.className.indexOf('side_bar') == -1) {
    e.target.style.borderColor = '#00a0e9'
  }
}

/* 
 * 用input替换span 
 */
function trans2Input(obj) {
  var o = document.createElement("input");
  o.value = obj.innerHTML;
  var top = getCss(obj, "top");
  var left = getCss(obj, "left");
  o.style.top = top;
  o.style.left = left;
  o.style.border = '2px solid #dbdbdb';
  // o.onblur=function(){trans2Span(o)}
  obj.parentNode.replaceChild(o, obj);
}

/*
 * 用span替换input
 */
function trans2Span(obj) {
  var o = document.createElement("span");
  o.appendChild(document.createTextNode(obj.value.trim()?obj.value:'双击编辑'));
  var top = getCss(obj, "top");
  var left = getCss(obj, "left");
  o.style.top = top;
  o.style.left = left;
  obj.parentNode.replaceChild(o, obj);

  inputTarget = null;
}

/* 
 * 监听keydown事件 删除选中的元素 delete  
 */
function onKeyDown(e) {
  var keynum;
  // var keychar;
  keynum = window.event ? e.keyCode : e.which;
  if (deleteFlag && keynum == 46) { // delete键
    // keychar = String.fromCharCode(keynum);
    if (deleteTarget && confirm('确认删除吗？')) {
      droptarget.removeChild(deleteTarget);
      deleteFlag = false;
      deleteTarget = null;
    }
  } else if (enterFlag && keynum == 13) { //enter键确认
    trans2Span(inputTarget);
    enterFlag = false;
  }
}

/* 
 * 获取对应CSS属性
 */
function getCss(o, key) {
  // getComputedStyle 兼容FF浏览器
  return o.currentStyle ? o.currentStyle[key] : document.defaultView.getComputedStyle(o, false)[key];
};

/* 
 * 生成表格
 */
function createGrid() {
  for (var i = 0; i < 10; i++) {
    var tr = document.createElement('div');
    tr.className = 'tr';
    for (var j = 0; j < 20; j++) {
      var td = document.createElement('span');
      td.className = 'td';
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

/* 
 * 保存 一条记录
 */
function saveExp() {
  allExpData = JSON.parse(sessionStorage.getItem('expData')) || [];
  var childLength = droptarget.children.length;
  // 生成 example
  var expSpan = createExpSpan(allExpData.length + 1);
  record.appendChild(expSpan);

  var expData = [];
  for (var i = 1; i < childLength; i++) {
    var elJson = {}; // 记录所有的元素的 位置 图片文字等信息
    var el = droptarget.children[1];
    elJson.className = el.className;
    elJson.src = el.src ? el.src : '';
    elJson.text = el.innerHTML ? el.innerHTML : '';
    elJson.top = el.style.top;
    elJson.left = el.style.left;
    expData.push(elJson);
    droptarget.removeChild(el); // 依次清空
  }
  allExpData.push(expData);
  sessionStorage.setItem('expData', JSON.stringify(allExpData)); // 保存至sessionStorage
}

/* 
 * 生成记录
 */
function createExpSpan(count) {
  var expSpan = document.createElement('span');
  var deleteBtn = document.createElement('i');
  deleteBtn.className = 'iconfont icon-LC_icon_close_fill_circle';
  expSpan.className = 'record_exp';
  expSpan.id = 'record_exp' + count;
  var text = document.createTextNode('示例 ' + count);
  expSpan.appendChild(text);
  expSpan.appendChild(deleteBtn);
  return expSpan;
}

/* 
 * 监听取消按钮点击事件
 */
function cancleExp() {
  removeEls(droptarget);
}

/* 
 * 监听点击记录
 */
function toExp(e) {
  var targetClassName = e.target.className;
  if (targetClassName.indexOf('record_wrap') != -1 || targetClassName.indexOf('record_text') != -1) return;
  var index = (e.target.id.split('record_exp')[1] ? e.target.id.split('record_exp')[1] : e.target.parentNode.id.split(
    'record_exp')[1]) - 1; //获取的序号 需要减去 1

  /* 点击删除 */
  if (e.target.tagName == 'I') {
    allExpData.splice(index, 1);
    sessionStorage.setItem('expData', JSON.stringify(allExpData));
    removeEls(record); // 清空所有元素
    initExpSpan(); //重新生成 记录
    var idx = index == allExpData.length ? index : index + 1;
    record.children[idx].className += ' current'; // 高亮选中
    /* 清除原先记录 */
    removeEls(droptarget);
    createExample(allExpData[index - 1 < 0 ? 0 : index - 1]); // 重新生成 例子
    // e.stopPropagation();
    return false;
  }

  toggleRecordClass(e.target, 'record_exp'); //高亮选中

  /* 清除原先记录 */
  removeEls(droptarget);

  /* 生成 记录 */
  var els = allExpData[index];
  createExample(els);
}

/* 
 * 高亮选中
 */
function toggleRecordClass(target, originClass) {
  var parent = target.parentNode;
  var child = parent.children;
  for (var i = 1; i < child.length; i++) {
    child[i].className = originClass;
  }
  target.className += ' current';
}

/* 
 * 生成记录对应的例子 
 */
function createExample(els) {
  if (!els) return;
  for (var i = 0; i < els.length; i++) {
    if (els[i].src == '') { // 文字span
      var elSpan = document.createElement("span");
      elSpan.className = els[i].className;
      elSpan.style.left = els[i].left;
      elSpan.style.top = els[i].top;
      elSpan.appendChild(document.createTextNode(els[i].text));
      droptarget.appendChild(elSpan);
    } else { //图片
      var elImg = document.createElement("img");
      elImg.style.left = els[i].left;
      elImg.style.top = els[i].top;
      elImg.className = els[i].className;
      elImg.src = els[i].src;
      droptarget.appendChild(elImg);
    }
  }
}

/* 
 * 鼠标事件 模拟拖拽  监听鼠标 mousedown 事件 
 */
function onMouseDown(e) {
  if (e.target.tagName == 'INPUT') return;
  stopFlag = false;
  if (e.target.className.indexOf('droptarget') == -1 && e.target.className.indexOf('td') == -1 && e.target
    .className.indexOf('tr') == -1 && e.target.className.indexOf('table') == -1) {
    e.target.style.border = '2px solid #00a0e9';
  }

  // 为了阻止拖动浏览器中元素时发生默认事件，例如拖动图片时会出现一个新窗口显示该图片
  if (event.preventDefault) {
    event.preventDefault();
  } else {
    event.returnValue = false;
  }

  // 首先获取目标元素的left、top属性值
  if (getCss(e.target, "left") !== "auto") {
    originLeft = getCss(e.target, "left");
  }
  if (getCss(e.target, "top") !== "auto") {
    originTop = getCss(e.target, "top");
  }
  originClientX = e.clientX + droptarget.scrollLeft;
  originClientY = e.clientY + droptarget.scrollTop;

  target = e.target.className.indexOf('droptarget') == -1 ? e.target : null; // 移动的目标

  document.addEventListener('mousemove', onMousemove);
  document.addEventListener('mouseup', function (e) {
    stopFlag = true;
    return false;
  });
  //阻止默认行为
  return false;
}

/* 
 * 监听鼠标移动事件
 */
function onMousemove(e) {
  if (!target) return;
  if (!stopFlag) {
    var left = parseInt(originLeft) + e.clientX - originClientX + droptarget.scrollLeft;
    var top = parseInt(originTop) + e.clientY - originClientY + droptarget.scrollTop;
    if (left <= 0) { //不允许移出目标区域
      left = 0;
    }
    if (top <= 0) {
      top = 0;
    }
    target.style.left = left + 'px';
    target.style.top = top + 'px';
  }
}


/* 
 * 清楚 目标 内元素 
 */
function removeEls(el) {
  var length = el.children.length;
  for (var i = 1; i < length; i++) { // 从第二个元素开始
    el.removeChild(el.children[1])
  }
}

/* 
 * 截图功能 需要html2canvas.js （未启用）
 */
// var downloadBtn = document.querySelector("#download");
// downloadBtn.addEventListener('click', toDownload);
function toDownload() {
  var childLength = droptarget.children.length;
  html2canvas(document.querySelector("#capture"), {
    useCORS: true,
    taintTest: true
  }).then(canvas => {
    var ratio = droptarget.offsetWidth / droptarget.offsetHeight;
    canvas.style.height = 800 + 'px'
    canvas.id = 'captureCanvas';
    canvas.style.width = 800 * ratio + 'px'
    var mask = document.querySelector('.mask');
    mask.style.display = 'block';
    mask.appendChild(canvas)

    setTimeout(function () {
      //生成base64图片数据
      var dataUrl = canvas.toDataURL(); //需要同域下的图片
      var newImg = document.createElement("img");
      newImg.src = dataUrl;
      side_bar.appendChild(newImg);
      mask.removeChild(mask.querySelector('#captureCanvas'));

      for (var i = 0; i < childLength; i++) {
        droptarget.removeChild(droptarget.children[0])
      }
      mask.style.display = 'none';
    }, 1000);
  });
}
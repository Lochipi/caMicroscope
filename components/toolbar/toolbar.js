// TODO list:
// setting id/element
// set icon size
// set tool bar position
//
// proposal:
// test:
// constructor
// test different type of tools - btn, check, radio, dropdown
// changeMainToolStatus
// collapse/ expand sub tools

/**
 * CaMicroscope Tool Bar. Currently, it shows at the top-left corner of the screen.
 * It consists of Main Tools and Sub Tools.
 * Main Tools is formed of Apps and Layers. There is a callback function that return the status of Main Tools.
 * Sub Tools can be customized by using options.
 * @constructor
 * @param {Object} options
 *        All required and optional settings for instantiating a new instance of a CaToolbar.
 *
 * @param {String} options.id
 *        Id of the element to append the toolbar's container element to.
 *
 * @param {Function} [options.mainToolsCallback]
 *        Callback function that toggles if the main tools click.
 *
 * @param {Object[]} options.subTools
 * @param {String} options.subTools.icon
 *        the name of material-icons for the subtools' icon.
 * @param {String} [options.subTools.title]
 *        The information is most often shown as a tooltip text when the mouse moves over the subTools.
 * @param {String} options.subTools.type
 *        The behavior of tool looks like. Currently, Support 4 types of sub tools.
 *          'btn' - button
 *          'check' - check box
 *          'radio' - radio button
 *          'dropdown' - dropdown list
 * @param {String} options.subTools.value
 *        Callback function will return this value if click on a sub tool.
 * @param {Object[]} [options.subTools.dropdownList]
 *        Only needed if subTools.type is 'dropdown'.
 *        Each downdown item is a checkbox, which can set
 * @param {Object[]} options.subTools.dropdownList.icon
 *        the name of material-icons for the subtools' icon.
 * @param {Object[]} [options.subTools.dropdownList.title]
 *        a tooltip text when the mouse moves over the item of the dropdown list.
 * @param {Object[]} options.subTools.dropdownList.value
 *        Callback function will return this value if the status of the dropdown list changed.
 * @param {Object[]} [options.subTools.dropdownList.checked = False]
 *        the item of the dropdown list is checked or not.
 * @param {Function} options.subTools.callback
 *        Callback Function that toggles if tool is active such as click(button),
 *        changing status(check/radio/dropdown), return a object which has value and status.
 *
 */

const camicSvg = `
<svg
   version="1.1"
   id="svg1"
   viewBox="0 0 392 392"
   xmlns="http://www.w3.org/2000/svg">
  <g id="layer1">
    <path
       style="fill:currentColor"
       d="m 235.37858,200.06453 48.41567,-17.02896 C 246.56105,133.47258 219.56516,83.165139 201.98846,21.427389 l -19.03237,8.013628 z" />
    <path
       style="fill:currentColor"
       d="m 156.28676,116.50371 c 0,0 14.69165,-11.68654 0,0 z" />
    <path
       style="fill:currentColor"
       d="m 155.95286,116.83761 c 0,0 5.34242,-6.01022 0,0 z" />
    <path
       style="fill:currentColor;stroke-width:1.09145"
       d="m 139.38922,122.8447 c 15.23488,-7.61623 35.55245,-11.52666 49.73998,-13.86767 l -5.41955,-17.127845 c -19.13718,3.23649 -39.75853,8.958985 -54.66219,16.637765 z" />
    <path
       style="fill:currentColor;stroke-width:1.09145"
       d="m 122.16662,133.77573 c -23.015532,15.981 -35.642057,37.20602 -39.521215,57.6266 l -23.492631,-4.34071 c 8.128925,-25.58183 23.897012,-50.05419 51.164286,-68.27094 z" />
    <path
       style="fill:currentColor;stroke-width:1.09145"
       d="m 79.122739,208.94401 c -1.547813,23.32001 -2.010619,45.68546 13.242816,64.59801 L 71.955844,284.72771 C 57.431731,260.5187 51.196077,234.95396 55.733377,204.52227 Z" />
    <path
       style="fill:currentColor;stroke-width:1.09145"
       d="m 107.61472,290.35656 c 18.94063,20.51975 41.85149,37.02418 68.16374,42.40749 l -4.70291,18.87034 C 141.91129,341.51155 109.06814,329.00813 87.063288,303.43108 Z" />
    <path
       style="fill:currentColor;stroke-width:1.38034"
       d="m 199.36286,333.54662 -1.94994,19.73107 132.52921,-0.93353 -4.77015,-29.85319 z" />
  </g>
</svg>
`;

function CaToolbar(options) {
  this.name = 'CaToolbar';
  // DOM elts
  /**
   * @property {Element} elt The element to append the toolbar's container element to.
   */
  this.elt;
  /**
   * @property {Element[]} _mainTools The elements that represent each main tools.
   */
  this._mainTools = [];
  /**
   * @property {Element[]} _subTools The elements that represent each sub tools.
   */
  this._subTools = [];

  this.handler;
  // default setting
  this.setting = {
    zIndex: 600,
    hasMainTools: true,
    // list pairs
    // btn -> event
    // may be it can be extension in future...
    mainTools: [
      {
        icon: 'camic',
        title: 'Applications',
        type: 'check',
        value: 'apps',
        ariaLabel: 'Applications',
      },
      {
        icon: 'view_list',
        title: 'Layers',
        type: 'check',
        value: 'layers',
        ariaLabel: 'Layers',
      },
    ],
  };

  // setting options
  extend(this.setting, options);
  this.elt = document.getElementById(this.setting.id);
  if (!this.elt) {
    console.error(`${this.name}:No Main Container...`);
    return;
  }

  this.__refresh();
}
/*
 * @private
 * __create - create tool item and bind event based on options
 * @param  {Object} options - options that describes the type, style and behavior of the tool.
 * @return {Element} - the DOM Element that represents a tool.
 */
CaToolbar.prototype.__create = function(options) {
  switch (options.type) {
    case 'btn':
      // create button menu
      return this.__createBtn(options);
    case 'check':
      // create checkable menu
      return this.__createCheck(options);
    case 'radio':
      // create radio menu
      return this.__createRadio(options);
    case 'dropdown':
      // create dropdown menu
      return this.__createDropDown(options);
    case 'multi-dropdown':
      // create multi-dropdown menu
      return this.__createMultiDropDown(options);
    case 'multistates':
      // create dropdown menu
      return this.__createMultiStateBtns(options);
    default:
      // return null if unvalid type
      return null;
  }
};

/*
 * @private
 * __createBtn - create tool as btn.
 * @param  {Object} options - options that describes the type, style and behavior of the tool.
 * @return {Element} - the DOM Element that represents a tool.
 */
CaToolbar.prototype.__createBtn = function(options) {
  if (!options) {
    console.warn(`${this.name}.__createBtn:No Option`);
    return;
  }
  // create UI
  const li = document.createElement('li');
  if (options.name) li.name = options.name;
  const btn = document.createElement('i');
  btn.classList.add('material-icons');
  btn.classList.add('md-36');
  if (options.icon =='camic') {
    btn.innerHTML = camicSvg;
    btn.classList.add('camic-logo');
    btn.title = 'camic';
    btn.style.height = '36px';
    btn.style.width = '36px';
  } else {
    btn.textContent = options.icon;
  }
  if (options.title) {
    tippy(btn, {
      content: options.title,
      placement: 'bottom',
      delay: 200,
      theme: 'dark',
    });
  }
  li.appendChild(btn);

  // binding event
  if (options.callback) {
    li.addEventListener(
        'click',
        function(e) {
        // callback arguments
          const args = {};
          if (options.value) args.value = options.value;

          //
          options.callback.call(e, args);
        },
    );
  }

  return li;
};
/*
 * @private
 * __createCheck - create tool as checkbox.
 * @param  {Object} options - options that describes the type, style and behavior of the tool.
 * @return {Element} - the DOM Element that represents a tool.
 */
CaToolbar.prototype.__createCheck = function(options) {
  if (!options) {
    console.warn(`${this.name}.__createCheck:No Option`);
    return;
  }

  // create UI
  const li = document.createElement('li');
  if (options.name) li.name = options.name;
  // checkbox
  const id = randomId(); // create a timestamp id
  const chk = document.createElement('input');
  chk.id = id;
  chk.type = 'checkbox';
  if (options.name) chk.name = options.name;
  if (options.value) chk.value = options.value;
  if (options.checked) chk.checked = options.checked;
  li.appendChild(chk);

  // icon
  const icon = document.createElement('label');
  icon.classList.add('material-icons');
  icon.classList.add('md-36');
  if (options.icon == 'camic') {
    icon.innerHTML = camicSvg;
    icon.title = 'camic';
    icon.style.height = '36px';
    icon.style.width = '36px';
  } else {
    icon.textContent = options.icon;
  }
  if (options.ariaLabel) icon.ariaLabel = options.ariaLabel;
  icon.htmlFor = id;
  if (options.title) {
    tippy(icon, {
      content: options.title,
      placement: 'bottom',
      delay: 300,
      theme: 'dark',
    });
  }
  li.appendChild(icon);

  // binding event
  if (options.callback) {
    chk.addEventListener(
        'click',
        function(e) {
        // callback arguments
          const args = {};
          if (options.value) args.value = options.value;
          args.checked = chk.checked;
          //
          options.callback.call(e, args);
        },
    );
  }

  return li;
};

/*
 * @private
 * __createRadio - create tool as radio button.
 * @param  {Object} options - options that describes the type, style and behavior of the tool.
 * @return {Element} - the DOM Element that represents a tool.
 */
CaToolbar.prototype.__createRadio = function(options) {
  if (!options) {
    console.warn(`${this.name}.__createRadio:No Option`);
    return;
  }

  // create UI
  const li = document.createElement('li');
  if (options.name) li.name = options.name;
  if (options.color) li.style.borderBottom = `3px solid ${options.color}`;
  // radio
  const id = randomId(); // create a timestamp id
  const radio = document.createElement('input');
  radio.id = id;
  radio.type = 'radio';
  radio.value = options.value;
  radio.checked = options.checked ? true : false;

  if (options.id) radio.name = options.id; //

  li.appendChild(radio);

  // icon
  const icon = document.createElement('label');
  if (options.icon) {
    icon.classList.add('material-icons');
    icon.classList.add('md-36');
    if (options.ariaLabel) icon.ariaLabel = options.ariaLabel;
    icon.textContent = options.icon;
  } else {
    let _fitContent = 'fit-content';
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      // Do Firefox-related activities
      _fitContent = '-moz-fit-content';
    }
    li.style.width = _fitContent;
    li.classList.add('text');
    const div = document.createElement('div');
    div.textContent = options.title;
    icon.appendChild(div);
  }

  icon.htmlFor = id;
  if (options.title) {
    tippy(icon, {
      content: options.title,
      placement: 'bottom',
      delay: 300,
      theme: 'dark',
    });
  }

  li.appendChild(icon);

  // binding event
  if (options.callback) {
    radio.addEventListener(
        'click',
        function(e) {
        // callback arguments
          const args = {};
          if (options.value) args.value = options.value;
          args.checked = radio.checked;
          //
          options.callback.call(e, args);
        },
    );
  }

  return li;
};

CaToolbar.prototype.__createMultiStateBtns = function(options) {
  if (!options) {
    console.warn(`${this.name}.__createMultiStateBtns:No Option`);
    return;
  }
  // create UI
  const li = document.createElement('li');
  if (options.name) li.name = options.name;
  // btn
  const icon = document.createElement('label');
  icon.id = randomId(); // create a timestamp id
  icon.classList.add('material-icons');
  icon.classList.add('md-36');
  if (options.ariaLabel) icon.ariaLabel = options.ariaLabel;
  icon.classList.add(0);
  icon.dataset.state = 0;
  icon.textContent = options.icon;
  if (options.title) {
    tippy(icon, {
      content: options.title,
      placement: 'bottom',
      delay: 300,
      theme: 'dark',
    });
  }
  li.appendChild(icon);
  li.addEventListener('click', function(e) {
    icon.classList.remove(`s${icon.dataset.state}`);
    icon.dataset.state++;
    if (icon.dataset.state == 3) icon.dataset.state = 0;
    icon.classList.add(`s${icon.dataset.state}`);

    const args = {};
    args.state = icon.dataset.state;

    options.callback.call(e, args);
  });

  return li;
};
/*
 * @private
 * __createDropDown - create tool as dropdown menu.
 * @param  {Object} options - options that describes the type, style and behavior of the tool.
 * @return {Element} - the DOM Element that represents a tool.
 */
CaToolbar.prototype.__createMultiDropDown = function(options) {
  if (!options) {
    console.warn(`${this.name}.__createDropDown:No Option`);
    return;
  }
  // create UI
  const li = document.createElement('li');
  li.classList.add('multi-down');
  if (options.name) li.name = options.name;
  // checkbox
  const id = randomId(); // create a timestamp id
  const chk = document.createElement('input');
  chk.id = id;
  chk.type = 'checkbox';
  chk.checked = options.checked ? true : false;
  li.appendChild(chk);

  // icon
  const icon = document.createElement('label');
  icon.classList.add('material-icons');
  icon.classList.add('md-36');
  if (options.ariaLabel) icon.ariaLabel = options.ariaLabel;
  icon.textContent = options.icon;
  icon.htmlFor = id;
  if (options.title) {
    tippy(icon, {
      content: options.title,
      placement: 'bottom',
      delay: 300,
      theme: 'dark',
    });
  }
  li.appendChild(icon);

  // create drop_down
  li.append(createMenus(options.dropdownList));

  const ll = li.querySelector('li.checked.leaf');
  if (ll) selected(ll);
  //
  chk.addEventListener('click', function(e) {
    options.callback({
      status: chk.checked,
      data: li.querySelector('li.leaf.checked').dataset,
    });
  });
  //
  const list = li.querySelectorAll('.leaf');
  const alist = li.querySelectorAll('li');
  list.forEach((l) =>
    l.addEventListener(
        'click',
        function(e) {
          chk.checked = true;
          // clear
          const alist = li.querySelectorAll('li');
          alist.forEach((l) => l.classList.remove('checked'));

          // selected
          selected(l);
          // call function
          options.callback({status: true, data: l.dataset});
        },
    ),
  );
  return li;
};

function selected(element) {
  let current = element;
  while (!current.classList.contains('multi-down')) {
    const tag = current.tagName.toLowerCase();
    if (tag === 'li') {
      current.classList.add('checked');
    }
    current = current.parentElement;
  }
}

function createMenus(children) {
  let ul = null;
  if (children && Array.isArray(children) && children.length > 0) {
    ul = document.createElement('ul');
    ul.classList.add('dropdown-menu');
    children.forEach((child) => ul.append(createMenu(child)));
  }

  return ul;
}

function createMenu(option) {
  const li = document.createElement('li');
  li.title = option.title;
  li.dataset.value = option.value;
  const a = document.createElement('span');
  a.tabIndex = -1;
  a.href = '#';
  a.textContent = option.title;
  li.append(a);
  if (
    option.children &&
    Array.isArray(option.children) &&
    option.children.length > 0
  ) {
    li.classList.add('dropdown-submenu');
    const ul = document.createElement('ul');
    ul.classList.add('dropdown-menu');
    option.children.forEach((child) => ul.append(createMenu(child)));
    li.append(ul);
  } else {
    for (const key in option.data) {
      if (option.data.hasOwnProperty(key)) {
        li.dataset[key] = option.data[key];
      }
    }
    if (option.checked) {
      li.classList.add('checked');
    }
    li.classList.add('leaf');
  }
  return li;
}

/*
 * @private
 * __createDropDown - create tool as dropdown menu.
 * @param  {Object} options - options that describes the type, style and behavior of the tool.
 * @return {Element} - the DOM Element that represents a tool.
 */
CaToolbar.prototype.__createDropDown = function(options) {
  if (!options) {
    console.warn(`${this.name}.__createDropDown:No Option`);
    return;
  }
  // create UI
  const li = document.createElement('li');
  if (options.name) li.name = options.name;
  // checkbox
  const id = randomId(); // create a timestamp id
  const chk = document.createElement('input');
  chk.id = id;
  chk.type = 'checkbox';
  chk.checked = options.checked ? true : false;
  li.appendChild(chk);

  // icon
  const icon = document.createElement('label');
  icon.classList.add('material-icons');
  icon.classList.add('md-36');
  if (options.ariaLabel) {
    icon.ariaLabel = options.ariaLabel;
    icon.title = options.ariaLabel;
  }
  icon.textContent = options.icon;
  icon.htmlFor = id;
  if (options.title) {
    tippy(icon, {
      content: options.title,
      placement: 'left-start',
      delay: 300,
      theme: 'dark',
    });
  }
  li.appendChild(icon);

  // create drop_down
  const _drop = document.createElement('ul');
  _drop.classList.add('drop_down');

  //
  const lists = [];
  for (let i = 0; i < options.dropdownList.length; i++) {
    options.dropdownList[i].id = id;
    const radio = this.__createRadio(options.dropdownList[i]);
    lists.push(radio);
    _drop.appendChild(radio);
  }
  li.appendChild(_drop);

  function getStatus(e) {
    const args = {};
    args.value = options.value;
    args.checked = chk.checked;
    args.status = li.querySelector(`input[name=${id}]:checked`).value;
    options.callback.call(e, args);
  }

  // binding event
  if (options.callback) {
    chk.addEventListener('change', getStatus.bind(this));
    lists.forEach((radio) =>
      radio.addEventListener('change', (e) => {
        chk.checked = true;
        getStatus.call(this, e);
      }),
    );
  }

  return li;
};

/**
 * Render UI based on the options.
 *
 */
CaToolbar.prototype.__refresh = function() {
  // detach elements
  empty(this.elt);
  this.elt.classList.add('ca_tools');

  const mainBar = document.createElement('ul');
  mainBar.classList.add('tools');
  mainBar.style.zIndex = this.setting.zIndex;
  if (this.setting.hasMainTools) {
    // main tools

    const mainTools = this.setting.mainTools;
    for (var i = 0; i < mainTools.length; i++) {
      const options = mainTools[i];
      options.name = '_mainTools';
      const tool = this.__create(options);
      this._mainTools.push(tool);
      mainBar.appendChild(tool);
      options.__item = tool;
    }

    // main tools events
    const mainChks = mainBar.querySelectorAll('input[name=_mainTools]');
    mainChks.forEach((chk) =>
      chk.addEventListener(
          'change',
          function(e) {
            const args = {};
            mainChks.forEach((aChk) => {
              if (e.target.checked && e.target !== aChk) aChk.checked = false;
              args[aChk.value] = aChk.checked;
            });

            this.setting.mainToolsCallback.call(this, args);
          }.bind(this),
      ),
    );

    // separator
    const separator = document.createElement('li');
    separator.classList.add('separator');
    mainBar.appendChild(separator);
  }

  // sub tools
  const subTools = this.setting.subTools;
  for (var i = 0; i < subTools.length; i++) {
    const options = subTools[i];
    const tool = this.__create(options);
    if (!tool) continue;
    this._subTools.push(tool);
    mainBar.appendChild(tool);
    options.__item = tool;
  }

  // handler
  this.handler = document.createElement('li');
  this.handler.classList.add('handler');

  const id = randomId();
  const handlerFlag = document.createElement('input');
  handlerFlag.id = id;
  handlerFlag.type = 'checkbox';
  this.handler.appendChild(handlerFlag);

  const handlerIcon = document.createElement('label');
  handlerIcon.htmlFor = id;
  handlerIcon.classList.add('material-icons');
  handlerIcon.textContent = 'keyboard_arrow_left';
  this.handler.appendChild(handlerIcon);
  // create main m
  mainBar.appendChild(this.handler);

  this.elt.appendChild(mainBar);

  // add handler event
  this.handler.addEventListener('change', this.switch.bind(this));
};

/**
 * Change Main Tool's status by using tools value.
 * @param  {string} toolValue
 *         the value of a main tool.
 * @param  {boolean} checked
 *         the status of tool is checked or not.
 */
CaToolbar.prototype.changeMainToolStatus = function(toolValue, checked) {
  const tool = this.setting.mainTools.find((item) => item.value == toolValue);
  if (tool && tool.__item) {
    tool.__item.querySelector('input[type=checkbox]').checked = checked;
  }
};

/*
 * @private
 * __menusChange - what is going on when click on the one of the main menu.
 * @param  {Event} e - event parameter.
 */
CaToolbar.prototype.__menusChange = function(e) {
  // default the main menu is exclusive - show only one tool
  this.menus.forEach((menu) => {
    const targetId = menu.dataset.target;
    if (menu !== e.target) {
      menu.checked = false;
    }
  });

  if (this.setting.mainToolsCallback) {
    const args = {};
    this.setting.mainToolsCallback.call(this, args);
  }
};

/*
 * @private
 * switch - according to the handle status to expand/collapse the sub tools
 */
CaToolbar.prototype.switch = function(e) {
  if (this.handler.querySelector('input').checked) {
    this.collapse();
  } else {
    this.expand();
  }
};

/*
 * collapse - collapse sub tools.
 */
CaToolbar.prototype.collapse = function() {
  this.handler.querySelector('label').textContent = 'keyboard_arrow_right';
  this._subTools.forEach((btn) => (btn.style.display = 'none'));
};

/*
 * expand - expand sub tools.
 */
CaToolbar.prototype.expand = function() {
  this.handler.querySelector('label').textContent = 'keyboard_arrow_left';
  this._subTools.forEach((btn) => (btn.style.display = ''));
};

/*
 * getSubToolByName - expand sub tools.
 */
CaToolbar.prototype.getSubTool = function(name) {
  // console.log(this._subTools);
  return this._subTools.find((li) => li.name == name);
};

// db.labeling.aggregate([{ $match : { parent:null} },{$sample:{size:1}},{$project:{provenance:1}}]);

// test slideId = 5c8802db36d1a00006d33711
// labelId = 5d1ca58ff2a6893c5688e95b
// mutli subroi labelId = 5d1ca58cf2a6893c5688e94e
// CAMIC is an instance of camicroscope core
// $CAMIC in there
//
const annotationType = {
  '#FF0000': 'tumor',
  '#FFFF00': 'necrosis',
  '#000000': 'other',
  '#0000FF': 'lymphocytes',
  '#00FFFF': 'plasma',
};
let $CAMIC = null;
// for all instances of UI components
const $UI = {};

const $D = {
  annotations: [],
  // pages:{
  //   home:'../table.html',
  //   table:'../table.html'
  // },
  params: null, // parameter from url - slide Id and status in it (object).
};
const beforeUnloadHandler = (e) =>{
  if ($D && $D.activeROI){
    e.preventDefault();
    e.returnValue = 'You have an unsaved active ROI. Are you sure you want to leave?';
  }
};
window.addEventListener('beforeunload', beforeUnloadHandler);

// window.onbeforeunload = function (e) {
//     e = e || window.event;

//     // For IE and Firefox prior to version 4
//     if (e) {
//         e.returnValue = 'Sure?';
//     }

//     // For Safari
//     return 'Sure?';
// };

window.addEventListener('keydown', (e) => {
  if (!$CAMIC || !$CAMIC.viewer) return;
  const keyCode = e.keyCode;

  // escape key to close all operations
  if (keyCode==27) {
    // close slide menu
    const slideLi = $UI.toolbar.getSubTool('list');
    const slideChk = slideLi.querySelector('input[type=checkbox]');
    slideChk.checked = false;
    eventFire(slideChk, 'click');

    // close measument tool
    const mLi = $UI.toolbar.getSubTool('measure');
    const mChk = mLi.querySelector('input[type=checkbox]');
    mChk.checked = false;
    eventFire(mChk, 'click');

    // close annotation pen
    // const a_li = $UI.toolbar.getSubTool('annotation');
    // const a_chk = a_li.querySelector('input[type=checkbox]');
    // $UI.toolbar.getSubTool('annotation').querySelector('label').style.color = '';
    // a_chk.checked = false;
    // eventFire(a_chk,'click');
    //
  }

  // open Tumor Pen (ctrl + t)
  // if(e.ctrlKey && keyCode == 84 && $CAMIC.viewer.canvasDrawInstance){
  //   const li = $UI.toolbar.getSubTool('annotation');
  //   li.querySelectorAll('.drop_down input[type=radio][value=tumor]')[0].checked = true;
  //   const chk = li.querySelector('input[type=checkbox]');
  //   chk.checked = true;
  //   eventFire(chk,'click');
  //   return;
  // }
  // open Necrosis Pen (ctrl + n)
  // if(e.ctrlKey && keyCode == 78 && $CAMIC.viewer.canvasDrawInstance){
  //   const li = $UI.toolbar.getSubTool('annotation');
  //   li.querySelectorAll('.drop_down input[type=radio][value=necrosis]')[0].checked = true;
  //   const chk = li.querySelector('input[type=checkbox]');
  //   chk.checked = true;
  //   eventFire(chk,'click');
  //   return;
  // }
  // open Other Pen (ctrl + o)
  // if(e.ctrlKey && keyCode == 79 && $CAMIC.viewer.canvasDrawInstance){
  //   const li = $UI.toolbar.getSubTool('annotation');
  //   li.querySelectorAll('.drop_down input[type=radio][value=other]')[0].checked = true;
  //   const chk = li.querySelector('input[type=checkbox]');
  //   chk.checked = true;
  //   eventFire(chk,'click');
  //   return;
  // }
  // open Lymphocytes Pen (ctrl + l)
  // if(e.ctrlKey && keyCode == 76 && $CAMIC.viewer.canvasDrawInstance){
  //   const li = $UI.toolbar.getSubTool('annotation');
  //   li.querySelectorAll('.drop_down input[type=radio][value=lymphocytes]')[0].checked = true;
  //   const chk = li.querySelector('input[type=checkbox]');
  //   chk.checked = true;
  //   eventFire(chk,'click');
  //   return;
  // }

  // open Plasma Pen (ctrl + p)
  // if(e.ctrlKey && keyCode == 80 && $CAMIC.viewer.canvasDrawInstance){
  //   const li = $UI.toolbar.getSubTool('annotation');
  //   li.querySelectorAll('.drop_down input[type=radio][value=plasma]')[0].checked = true;
  //   const chk = li.querySelector('input[type=checkbox]');
  //   chk.checked = true;
  //   eventFire(chk,'click');
  //   return;
  // }

  // open Measurement Tool (ctrl + m)
  if (e.ctrlKey && keyCode == 77 && $CAMIC.viewer.measureInstance) {
    const li = $UI.toolbar.getSubTool('measure');
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = !chk.checked;
    eventFire(chk, 'click');
    return;
  }

  // open annotations list
  if (e.ctrlKey && keyCode == 65 && $UI.annotationsSideMenu) {
    const li = $UI.toolbar.getSubTool('list');
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = !chk.checked;
    eventFire(chk, 'click');
    return;
  }
});
// initialize viewer page
async function initialize() {
  var checkPackageIsReady = await setInterval(async function() {
    if (IsPackageLoading) {
      clearInterval(checkPackageIsReady);
      // init UI -- some of them need to wait data loader to load data
      // because UI components need data to initialize


      $UI.message = new MessageQueue();

      $UI.modalbox = new ModalBox({
        id: 'modalbox',
        hasHeader: true,
        headerText: 'Annotations Summary',
        hasFooter: true,
      });


      // create a viewer and set up
      initCore();
      // get user id;
      // $USER = await $CAMIC.store.getCurrentUserId();
      $USER = getUserInfo().sub;
      // loading label and sub label
      try {
        Loading.open(document.body, 'Loading Data...');
        const ROIdata = await loadingData();
        $D.ROIs = ROIdata.ROIs;
        $D.subROIs = ROIdata.subROIs;
      } catch (e) {
        // statements
        // redirect($D.pages.table, e, 0);
        Loading.close();
      } finally {
        // Loading.close();
      }

      // if (!$D.ROI) redirect($D.pages.table, 'There Is No Label Data, Return Home Page.', 0);
      Loading.open(document.body, 'Loading Data...');
      var checkCoreAndDataIsReady = setInterval(function() {
        if ($CAMIC&&$CAMIC.viewer&&$CAMIC.viewer.omanager) {
          clearInterval(checkCoreAndDataIsReady);
          Loading.close();
          showLabelData();
          resetForm();
          // force make roi first
          document.querySelectorAll('input[name="roi_type"]').forEach((input)=>{
            input.disabled = true;
          });
          // add dbl click handler
          $CAMIC.viewer.addHandler('canvas-double-click', addAnnot);
        }
      }, 500);
    }
  }, 100);
}


// setting core functionalities
function initCore() {
  addROIFormEvent();
  // start inital
  // TODO zoom info and mmp
  const opt = {
    hasPatchManager: false,
    hasZoomControl: true,
    hasDrawLayer: true,
    hasLayerManager: true,
    hasScalebar: true,
    hasMeasurementTool: false,
    // minImageZoom:0.25
  };
  // set states if exist
  if ($D.params.states) {
    opt.states = $D.params.states;
  }

  try {
    let slideQuery = {};
    slideQuery.id = $D.params.slideId;
    slideQuery.name = $D.params.slide;
    slideQuery.location = $D.params.location;
    $CAMIC = new CaMic('right_viewer', slideQuery, opt);
  } catch (error) {
    Loading.close();
    $UI.message.addError('Core Initialization Failed');
    console.error(error);
    return;
  }

  $CAMIC.loadImg(function(e) {
    if (e.hasError) {
      $UI.message.addError(e.message);
      // can't reach Slide and return to home page
      // if (e.isServiceError) redirect($D.pages.table, e.message, 0);
    } else {
      $D.params.data = e;

      $UI.slideInfos = new CaMessage({
      /* opts that need to think of*/
        id: 'cames',
        defaultText: `Slide: ${$D.params.data.name}`,
      });
    }
  });

  $CAMIC.viewer.addHandler('open', function() {
    if (!$CAMIC.viewer.measureInstance) $UI.toolbar.getSubTool('measure').style.display = 'none';
    // TODO
    $CAMIC.viewer.canvasDrawInstance.addHandler('stop-drawing', addAnnotaiton);
  });

  $UI.annotationsSideMenu = new SideMenu({
    id: 'side_annotation',
    width: 200,
    // , isOpen:true
    callback: (data)=>{
      if (!data.isOpen) $UI.toolbar.getSubTool('list').querySelector('input[type=checkbox]').checked = false;
    },
  });

  const title = document.createElement('div');
  title.classList.add('item_head');
  title.textContent = 'Annotations';

  $UI.annotationsSideMenu.addContent(title);

  // create edited data list
  $UI.labelAnnotationsPanel = new LabelAnnotationsPanel({
    // data:$D.heatMapData.editedClusters,
    data: $D.annotations,
    // editedDate:$D.
    onDBClick: locatedAnnotation,
    onDelete: onDeleteAnnotation,
  });

  $UI.annotationsSideMenu.addContent($UI.labelAnnotationsPanel.elt);

  // ui init
  $UI.toolbar = new CaToolbar({
  /* opts that need to think of*/
    id: 'ca_tools',
    zIndex: 601,
    hasMainTools: false,
    // mainToolsCallback:mainMenuChange,
    subTools: [{
      icon: 'home',
      type: 'btn',
      value: 'home',
      title: 'Home',
      callback: function() {
        if (window.location.search.length > 0) {
          window.location.href = $D.pages.home + window.location.search;
        } else {
          window.location.href = $D.pages.home;
        }
      },
    },
    // {
    //   icon: 'view_list',
    //   type: 'check',
    //   value: 'list',
    //   title:'Annotations',
    //   name:'list',
    //   callback: toggleAnnotList
    // },
    // {
    //   name:'annotation',
    //   icon:'create',
    //   title:'Annotate',
    //   type:'dropdown',
    //   value:'annotation',
    //   dropdownList:[
    //     {
    //       value:'tumor', // red
    //       title:'Tumor',
    //       checked:true
    //     },
    //     {
    //       value:'necrosis', // yellow
    //       title:'Necrosis'
    //     },
    //     {
    //       value:'other', // black
    //       title:'Other'
    //     },
    //     {
    //       value:'lymphocytes', // blue
    //       title:'Lymphocytes'
    //     },
    //     {
    //       value:'plasma', // cyan
    //       title:'Plasma'
    //     }
    //   ],
    //   callback:toggleAnntation
    // },
    // {
    //   icon:'save',// material icons' name
    //   title:'Save',
    //   type:'btn',// btn/check/dropdown
    //   value:'save',
    //   callback:clickSavebtnHandler
    // },
    // measurment tool
    {
      id: 'labeling_mode',
      icon: 'space_bar',
      title: 'Measurement',
      type: 'check',
      value: 'measure',
      name: 'measure',
      callback: toggleMeasurement,
    },
    // skip this roi
    // {
    //   id:'next',
    //   icon:'skip_next',
    //   title:'Next ROI Annotation',
    //   type:'btn',
    //   value:'next',
    //   name:'next',
    //   callback:async()=> {
    //     Loading.open(document.body,'Loading Next...');

    //     // randomly pick
    //     const labels = await $CAMIC.store.findAllLabelsWithoutAnnotations().then(d=>d);
    //     const index = getRandomIntInclusive(0,labels.length-1);
    //     const nextLabelId = labels[index]._id;
    //     const nextSlideId = labels[index].provenance.image.slide;
    //     window.removeEventListener('beforeunload', beforeUnloadHandler);

    //     window.location.href = `./labelingSimpleAnnotation.html?labelId=${nextLabelId}&slideId=${nextSlideId}`;

    //     Loading.close();
    //   }
    // },
    {
      id: 'locate',
      icon: 'my_location',
      title: 'ROI Location',
      type: 'btn',
      value: 'roi_location',
      callback: ()=>{
        // go to "active" ROI
        if ($D.activeROI) {
          const {x, y, width, height} = $D.activeROI.properties;
          const cx = x + width/2;
          const cy = y + height/2;
          const refPoint = $CAMIC.viewer.viewport.imageToViewportCoordinates(cx, cy);
          $CAMIC.viewer.viewport.panTo(refPoint, true);
        } else {
          alert('no active roi to zoom into.');
        }
      },
    },
    {
      id: 'til_sample',
      icon: 'assessment',
      title: 'TIL Sample',
      type: 'btn',
      value: 'til_sample',
      callback: ()=>{
        createTILSample();
      },
    },
    // {
    //   id: 'slide_download',
    //   icon: 'file_download',
    //   title: 'Download Slide',
    //   type: 'btn',
    //   value: 'slide_download',
    //   callback: downloadSlide,
    //  },
    {
      id: 'tutorial',
      icon: 'help',
      title: 'Tutorial',
      type: 'btn',
      value: 'tutorial',
      callback: ()=>{
        createTutorial();
      },
    },

      // bug report
      // {
      //   icon: 'bug_report',
      //   title: 'Bug Report',
      //   value: 'bugs',
      //   type: 'btn',
      //   callback: ()=>{window.open('https://goo.gl/forms/mgyhx4ADH0UuEQJ53','_blank').focus()}
      // }
    ],
  });
  // create TIL and annotaiton types
}

function clickSavebtnHandler() {
  if ($D.annotations.length < 1) {
    alert('There Is No Label. Please Add Some Labels...');
    return;
  }

  // open modal as annotations summary
  createAnnotationsList();
}

async function saveLabel(annotation) {
  Loading.open(document.body, 'Saving Label...');
  // user and date time
  // const creator = getUserId();
  const creator = $USER;
  try {
    annotation.collectionName = (await $CAMIC.store.getCollection($CAMIC.slideData.collections[0]))[0].name;
    annotation.collectionId= $CAMIC.slideData.collections[0];
  } catch (err) {
    console.error(err);
  }


  // add annotations
  annotation.creator = creator;
  const {x, y} = $CAMIC.viewer.viewport.getContainerSize();
  annotation.viewer_size = {width: x, height: y};
  annotation.viewer_mag = $CAMIC.viewer.viewport.viewportToImageZoom($CAMIC.viewer.viewport.getZoom());
  let nowTime = new Date;
  annotation.create_date = nowTime.toISOString();
  $CAMIC.viewer.cazoomctrlInstance.base;
  const rs = await $CAMIC.store.addLabel(annotation).then( (d) => d );
  if (rs.insertedCount >= 1) {
    // update parent

    // const count = await $CAMIC.store.pushAnnotationFromLabeling( $D.params.labelId, rs.insertedIds[0])
    //    .then((d)=>d);
    // remove listener
    window.removeEventListener('beforeunload', beforeUnloadHandler);

    // TODO
    const collData = await $CAMIC.store.getCollection($D.params.collectionId);
    window.location.reload();
    Loading.close();
  } else {
    alert(JSON.stringify(rs));
  }
}

function setFeedbackForm(feedback) {
  // set feedback list
  if (feedback&&feedback.annotations) {
    const table = document.getElementById('feedbackList').querySelector('tbody');
    feedback.annotations.forEach((d)=>{
      console.log(d);
      const row = document.createElement('tr');
      row.innerHTML = `<td>${d.roiType}</td><td>${d.percentStroma}</td><td>${d.densitysTILs}</td>`;
      table.append(row);
    });
  }
  // set percent Stroma Avg
  const txtPercentStromaAvg = document.getElementById('percentStromaAvg');
  if (feedback&&feedback.percentStromaAvg) txtPercentStromaAvg.innerHTML =`<strong>Mean Percent Stroma: </strong>${feedback.percentStromaAvg}`;

  // set densityTILs
  const txtDensityTILsAvg = document.getElementById('densityTILsAvg');
  if (feedback&&feedback.densitysTILsAvg) txtDensityTILsAvg.innerHTML =`<strong>Mean sTILs Density: </strong>${feedback.densitysTILsAvg}`;

  // set comments
  const txtComments = document.getElementById('comments');
  if (feedback&&feedback.comment) txtComments.innerHTML =`<strong>Comments: </strong>${feedback.comment}`;

  // set pitfalls
  const txtPitfalls = document.getElementById('pitfalls');
  if (feedback&&feedback.pitfalls) txtPitfalls.innerHTML =`<strong>Pitfalls: </strong>${feedback.pitfalls}`;
}
function disableROIForm() {
  const btnSave = document.getElementById('save');
  btnSave.style.display = 'none';
  const inputList = document.getElementById('roi_form').querySelectorAll('input');
  inputList.forEach((input)=>{
    input.disabled = true;
  });
}
function enableFeedbackForm() {
  const feedback = document.getElementById('feedback');
  const next = document.getElementById('next');
  next.addEventListener('click', ()=>{
    window.location.href = `./roi_pick.html?slideId=${$D.params.slideId}&collectionId=${$D.params.collectionId}`;
  });
  feedback.style.display = 'block';
  next.style.display = 'block';
}
function toggleMeasurement(data) {
  if (data.checked) {
    // annotOff();
    $CAMIC.viewer.measureInstance.on();
  } else {
    $CAMIC.viewer.measureInstance.off();
  }
}


function toggleAnntation(e) {
  if (!$CAMIC.viewer.canvasDrawInstance) {
    alert('Draw Doesn\'t Initialize');
    return;
  }
  // console.log(e);
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  const target = this.srcElement || this.target || this.eventSource.canvas;
  if (e.checked) { // on
    $CAMIC.viewer.measureInstance.off();
    $UI.toolbar.getSubTool('measure').querySelector('input[type=checkbox]').checked = false;
    annotOn(e);

    // annotationOn.call(this,state,target);
  } else { // off
    annotOff(e);
  }
}

const pencil = {
  'tumor': {
    color: '#FF0000', // red
    type: 'Tumor',
    mode: 'free',
    num: 0,
  },
  'necrosis': {
    color: '#FFFF00', // yellow
    type: 'Necrosis',
    mode: 'free',
    num: 0,
  },
  'other': {
    color: '#000000', // black
    type: 'Other',
    mode: 'free',
    num: 0,
  },
  'lymphocytes': {
    color: '#0000FF', // blue
    type: 'Lymphocytes',
    mode: 'point',
    num: 0,
  },
  'plasma': {
    color: '#00FFFF', // cyan
    type: 'Plasma',
    mode: 'point',
    num: 0,
  },
};

function annotOn(e) {
  const color = pencil[e.status].color;
  const mode = pencil[e.status].mode;


  $CAMIC.viewer.measureInstance.off();


  // deselect radio which is one of point/retangle/measure
  if ($UI.toolbar.elt.querySelector(`input[type=radio][name=labeling_mode]:checked`)) {
    $UI.toolbar.elt.querySelector(`input[type=radio][name=labeling_mode]:checked`).checked = false;
  };


  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawMode = mode;
  canvasDraw.style.color = color;
  // $UI.toolbar.getSubTool('annotation').querySelector('input[type=checkbox]').checked = true;
  // $UI.toolbar.getSubTool('annotation').querySelector('labe<hl').style.color = color;
  canvasDraw.style.isFill = true;
  canvasDraw.isSimplify = false;


  canvasDraw.drawOn();
  //
}

function annotOff() {
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawOff();
  canvasDraw.clear();

  $UI.toolbar.getSubTool('annotation').querySelector('input[type=checkbox]').checked = false;
  $UI.toolbar.getSubTool('annotation').querySelector('label').style.color = '';
}


async function loadingData() {
  const slideId = $D.params.slideId;
  //
  const labelData = await $CAMIC.store.findLabeling({'provenance.image.slide': slideId});


  let sublabels = null;
  if (labelData.subrois&&Array.isArray(labelData.subrois)) {
    sublabels =[]; // await $CAMIC.store.findLabelByIds(labelData.subrois).then((d)=>d);
  }

  return {ROIs: labelData, subROIs: sublabels};
}


function showLabelData() {
  // draw labels
  const labels = [...$D.ROIs];
  labels.forEach((label)=>{
    const item = {};
    item.id = label._id;
    item.data = label;
    item.render = labelRender;
    item.clickable = true;
    item.hoverable = true;
    $CAMIC.viewer.omanager.addOverlay(item);
  });

  $CAMIC.viewer.omanager.updateView();
}

function addAnnotaiton(e) {
  if ($CAMIC.viewer.canvasDrawInstance._draws_data_.length <= 0) return;
  // get current data from osd drawer
  const annotation = getAnnotationDataFrom($CAMIC.viewer.canvasDrawInstance._draws_data_[0]);
  const type = annotation.properties.type;
  // console.log(annotation);
  // clear drawer data;
  $CAMIC.viewer.canvasDrawInstance.clear();

  // add to data
  $D.annotations.push(annotation);
  pencil[type].num++;
  // add to overlay
  const item = {};
  item.id = annotation._id;
  item.data = annotation;
  item.render = annotationRender;
  item.clickable = true;
  item.hoverable = true;
  $CAMIC.viewer.omanager.addOverlay(item);
  $CAMIC.viewer.omanager.updateView();

  $UI.labelAnnotationsPanel.__refresh();
}

function annotationRender(ctx, data) {
  const imagingHelper = this.viewer.imagingHelper;
  const lineWidth = (imagingHelper.physicalToDataX(2) - imagingHelper.physicalToDataX(0))>> 0;
  const polygon = data.geometries.features[0];
  const type = polygon.geometry.type;
  const color = polygon.properties.style.color;

  ctx.lineWidth = lineWidth<3?3:lineWidth;
  // console.log(lineWidth);
  ctx.strokeStyle = color;
  switch (type) {
    case 'Polygon':
      // polygon
      const points = polygon.geometry.coordinates[0];
      ctx.fillStyle = hexToRgbA(color, 0.2);
      const path = new Path();

      // starting draw drawPolygon
      path.moveTo(points[0][0], points[0][1]);
      for (var i = 1; i < points.length-1; i++) {
        path.lineTo(points[i][0], points[i][1]);
      }

      // close path and set style
      path.closePath();
      path.fill(ctx);
      path.stroke(ctx);
      break;
    case 'Point':
      // point
      const point = polygon.geometry.coordinates;
      ctx.lineWidth = lineWidth<6?6:lineWidth;
      ctx.fillStyle = color;
      const path1 = new Path();
      path1.arc(point[0], point[1], lineWidth>2?lineWidth:2, 0, 2 * Math.PI);
      path1.closePath();
      path1.fill(ctx);
      path1.stroke(ctx);
      break;
    default:
      console.log('No type in annotation');
      break;
  }
}

function labelRender(ctx, data) {
  // set style
  const imagingHelper = this.viewer.imagingHelper;
  const lineWidth = (imagingHelper.physicalToDataX(5) - imagingHelper.physicalToDataX(0))>> 0;
  const polygon = data.geometries.features[0];
  const points = polygon.geometry.coordinates[0];
  ctx.lineWidth = lineWidth<2?2:lineWidth;

  ctx.isFill = false;
  ctx.strokeStyle = '#00ff00'; // default
  if (polygon && polygon.properties && polygon.properties.style && polygon.properties.style.color) {
    ctx.strokeStyle = polygon.properties.style.color;
  }
  polygon.geometry.path = DrawHelper.drawPolygon(ctx, points);
}

function createAnnotationsList() {
  empty($UI.modalbox.body);
  $UI.modalbox.setHeaderText('Annotations Summary');
  // get data;
  const header = `
  <div style='display:table-row; font-weight:bold;'>
      <div style='text-align: initial; display: table-cell; padding: 5px;'>Annotation Type</div>
      <div style='display: table-cell; padding: 5px;'>Total</div>
  </div>`;
  const rows = Object.keys(pencil).map((type)=>`
    <div style='display:table-row;'>
      <div style='font-weight:bold; text-align: initial; display: table-cell;padding: 5px; color: ${pencil[type].color};'>${pencil[type].type}</div>
      <div style='display: table-cell; padding: 5px;'>${pencil[type].num}</div>
    </div>`).join('');

  const table = `<div style='display: table;width: 100%; color: #365F9C; text-align: center;'>${header}${rows}</div>`;
  $UI.modalbox.body.innerHTML = table;

  const footer = $UI.modalbox.elt.querySelector('.modalbox-footer');
  footer.innerHTML = `
  <div style='display:flex;wdith:100%;justify-content: space-between;'>
    <div style='font-size: 1.5rem; padding: 5px; margin: 5px;font-weight:bold;color:#FF0000;'>
    </div>
    <button>Save&Next</button>
  </div>`;
  $UI.modalbox.open();
  const btn = $UI.modalbox.elt.querySelector('.modalbox-footer button');
  btn.addEventListener('click', saveLabels);
}

function locatedAnnotation(data) {
  const annotation = data.item;
  if (!annotation) return;
  const geometry = annotation.geometries.features[0].geometry;
  const bound = annotation.geometries.features[0].bound;
  var x = null; var y = null;
  if (geometry.type=='Point') {
    x = bound[0];
    y = bound[1];
  } else if (geometry.type=='Polygon') {
    const [x0, y0] = bound[0];
    const [x1, y1] = bound[2];
    x = ((x1 - x0)/2) + x0;
    y = ((y1 - y0)/2) + y0;
  }

  const refPoint = $CAMIC.viewer.viewport.imageToViewportCoordinates(x, y);
  // $CAMIC.viewer.viewport.panTo(refPoint, true);
  $CAMIC.viewer.viewport.zoomTo($CAMIC.viewer.viewport.imageToViewportZoom(.25), refPoint, true);
}

function onDeleteAnnotation(data) {
  const annotation = data.item;
  if (!confirm(`Do You Want To Delete { ${annotation.properties.type} - Index:${data.index}}?`)) return;

  const idx = $D.annotations.findIndex((annotation)=>annotation._id==data.id);
  if (idx < 0) return;
  const type = $D.annotations[idx].properties.type;
  pencil[type].num--;
  $D.annotations.splice(idx, 1);
  $UI.labelAnnotationsPanel.__refresh();
  $CAMIC.viewer.omanager.removeOverlay(data.id);
  $CAMIC.viewer.omanager.updateView();
}

function createTILSample() {
  empty($UI.modalbox.body);
  $UI.modalbox.setHeaderText('The Example Of TIL Densities');
  $UI.modalbox.elt.style.paddingTop='0';
  $UI.modalbox.body.style.padding = 0;
  $UI.modalbox.body.style.display = 'block';
  $UI.modalbox.body.style.textAlign = 'center';
  $UI.modalbox.body.innerHTML = `<img src="til_tutorial.png" alt="Tutorial" width="550px">`;
  $UI.modalbox.elt.querySelector('.modalbox-footer').innerHTML = '';
  $UI.modalbox.open();
}


function createTutorial() {
  empty($UI.modalbox.body);
  $UI.modalbox.setHeaderText('Tutorial');
  $UI.modalbox.elt.style.paddingTop='60px';
  $UI.modalbox.body.style.padding = 0;
  $UI.modalbox.body.style.display = 'block';

  $UI.modalbox.body.innerHTML = `
  
  <ol>
  <li>
  <h1 style='margin-top:12.0pt;margin-right:0in;margin-bottom:0in;margin-left:0in;text-indent:0in;font-size:21px;font-family:"Calibri Light",sans-serif;color:black;font-weight:normal;'>Double click a location to create or reposition an ROI</h1>
  </li>
  <li>
      <h1 style='margin-top:12.0pt;margin-right:0in;margin-bottom:0in;margin-left:0in;text-indent:0in;font-size:21px;font-family:"Calibri Light",sans-serif;color:#2F5496;font-weight:normal;'><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">Select 10 ROIs: Target diverse morphology and&nbsp;</span></span><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">sTILs</span></span><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">&nbsp;density (especially high&nbsp;</span></span><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">sTILs</span></span><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">&nbsp;density) while distributing ROIs across entire&nbsp;</span><span data-usefontface="true" data-contrast="none">tissue. Each ROI can satisfy multiple targets. Not all targets can be satisfied in each WSI. The number of ROIs per slide for&nbsp;</span><span data-usefontface="true" data-contrast="none">each target are provided as guides, not requirements.</span></span></h1>
      <ol style="list-style-type: lower-alpha;">
          <li>
              <h2 style='margin-top:2.0pt;margin-right:0in;margin-bottom:0in;margin-left:.5in;text-indent:0in;font-size:17px;font-family:"Calibri Light",sans-serif;color:#2F5496;font-weight:normal;'><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">Select 3 ROIs inside tumor with stroma</span></span><br><em><span style='font-family:"Calibri",sans-serif;color:black;'><span data-usefontface="true" data-contrast="none">(1 ROI should be at least 25% void of tissue)</span></span></em></h2>
          </li>
          <li>
              <h2 style='margin-top:2.0pt;margin-right:0in;margin-bottom:0in;margin-left:.5in;text-indent:0in;font-size:17px;font-family:"Calibri Light",sans-serif;color:#2F5496;font-weight:normal;'><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">Select 2 ROIs at invasive margin if discernable with stroma</span></span><br><em><span style='font-family:"Calibri",sans-serif;color:black;'><span data-usefontface="true" data-contrast="none">(1 ROI should be at least 25% void of tissue)</span></span></em></h2>
          </li>
          <li>
              <h2 style='margin-top:2.0pt;margin-right:0in;margin-bottom:0in;margin-left:.5in;text-indent:0in;font-size:17px;font-family:"Calibri Light",sans-serif;color:#2F5496;font-weight:normal;'><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">Select 2 ROIs inside tumor or at margin&nbsp;</span><strong><span data-usefontface="true" data-contrast="none">without stroma</span></strong></span><br><em><span style='font-family:"Calibri",sans-serif;color:black;'><span data-usefontface="true" data-contrast="none">(there&nbsp;</span></span></em><em><span style='font-family:"Calibri",sans-serif;color:black;color:black;'>may</span></em><em><span style='font-family:"Calibri",sans-serif;color:black;color:black;'>&nbsp;not be many of these)</span></em></h2>
          </li>
          <li>
              <h2 style='margin-top:2.0pt;margin-right:0in;margin-bottom:0in;margin-left:.5in;text-indent:0in;font-size:17px;font-family:"Calibri Light",sans-serif;color:#2F5496;font-weight:normal;'><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">Select 2 ROIs where there is no proximal tumor</span></span><br><em><span style='font-family:"Calibri",sans-serif;color:black;'><span data-usefontface="true" data-contrast="none">(normal tissue: outside 500 um tumor margin)</span></span></em></h2>
          </li>
          <li>
              <h2 style='margin-top:2.0pt;margin-right:0in;margin-bottom:0in;margin-left:.5in;text-indent:0in;font-size:17px;font-family:"Calibri Light",sans-serif;color:#2F5496;font-weight:normal;'><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">Select 2 ROIs for each of these target types (pitfalls, 16 listed): benign glandular elements, adipocytes, carcinoma in&nbsp;</span><span data-usefontface="true" data-contrast="none">situ, necrosis and fibrin, nerves and/or larger caliber blood vessels, eosinophilia, small/pyknotic nuclei, perinuclear&nbsp;</span><span data-usefontface="true" data-contrast="none">clearing, cross-sectionally cut fibroblasts, low grade and/or degenerate ischemic tumor cells, crushed cells, sparsely&nbsp;</span><span data-usefontface="true" data-contrast="none">distributed tumor cells, fibers, folds, over-staining, under-staining&nbsp;</span></span></h2>
          </li>
      </ol>
  </li>
  <li>
      <h1 style='margin-top:12.0pt;margin-right:0in;margin-bottom:0in;margin-left:0in;text-indent:0in;font-size:21px;font-family:"Calibri Light",sans-serif;color:#2F5496;font-weight:normal;'><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">Provide Annotations on selected ROIs</span></span></h1>
      <ol style="list-style-type: lower-alpha;">
          <li>
              <h2 style='margin-top:2.0pt;margin-right:0in;margin-bottom:0in;margin-left:.5in;text-indent:0in;font-size:17px;font-family:"Calibri Light",sans-serif;color:#2F5496;font-weight:normal;'><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">Study Annotations: Evaluable/Not Evaluable; % Tumor-Associated Stroma; %&nbsp;</span></span><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">sTILs</span></span><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">&nbsp;</span></span></h2>
          </li>
          <li>
              <h2 style='margin-top:2.0pt;margin-right:0in;margin-bottom:0in;margin-left:.5in;text-indent:0in;font-size:17px;font-family:"Calibri Light",sans-serif;color:#2F5496;font-weight:normal;'><span style='font-family:"Calibri",sans-serif;color:black;color:black;'><span data-usefontface="true" data-contrast="none">Pitfalls in each ROI: Record which pitfalls above are present in each ROI.</span></span></h2>
          </li>
      </ol>
  </li>
</ol>`;
  $UI.modalbox.open();
}

function getAnnotationDataFrom(data) {
  const color = data.properties.style.color;
  const type = annotationType[color];
  const id = new ObjectId();
  const slide = $D.params.slideId;
  const slideName = $D.params.data.name;
  const parent = $D.params.labelId;
  const execId = randomId();

  if (data.geometry.path) delete data.geometry.path;

  const geometry = Object.assign({}, data.geometry);
  const bound = [...data.bound];

  const annotation = {
    '_id': id.toString(),
    'provenance': {
      'image': {
        'slide': slide,
        'name': slideName,
      },
      'analysis': {
        'source': 'human',
        'execution_id': execId,
        'computation': 'annotation',
        'name': execId,
      },
    },
    'properties': {
      'type': type, // there are 5 types -> tumor, necrosis, other, lymphocytes, plasma
    },
    'parent': parent,
    // "geometries": {
    //     "type": "FeatureCollection",
    //     "features": [
    //         {
    //           "type": "Feature",
    //           "properties": {
    //               "style": {
    //                   "color": color,
    //                   "lineCap": "round",
    //                   "lineJoin": "round",
    //                   "lineWidth": 3
    //               }
    //           },
    //           "geometry": geometry,
    //           "bound": bound
    //         }
    //     ]
    // }
  };
  return annotation;
}
// the ROI Form Event
function changeROITypeValue(radio) {
  // group 1: Evaluable for sTILs
  if (radio.value=='Evaluable for sTILs') {
    enableITS();
    disableSaveBtn();
  }
  // group 2: Not Evaluable for sTILs
  if (radio.value=='Not Evaluable for sTILs') {
    disableITS();
    disableTIL();
    enableSaveBtn();
  }
}
function disableSaveBtn() {
  const btn = document.getElementById('save');
  btn.classList.add('disabled');
  btn.disabled = true;
}
function enableSaveBtn() {
  const btn = document.getElementById('save');
  btn.classList.remove('disabled');
  btn.disabled = false;
}
function itsChangeText(e) {
  if (itsRange.value > 0) {
    enableTIL();
  } else {
    // disableTIL();
  }
  itsTxtContent.textContent = `${itsRange.value}%`;
  itsTxtIp.value = itsRange.value;
}
function enableTIL() {
  vta.style.display = 'flex';
  tilMessage.style.display = 'block';
}
function enableITS() {
  its.style.display = 'flex';
  itsMessage.style.display = 'block';
}
function disableITS() {
  its.style.display = 'none';
  itsMessage.style.display = 'none';
  itsTxtContent.textContent = '-1%';
  itsTxtIp.value = -1;
  itsRange.value = -1;
  itsChangeText();
}
function disableTIL() {
  vta.style.display = 'none';
  tilMessage.style.display = 'none';
  vtaTxtContent.textContent = '-1%';
  vtaTxtIp.value = -1;
  vtaRange.value = -1;
  vtaChangeText();
}
function vtaChangeText(e) {
  vtaTxtContent.textContent = `${vtaRange.value}%`;
  vtaTxtIp.value = vtaRange.value;
  if (vtaRange.value > -1) {
    enableSaveBtn();
  } else {
    disableSaveBtn();
  }
}

// % intra-tumoral stroma variables
const its = document.getElementById('its');
const itsRange = document.getElementById('its_range');
const itsTxt = document.getElementById('its_txt');
const itsTxtContent = itsTxt.querySelector('.txt');
const itsTxtIp = itsTxt.querySelector('.ip');
const itsMessage = document.getElementById('its_message');

// % tumor-associated stroma variables
const vta = document.getElementById('vta');
const vtaRange = document.getElementById('vta_range');
const vtaTxt = document.getElementById('vta_txt');
const vtaTxtContent = vtaTxt.querySelector('.txt');
const vtaTxtIp = vtaTxt.querySelector('.ip');
const tilMessage = document.getElementById('til_message');

function addROIFormEvent() {
  itsTxt.addEventListener('click', function(e) {
    if (itsRange.disabled) return;
    // set image zoom value to input
    let value = itsTxtContent.textContent;
    value = value.slice(0, value.length-1);
    itsTxtIp.value = +value;


    // hide txt
    itsTxtContent.classList.add('hide');
    itsTxtIp.focus();
    itsTxtIp.select();
  });

  itsTxt.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      itsTxtIp.blur();
    }
  });

  itsTxtIp.addEventListener('blur', function(e) {
    const regex = new RegExp(/^([1-9]?\d|100|-1)$/);
    const rs = regex.test(itsTxtIp.value);
    if (rs) {
      itsRange.value = itsTxtIp.value;
      itsTxtContent.textContent = `${itsRange.value}%`;
      delete itsTxt.dataset.error;
      itsTxtContent.classList.remove('hide');
      itsChangeText();
    } else {
      // give error tip
      itsTxt.dataset.error = `% Stroma Range (Integer): -1 ~ 100`;
      itsTxtIp.focus();
    }
  });


  itsRange.addEventListener('change', itsChangeText);
  itsRange.addEventListener('mousemove', function(e) {
    if (e.buttons > 0) {
      itsChangeText(e);
    }
  });


  vtaTxt.addEventListener('click', function(e) {
    if (vtaRange.disabled) return;
    // set image zoom value to input
    let value = vtaTxtContent.textContent;
    value = value.slice(0, value.length-1);
    vtaTxtIp.value = +value;
    // hide txt
    vtaTxtContent.classList.add('hide');
    vtaTxtIp.focus();
    vtaTxtIp.select();
  });

  vtaTxt.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      vtaTxtIp.blur();
    }
  });

  vtaTxtIp.addEventListener('blur', function(e) {
    const regex = new RegExp(/^([1-9]?\d|100|-1)$/);
    const rs = regex.test(vtaTxtIp.value);
    if (rs) {
      vtaRange.value = vtaTxtIp.value;
      vtaTxtContent.textContent = `${vtaRange.value}%`;
      delete vtaTxt.dataset.error;
      vtaTxtContent.classList.remove('hide');
      vtaChangeText();
    } else {
      // give error tip
      vtaTxt.dataset.error = `sTILs Range (Integer): -1 ~ 100`;
      vtaTxtIp.focus();
    }
  });


  vtaRange.addEventListener('change', vtaChangeText);
  vtaRange.addEventListener('mousemove', function(e) {
    if (e.buttons > 0) {
      vtaChangeText(e);
    }
  });

  const actionBtn = document.querySelector('#left_menu .foot .action');

  actionBtn.addEventListener('click', (e) => {
    let tissueType = document.querySelector('#left_menu input[type=radio][name=tissue_type]:checked').value;

    let pitfalls = [];
    const pitfallSelections = document.getElementsByClassName('pitfalls_check');
    for (let pfBtn of pitfallSelections) {
      if (pfBtn.checked) {
        pitfalls.push(pfBtn.value);
      }
    }
    let label = $D.activeROI;
    const {x, y, width, height} = label.properties;
    label.properties.type = tissueType;
    label.properties.percent_stroma = itsRange.value;
    label.properties.til_density = vtaRange.value;
    label.properties.pitfalls = pitfalls;
    label.geometries.features[0].properties.style.color = '#7cfc00'; // overwrite highlight color
    label.task = 'pitfalls';
    const flileloc = $D.params.data.location.split('/');
    const fileName1 = flileloc[flileloc.length-1];
    label.alias = `${fileName1}_x${x}.${width}_y${y}.${height}`;
    console.log(label);
    saveLabel(label);
  });
}

function downloadSlide(e) {
  const location = $D.params.data.location;
  var fileName =``;
  var len = 0;
  var cur = 0;
  $CAMIC.store.downloadSlide(location).then((response) => {
    if (response.status == 200) {
      const headers = response.headers;
      const disposition = headers.get('content-disposition');
      len = headers.get('content-length');
      if (disposition && disposition.indexOf('attachment') !== -1) {
        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        var matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '');
        }
      }
      setDownloadModalTitle(fileName);
      setDownloadModalProgress(0);
      showDownloadModal();
      return response.body;
    } else {
      throw response;
    }
  })
      .then((body) => {
        const reader = body.getReader();

        return new ReadableStream({
          start(controller) {
            return pump();

            function pump() {
              return reader.read().then(({done, value}) => {
                // When no more data needs to be consumed, close the stream
                if (done) {
                  controller.close();
                  return;
                }
                // Enqueue the next data chunk into our target stream
                cur+=value.length;
                setDownloadModalProgress(Math.round(cur/len *100));
                controller.enqueue(value);
                return pump();
              });
            }
          },
        });
      })
      .then((stream) => new Response(stream))
      .then((response) => response.blob())
      .then((blob)=>{
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove(); // afterwards we remove the element again

        hideDownloadModal();
        window.URL.revokeObjectURL(blob);
      })
      .catch((err) => console.error(err));
}

function showDownloadModal() {
  $('#downloadModal').modal('show');
}
function hideDownloadModal() {
  $('#downloadModal').modal('hide');
}
function setDownloadModalTitle(title) {
  $('#downloadModal').find('.modal-title').text(title);
}
function setDownloadModalProgress(num) {
  $('#downloadModal').find('.progress-bar').css('width', `${num}%`).attr('aria-valuenow', num).text(`${num}%`);
}

function itsChangeHandler(x) {
  if (x.target.value >0) {
    // display next slider
    document.getElementById('vta_range').value = -1;
    document.getElementById('vta_txt').value = -1;
    document.getElementById('vta_txt_display').innerText = '-1%';
    document.getElementById('vta').style.display = 'block';
    document.getElementById('til_message').style.display = 'block';
  } else {
    // hide and reset next slider, tissue type, and pitfalls
    document.getElementById('tissue_type_area').style.display = 'none';
    document.getElementById('pitfalls_area').style.display = 'none';
    document.getElementById('vta').style.display = 'none';
    document.getElementById('til_message').style.display = 'none';
    document.getElementById('vta_range').value = -1;
    document.getElementById('tt_radio_1').checked = false;
    document.getElementById('tt_radio_2').checked = false;
    document.getElementById('tt_radio_3').checked = false;
    document.getElementById('tt_radio_4').checked = false;
    document.getElementById('vta_txt').value = -1;
    document.getElementById('vta_txt_display').innerText = '-1%';
    // reset pitfalls
    let checkboxes = document.querySelectorAll('#left_menu input[type=checkbox]');
    for (let check of checkboxes) {
      check.checked = false;
    }
    // hide save button
    document.getElementById('save').style.display = 'none';
  }
}
function vtaChangeHandler(x) {
  if (x.target.value >=0) {
    document.getElementById('tissue_type_area').style.display = 'block';
  } else {
    // hide save button, tissue type, and pitfalls
    document.getElementById('save').style.display = 'none';
    document.getElementById('tt_radio_1').checked = false;
    document.getElementById('tt_radio_2').checked = false;
    document.getElementById('tt_radio_3').checked = false;
    document.getElementById('tt_radio_4').checked = false;
    document.getElementById('tissue_type_area').style.display = 'none';
    document.getElementById('pitfalls_area').style.display = 'none';
  }
}

function makeFormReactive() {
  let roiTypeRadios = document.querySelectorAll('[name="roi_type"]');
  let tissueTypeRadios = document.querySelectorAll('[name="tissue_type"]');

  itsRange.addEventListener('change', itsChangeHandler);
  itsTxt.addEventListener('change', itsChangeHandler);
  vtaRange.addEventListener('change', vtaChangeHandler);
  vtaTxt.addEventListener('change', vtaChangeHandler);
  for (let rt of roiTypeRadios) {
    rt.addEventListener('change', function(e) {
      if (e.target.checked) {
        // reset the slider in either case
        // reset sliders
        document.getElementById('its_range').value = -1;
        document.getElementById('vta_range').value = -1;
        // reset text input (usually invisible)
        let sliderInputs = document.getElementsByClassName('slider-input');
        for (let si of sliderInputs) {
          si.value = -1;
        }
        let sliderInputDisplays = document.getElementsByClassName('slider_input_display');
        for (let sid of sliderInputDisplays) {
          sid.innerText = '-1%';
        }

        // reset pitfalls
        let checkboxes = document.querySelectorAll('#left_menu input[type=checkbox]');
        for (let check of checkboxes) {
          check.checked = false;
        }
        document.getElementById('tt_radio_1').checked = false;
        document.getElementById('tt_radio_2').checked = false;
        document.getElementById('tt_radio_3').checked = false;
        document.getElementById('tt_radio_4').checked = false;
        //document.getElementById('tissue_type_area').style.display = 'block';
        document.getElementById('pitfalls_area').style.display = 'none';
        // hide save button
        document.getElementById('save').style.display = 'none';
        if (e.target.value == 'Evaluable for sTILs') {
          // show sliders when evaluable
          document.getElementById('tissue_type_area').style.display = 'none';
          document.getElementById('sliders').style.display = 'block';
          document.getElementById('vta').style.display = 'none';
          document.getElementById('til_message').style.display = 'none';
          // tissue types 1 and 2 enable, 3 and 4 disable
          document.getElementById('tt_radio_1').disabled = false;
          document.getElementById('tt_radio_2').disabled = false;
          document.getElementById('tt_radio_3').disabled = true;
          document.getElementById('tt_radio_4').disabled = true;
        } else {
          // hide sliders when not evaluable
          document.getElementById('sliders').style.display = 'none';
          document.getElementById('tissue_type_area').style.display = 'block';
          // tissue types 1 and 2 disable, 3 and 4 enaable
          document.getElementById('tt_radio_1').disabled = true;
          document.getElementById('tt_radio_2').disabled = true;
          document.getElementById('tt_radio_3').disabled = false;
          document.getElementById('tt_radio_4').disabled = false;
        }
      }
    });
  }
  for (let tt of tissueTypeRadios) {
    tt.addEventListener('change', function(e) {
      // show pitfalls
      document.getElementById('pitfalls_area').style.display = 'block';
      // show save button
      document.getElementById('save').style.display = 'block';
      // reset pitfalls
      let checkboxes = document.querySelectorAll('#left_menu input[type=checkbox]');
      for (let check of checkboxes) {
        check.checked = false;
      }
    });
  }
}

makeFormReactive();

function resetForm() {
  console.log('reset form');
  
  // reset tissue and roi radio buttons
  let radios = document.querySelectorAll('#left_menu input[type=radio]:checked');
  for (let r of radios) {
    r.checked = false;
  }

  // reset and hide sliders
  document.getElementById('its_range').value = -1;
  document.getElementById('vta_range').value = -1;
  document.getElementById('sliders').style.display = "none";

  // reset text input (usually invisible)
  let sliderInputs = document.getElementsByClassName('slider-input');
  for (let si of sliderInputs) {
    si.value = -1;
  }
  let sliderInputDisplays = document.getElementsByClassName('slider_input_display');
  for (let sid of sliderInputDisplays) {
    sid.innerText = '-1%';
  }

  // reset pitfalls
  let checkboxes = document.querySelectorAll('#left_menu input[type=checkbox]');
  for (let check of checkboxes) {
    check.checked = false;
  }
  document.getElementById('tissue_type_area').style.display = "none";
  document.getElementById('pitfalls_area').style.display = "none";
  document.getElementById('save').style.display = "none";
}


// adding annotation
// TODO the form should start inactive until a roi is created.
function addAnnot(e) {
  if (!$D.activeROI) {
    let halfWidth = 1996/2;
    let halfHeight = 1996/2;
    let ctr = $CAMIC.viewer.viewport.viewportToImageCoordinates($CAMIC.viewer.viewport.pointFromPixel(e.position, true));
    let xCtr = Math.round(ctr.x);
    let yCtr = Math.round(ctr.y);
    console.log(xCtr, yCtr);
    let annot = {};
    // creator is populated on save
    // collectionName and collectionId are populated on save
    // geometry
    annot.geometries = {};
    annot.geometries.type = 'FeatureCollection';
    let coords = [[
      [xCtr-halfWidth, yCtr-halfHeight],
      [xCtr+halfWidth, yCtr-halfHeight],
      [xCtr+halfWidth, yCtr+halfHeight],
      [xCtr-halfWidth, yCtr+halfHeight],
      [xCtr-halfWidth, yCtr-halfHeight],
    ]];
    let feature = {};
    feature.geometry = {};
    feature.geometry.coordinates = coords;
    feature.geometry.type = 'Polygon';
    feature.type = 'Feature';
    feature.bound = {};
    feature.bound.coordinates = {};
    feature.properties = {style: {color: '#fcb000'}};
    feature.bound.type = 'Polygon';
    feature.bound.coordinates = coords;
    annot.geometries.features = [feature];
    annot.provenance = {};
    annot.provenance.image = {};
    annot.provenance.image.slide = $D.params.slideId;
    annot.provenance.image.name = $CAMIC.slideData.name;
    annot.provenance.analysis = {};
    annot.provenance.analysis.source = 'human';
    annot.provenance.analysis.computation = 'label';
    annot.provenance.analysis.execution_id = randomId();
    annot.provenance.analysis.name = annot.provenance.analysis.execution_id;
    annot.properties = {
      x: xCtr-halfWidth,
      y: yCtr-halfHeight,
      width: 2*halfWidth,
      height: 2*halfHeight,
      style: {color: '#fcb000'},
    };
    // todo, saving an roi should change its color before writing.
    label = annot;
    $D.activeROI = annot;
    const item = {};
    item.id = 'WIP';
    item.data = label;
    item.render = labelRender;
    item.clickable = true;
    item.hoverable = true;
    $CAMIC.viewer.omanager.addOverlay(item);
    $CAMIC.viewer.omanager.updateView();
    // hide new_roi_warn
    document.getElementById('new_roi_warn').style = 'display: none;';
    // reenable roi type radios
    resetForm();
    document.querySelectorAll('input[name="roi_type"]').forEach((input)=>{
      input.disabled = false;
    });
  } else {
    resetForm();
    console.log('trying to reposition roi');
    $CAMIC.viewer.omanager.removeOverlay('WIP');
    $D.activeROI = false;
    addAnnot(e);
  }
}

document.getElementById('quit').addEventListener('click', (x)=>{
  window.location = `./pitfallsTable.html?collectionId=${$D.params.collectionId}`;
});
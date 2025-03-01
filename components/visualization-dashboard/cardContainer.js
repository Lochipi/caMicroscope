(function() {
  // Synopsis
  var json = {
    id: getVisualizationData.id,
    name: getVisualizationData.name,
    annotations: getVisualizationData.annotations.length,
    heatmaps: getVisualizationData.heatmap.length,
  };

  const cardContainer = `
      <div class="card-container">
          <div class="row">
              <div class="card card-1">
                      <h4>Slide Name</h4>
                      <h2 id="slide-name">${json.name}</h2>
                      <h4>Slide Id</h4>
                      <h2 id="slide-id">${json.id}</h2>
              </div>
              <div class="card card-2">
                  <h4>Number of Annotations</h4>
                  <div class="number" id="number-of-annotations">${json.annotations}</div>
              </div>
              <div class="card card-3">
                  <h4>Number of Heatmaps</h4>
                  <div class="number" id="number-of-heatmaps">${json.heatmaps}</div>
              </div>
              <div class="card card-4">
                  <button class="expand-btn" onclick="openModal('usersOfAnnotationsChart')">
                      <span class="material-icons card-expand-icon">open_in_full</span>
                  </button>
                  <h4>Users of Annotations</h4>
                  <div class="centered-content-small" id="users-of-annotations">
                  <canvas id="usersOfAnnotationsChart"></canvas>
                  </div>
              </div>
          </div>
          <div class="row">
              <div class="card card-5">
                  <button class="expand-btn" onclick="openModal('drawAnnotationChart')">
                      <span class="material-icons card-expand-icon">open_in_full</span>
                  </button>
                  <h3>Draw Annotation Count vs Zooming</h3>
               <div class="centered-content"> 
               <canvas id="drawAnnotationChart"></canvas>
               </div>
                 
              </div>
              <div class="card card-6">
                  <button class="expand-btn" onclick="openModal('presetLabelsDataChart')">
                      <span class="material-icons card-expand-icon">open_in_full</span>
                  </button>
                  <h3>Preset Labels vs Preset Labels count</h3>
                    <div class="centered-content">
                  <canvas id="presetLabelsDataChart"></canvas>                    
                    </div>

              </div>
          </div>
      </div>
  `;

  document.body.insertAdjacentHTML('beforeend', cardContainer);

  // Prepare Data
  let drawAnnotationData = prepareDrawAnnotationData(getVisualizationData);
  let presetLabelsData = preparePresetLabelsData(getVisualizationData);
  let usersOfAnnotationsData = prepareUsersOfAnnotationsData(getVisualizationData);

  // Create Chart
  createAnnotationZoomingChart('drawAnnotationChart', drawAnnotationData);
  createPresetLabelsChart('presetLabelsDataChart', presetLabelsData);
  createUsersOfAnnotationsChart('usersOfAnnotationsChart', usersOfAnnotationsData);
})();

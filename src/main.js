//GLOBAL VARIABLES ====>
const loadBtn = $("#load-btn");
const predictBtn = $("#predict-btn");
const fileInput = $("#fileinput");
const displayImage = $("#display-img");
const viewModelBtn = $("#view-model-btn");
const programStatus = $("#status");
const tableWrapper = $("#table-result-wrapper");

let currentModelIndex = 3;
const modelList = ["model_1", "model_2", "model_3"];
const get_model_path = (modelIndex) =>
  `./models/${modelList[modelIndex - 1]}/build/model.json`;

const converter = (image, img_dim = [224, 224]) => {
  const img = tf.browser.fromPixels(image);
  const normalizationOffset = tf.scalar(255 / 2);
  return img
    .resizeNearestNeighbor(img_dim)
    .toFloat()
    .sub(normalizationOffset)
    .div(normalizationOffset)
    .reverse(2)
    .expandDims();
};

const disableButton = (buttons) => {
  buttons.forEach(function () {
    $(this).addClass("disable");
  });
};

const unDisableButton = (buttons) => {
  buttons.forEach(function (item) {
    item.removeClass("disable");
  });
};

let isShowModel = false;

const OBJEC_CLASS = ["car", "cat", "dog", "flower", "people"];

//GLOBAL VARIABLES ====>

!(function main() {
  $(".button").addClass("disable");
  $(async () => {
    await loadModel();
    unDisableButton([viewModelBtn, loadBtn]);
  });
})();

async function loadModel() {
  model = await tf.loadLayersModel(get_model_path(currentModelIndex));

  console.log("Load model done !");
  model.summary();
}

viewModelBtn.click(function () {
  if (!$(this).hasClass("disable")) {
    if (!isShowModel) {
      tfvis.show.modelSummary({ name: "Model summary" }, model);
      isShowModel = true;
    } else {
      tfvis.visor().toggle();
    }
  }
});

loadBtn.click(function () {
  if (!$(this).hasClass("disable")) {
    fileInput.click();
  }
});

predictBtn.click(function () {
  if (!$(this).hasClass("disable")) {
    $(".button").addClass("disable");
    $(".status-wrapper").removeClass("none");
    setTimeout(async () => {
      await predict();
    }, 1000);
  }
});

fileInput.change(function () {
  let reader = new FileReader();

  reader.onload = function () {
    let dataURL = reader.result;
    displayImage.attr("src", dataURL);
  };

  let file = fileInput.prop("files")[0];
  reader.readAsDataURL(file);
  unDisableButton([predictBtn]);
});

async function predict() {
  const img_input = displayImage[0];
  let tensor = converter(img_input);

  let predictions = await model.predict(tensor);
  unDisableButton([viewModelBtn, loadBtn]);
  $(".status-wrapper").addClass("none");
  predictions = [...predictions.dataSync()];
  // convert result to percent
  predictions = predictions.map((val) => {
    return Math.round(val * 100);
  });
  const html = `
  <table class="table table-striped table-bordered">
    <thead class="thead-dark">
      <tr>
        <th scope="col">Đối tượng</th>
        <th scope="col">Dự đoán</th>
      </tr>
    </thead>
    <tbody>
    ${OBJEC_CLASS.map((objectName, index) => {
      return `
        <tr>
          <td>${objectName}</td>
          <td>${predictions[index] + " %"}</td>
        </tr>
        `;
    }).join("")}
    </tbody>
  </table>
  `;
  tableWrapper.html(html);
}

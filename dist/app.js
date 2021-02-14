// detect enter key press to search the image
  document.getElementById('search').addEventListener("keyup", function(e) {
    if (e.code === 'Enter') {
      document.getElementById("search-btn").click();
    }
  });

const imagesArea = document.querySelector('.images');
const gallery = document.querySelector('.gallery');
const galleryHeader = document.querySelector('.gallery-header');
const searchBtn = document.getElementById('search-btn');
const sliderBtn = document.getElementById('create-slider');
const sliderContainer = document.getElementById('sliders');
// selected images
let sliders = [];


// If this key doesn't work
// Find the name in the url and go to their website
// to create your own api key
const KEY = '15674931-a9d714b6e9d654524df198e00&q';

// show images 
const showImages = (images) => {
  imagesArea.style.display = 'block';
  gallery.innerHTML = '';
  // show gallery title
  galleryHeader.style.display = 'flex';
  images.forEach(image => {
    let div = document.createElement('div');
    div.className = 'col-lg-3 col-md-4 col-xs-6 img-item mb-2';
    div.innerHTML = ` <img class="img-fluid img-thumbnail" onclick=selectItem(event,"${image.webformatURL}") src="${image.webformatURL}" alt="${image.tags}">`;
    gallery.appendChild(div)
  })
  // call the toggleSpinner function
  toggleSpinner('spinner');
}

const getImages = (query) => {
  // call toggleSpinner function and clear the searched items
  toggleSpinner('spinner');
  gallery.innerHTML = '';

  // search items
  fetch(`https://pixabay.com/api/?key=${KEY}=${query}&image_type=photo&pretty=true`)
    .then(response => response.json())
    .then(data => showImages(data.hits))
    .catch(err => console.log(err))

}

// call the toggleSpinner function
const toggleSpinner = (id) => {
  const spinner = document.getElementById(id);
  spinner.classList.toggle('d-none');
}


let slideIndex = 0;
const selectItem = (event, img) => {
  let element = event.target;
  element.classList.add('added');
 
  let item = sliders.indexOf(img);
  if (item === -1) {
    sliders.push(img);
  } else {
    sliders.splice(item, 1);
    element.classList.remove('added');
  }
}
var timer
const createSlider = () => {

  // check slider image length
  if (sliders.length < 2) {
    alert('Select at least 2 image.')
    return;
  }

  // check and set the duration value
  const durationId = document.getElementById('duration');
  let duration = durationId.value || 1000;
  if (duration < 0){
    duration = -duration;
  }
  
  if (duration < 1000){
    duration = 1000;
  }


  // crate slider previous next area
  sliderContainer.innerHTML = '';
  const prevNext = document.createElement('div');
  prevNext.className = "prev-next d-flex w-100 justify-content-between align-items-center";
  prevNext.innerHTML = ` 
  <span class="prev" onclick="changeItem(-1)"><i class="fas fa-chevron-left"></i></span>
  <span class="next" onclick="changeItem(1)"><i class="fas fa-chevron-right"></i></span>
  `;

  sliderContainer.appendChild(prevNext)
  document.querySelector('.main').style.display = 'block';
  // hide image area
  imagesArea.style.display = 'none';

 
  sliders.forEach(slide => {
    let item = document.createElement('div');
    item.className = "slider-item";
    item.innerHTML = `<img class="w-100"
    src="${slide}"
    alt="">`;
    sliderContainer.appendChild(item);

  })
  changeSlide(0)
  timer = setInterval(function () {
    slideIndex++;
    changeSlide(slideIndex);
  }, duration);
}

// change slider index 
const changeItem = index => {
  changeSlide(slideIndex += index);
}

// change slide item
const changeSlide = (index) => {

  const items = document.querySelectorAll('.slider-item');
  if (index < 0) {
    slideIndex = items.length - 1
    index = slideIndex;
  };

  if (index >= items.length) {
    index = 0;
    slideIndex = 0;
  }

  items.forEach(item => {
    item.style.display = "none"
  })

  items[index].style.display = "block"
}

const searchItem = () => {
    document.querySelector('.main').style.display = 'none';
    clearInterval(timer);
    const search = document.getElementById('search');
    getImages(search.value)
    sliders.length = 0;
  }

searchBtn.addEventListener('click', function(){
  searchItem()
});

sliderBtn.addEventListener('click', function () {
  createSlider();
})

// creating zip file of selected images by JSZip
const download = (url) => {
  return fetch(url).then(res => res.blob());
}

// download group of images
const downloadByGroup = (urls, files_per_group=5) => {
  return Promise.map(
    urls, 
    async url => {
      return await download(url);
    },
    {concurrency: files_per_group}
  );
}

// export zip file
const exportZip = blobs => {
  const zip = JSZip();
  blobs.forEach((blob, i) => {
    zip.file(`file-${i}.jpg`, blob);
  });
  zip.generateAsync({type: 'blob'}).then(zipFile => {
    const currentDate = new Date().getTime();
    const fileName = `Fancy-Sliders-${currentDate}.zip`;
    toggleSpinner('download-spinner');
    return saveAs(zipFile, fileName);

  });
}

// download images and zip them
const downloadAndZip = () => {
  toggleSpinner('download-spinner');
  return downloadByGroup(sliders, 5).then(exportZip);
}

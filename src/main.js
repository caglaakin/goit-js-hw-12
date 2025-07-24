import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import axios from 'axios';

const form = document.querySelector('.form');
const searchInput = document.querySelector('.searchInput');
const searchButton = document.querySelector('.searchButton');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreContainer = document.querySelector('.load-more-container');
const loadMoreButton = document.querySelector('.load-more-btn');
const loadMoreLoader = document.querySelector('.load-more-loader');

const API_KEY = '51442110-4fde2839a6cf4cc45b6823f02';
const BASE_URL = 'https://pixabay.com/api/';

let currentPage = 1;
const perPage = 40;
let totalHits = 0;
let currentQuery = "";

let lightbox = new SimpleLightbox('.gallery a.gallery-link', {
  navText: ['❮', '❯'],
  captionsData: 'alt',
  captionDelay: 250,
  captionPosition: 'bottom',
  close: true,
  closeText: '×',
  animationSlide: true,
  animationSpeed: 250,
  enableKeyboard: true,
  overlay: true,
  overlayOpacity: 0.8,
  sourceAttr: 'href',
  zoom: false,
});

function hideLoader(loaderElement) {
    loaderElement.classList.add('is-hidden');
}

function showLoader(loaderElement) {
    loaderElement.classList.remove('is-hidden');
}

function createGalleryMarkup(images) {
  return images
    .map(image => {
      return `
        <li class="gallery-item">
            <a class="gallery-link" href="${image.largeImageURL}">
                <img class="gallery-image" src="${image.webformatURL}" alt="${image.tags}" />
            </a>
            <div class="image-info">
                <p class="info"><b>Likes</b>${image.likes}</p>
                <p class="info"><b>Views</b>${image.views}</p>
                <p class="info"><b>Comments</b>${image.comments}</p>
                <p class="info"><b>Downloads</b>${image.downloads}</p>
            </div>
        </li>`;
    })
    .join('');
}

async function fetchImages(query, page) { 
    const searchParams = new URLSearchParams({
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: perPage,
    });

    try {
        const response = await axios.get(`${BASE_URL}?${searchParams}`);
        return response.data;
    } catch (error) { 
        console.error('Error fetching images:', error);
        iziToast.error({
            title: 'Error',
            message: `An error occurred while fetching images: ${error.message}`,
            position: 'topRight',
        });
        throw error;
    }
}


form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();

  if (query === '') {
    iziToast.error({
      message: 'Please enter a search term.',
      position: 'topRight',
      backgroundColor: '#EF4040',
      messageColor: 'white',
      progressBarColor: '#B51B1B',
      closeOnClick: true,
      closeOnEscape: true,
      close: true,
      timeout: 3000,
      maxWidth: '450px',
    });
    return;
  }

    currentPage = 1;
    currentQuery = query;
    gallery.innerHTML = '';
    hideLoader(loadMoreButton);
    showLoader(loader);

    try {
        const data = await fetchImages(currentQuery, currentPage);
        totalHits = data.totalHits;
        const images = data.hits;

        if (images.length === 0) {
            iziToast.error({
                message:
                    'Sorry, there are no images matching your search query. Please try again!',
                position: 'topRight',
                backgroundColor: '#EF4040',
                messageColor: 'white',
                progressBarColor: '#B51B1B',
                closeOnClick: true,
                closeOnEscape: true,
                close: true,
                timeout: 3000,
                maxWidth: '450px',
            });
            return;
        }

        gallery.innerHTML = createGalleryMarkup(images);
        lightbox.refresh();
        
        const totalPage = Math.ceil(totalHits / perPage);
        if (totalPage > 1) {
            showLoader(loadMoreButton);
            loadMoreContainer.classList.remove('is-hidden');
        } else {
            iziToast.info({
                message: `We're sorry, but you've reached the end of search results.`,
                position: 'topRight',
                backgroundColor: '#3A8EBA',
                messageColor: 'white',
                progressBarColor: '#1B5BB5',
                closeOnClick: true,
                closeOnEscape: true,
                close: true,
                timeout: 3000,
                maxWidth: '450px',
            });
        }
        
    } catch (error) {
        iziToast.error({
            title: 'Error',
            message: `An error occurred while fetching images: ${error.message}`,
            position: 'topRight',
        });
        console.error('Error fetching images:', error);
    } finally { 
        hideLoader(loader);
        searchInput.value = '';
    }
    
});


loadMoreButton.addEventListener("click", async () => { 
    currentPage += 1;
    hideLoader(loadMoreButton);
    showLoader(loadMoreLoader);

    try {
        const data = await fetchImages(currentQuery, currentPage);
        const images = data.hits;

        const markup = createGalleryMarkup(images);
        gallery.insertAdjacentHTML('beforeend', markup);
        lightbox.refresh();

        const galleryItemHeight = gallery.firstElementChild.getBoundingClientRect().height;
        window.scrollBy({
            top: galleryItemHeight * 2,
            behavior: 'smooth',
        });

        if (currentPage * 40 >= totalHits) {
            hideLoader(loadMoreButton);
            iziToast.info({
                message: `We're sorry, but you've reached the end of search results.`,
                position: 'topRight',
                backgroundColor: '#3A8EBA',
                messageColor: 'white',
                progressBarColor: '#1B5BB5',
                closeOnClick: true,
                closeOnEscape: true,
                close: true,
                timeout: 3000,
                maxWidth: '450px',
            });
        } else {
            showLoader(loadMoreButton);
        }

    } catch (error) {
        iziToast.error({
            title: 'Error',
            message: `An error occurred while fetching more images: ${error.message}`,
            position: 'topRight',
        });
        console.error('Error fetching more images:', error);
    } finally { 
        hideLoader(loadMoreLoader);
    }

});
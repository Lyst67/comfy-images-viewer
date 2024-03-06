import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { PixabayAPI } from "./api";
import { Notify } from "notiflix/build/notiflix-notify-aio";

const lightbox = new SimpleLightbox(".gallery a", {
  captionsData: "alt",
  captionDelay: 250,
  alertError: false,
  loop: true,
});

const pixabuyApi = new PixabayAPI();
const refs = {
  formEl: document.querySelector(".search-form"),
  galleryListEl: document.querySelector(".js-gallery"),
  pageEl: document.querySelector(".page"),
  pageCountEl: document.querySelector(".page-count"),
  selectLangEl: document.querySelector(".lang-select"),
  searchBtnEl: document.querySelector(".search-form button"),
};
refs.selectLangEl.addEventListener("change", handleLangSwitch);
refs.formEl.addEventListener("submit", handleSearchFormSubmit);

const observer = new IntersectionObserver(endlessScroll, { threshold: 0.9 });
function endlessScroll([entry], observer) {
  if (entry.isIntersecting) {
    observer.unobserve(entry.target);
  }
  if (entry.intersectionRatio <= 0) {
    return;
  }
  handleLoadMorePhotos();
}

function handleSearchFormSubmit(evt) {
  evt.preventDefault();
  refs.galleryListEl.innerHTML = "";
  pixabuyApi.page = 1;
  window.scrollTo({ top: 0, behavior: "smooth" });
  const searchQuery = evt.currentTarget.elements.searchQuery.value.trim();
  pixabuyApi.query = searchQuery;
  pixabuyApi
    .fetchPixabayPhotos()
    .then(({ data }) => {
      console.log(refs.pageCountEl);
      const roundOfPages = Math.round(data.total / pixabuyApi.per_page);
      refs.pageCountEl.textContent = `${pixabuyApi.page}/${roundOfPages}`;
      const cartData = data.hits;
      refs.galleryListEl.innerHTML = createGalleryCards(cartData);
      lightbox.refresh();
      if (refs.galleryListEl.lastElementChild) {
        const target = refs.galleryListEl.lastElementChild;
        observer.observe(target);
      }
      if (cartData.length === 0) {
        Notify.failure(
          "Sorry, there are no images matching your search query. Please try again."
        );
      } else {
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function handleLoadMorePhotos() {
  pixabuyApi.page += 1;
  pixabuyApi
    .fetchPixabayPhotos()
    .then(({ data }) => {
      const cartData = data.hits;
      const countOfPages = data.total / pixabuyApi.per_page;
      const roundOfPages = Math.round(countOfPages);
      refs.pageCountEl.textContent = `${pixabuyApi.page}/${roundOfPages}`;

      refs.galleryListEl.insertAdjacentHTML(
        "beforeend",
        createGalleryCards(cartData)
      );
      lightbox.refresh();
      const target = refs.galleryListEl.lastElementChild;
      console.log(pixabuyApi.page);
      console.log(countOfPages);
      if (pixabuyApi.page > countOfPages) {
        Notify.failure(
          `We're sorry, but you've reached the end of search results.`
        );
        observer.unobserve(target);
      } else {
        observer.observe(target);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function createGalleryCards(arr) {
  return arr
    .map(
      ({
        likes,
        downloads,
        comments,
        views,
        webformatURL,
        tags,
        largeImageURL,
      }) => `<li class="photo-card"><div class="photo"><a class="gallery__link" href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy"/></a>
      </div>
            <div class="info">
              <p class="info-item">
                <b>Likes</b><span>${likes}</span>
              </p>
              <p class="info-item">
                <b>Views</b><span>${views}</span>
              </p>
              <p class="info-item">
                <b>Comments</b><span>${comments}</span>
              </p>
              <p class="info-item">
                <b>Downloads</b><span>${downloads}</span>
              </p></div></li>`
    )
    .join("");
}

function handleLangSwitch(evt) {
  const selectLang = evt.currentTarget.value;
  if (selectLang === "ukr") {
    refs.searchBtnEl.textContent = "Пошук";
    refs.pageEl.textContent = "сторінка:";
    pixabuyApi.selected_lang = "uk";
  } else {
    refs.searchBtnEl.textContent = "Search";
    refs.pageEl.textContent = "page:";
    pixabuyApi.selected_lang = "en";
  }
}

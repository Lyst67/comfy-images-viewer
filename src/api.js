import axios from "axios";
export class PixabayAPI {
  #API_KEY = "?key=38613829-66758419eaca37922b4e1f24f";
  #BASE_URL = "https://pixabay.com/api/";
  query = null;
  page = 1;
  per_page = 20;
  selected_lang = "en";

  fetchPixabayPhotos = async () => {
    return await axios.get(`${this.#BASE_URL}${this.#API_KEY}`, {
      params: {
        q: this.query,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true,
        page: this.page,
        per_page: this.per_page,
        lang: this.selected_lang,
      },
    });
  };
}

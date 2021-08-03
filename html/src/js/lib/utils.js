import { sanitize } from 'dompurify';

import {
  mimirMenu,
  notesList,
  colDaNota,
  noteHeader,
  captchaErrorLogin,
  loginError,
} from './elements.js';

// this is our utils functions and data

// Array with valid image file types for uploading image, got from:
// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
export const fileTypes = [
  'image/apng',
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/svg+xml',
  'image/tiff',
  'image/webp',
  'image/x-icon',
];

// Function to validate image file type on image file upload, got from:
// https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types

export function validFileType(file) {
  return fileTypes.includes(file.type);
}

// let's create an object to monitor every menu state,
// so we can close menus when we click on other items or other menus

export const menuState = {
  catRename: false,
  catStack: false,
  toggleMenu(menu) {
    if (this[menu] === true) {
      this[menu] = false;
    } else {
      this[menu] = true;
    }
  },
};

// Function to insert data into textarea, got from
// https://stackoverflow.com/a/58356806/8754987
// but modified a bit by me:

export function insertAtCaret(input, text) {
  const textarea = document.querySelector(input);
  textarea.setRangeText(
    text,
    textarea.selectionStart,
    textarea.selectionEnd,
    'end'
  );
}

// this is a function to toggle the menu on our layout

export const toggleMimirMenu = () => {
  mimirMenu.classList.toggle('d-none');
  mimirMenu.classList.toggle('h-100');
};

// this is a function to toggle the notes list on our layout:

export const toggleNotesList = () => {
  const btExpandListaNotas = document.querySelector('#btexpandirlistanotas');
  btExpandListaNotas.classList.toggle('d-none');
  notesList.classList.toggle('d-none');
  colDaNota.classList.toggle('col-7');
  colDaNota.classList.toggle('col-12');
  noteHeader.classList.toggle('col-10');
  noteHeader.classList.toggle('col-12');
};

// this is a function to show the login form

export function showLogin() {
  // let's pop the login modal open
  $('#loginModal').modal('show');
}

// function to show the upload modal (for uploading pictures)

export function showUploadModal() {
  // let's pop the upload image modal:
  $('#uploadImgModal').modal('show');
  const modalBackdrop = document.querySelector('.modal-backdrop');
  modalBackdrop.classList.toggle('uploadimage');
}

// function to wait, credits to Wes Bos

export function wait(ms = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
// function to insert loading animation before content loads

export function insertLoading(element) {
  const height = element.offsetHeight;
  const loading = 25;
  const loadingQty = height / loading;
  for (let i = 0; i < loadingQty; i++) {
    const loaderHtml =
      '<div class="mm-loadingdata row"><div class="col mm-loadingdatacol"><span class="mm-loadingdot mm-loadingcolor"></span><span class="mm-loadingline mm-loadingcolor"></span></div></div>';
    const clean = sanitize(loaderHtml);
    element.innerHTML += clean;
  }
}

// function to clear login errors:

export function clearLoginErrors() {
  if (captchaErrorLogin.classList.contains('d-block')) {
    captchaErrorLogin.classList.toggle('d-block');
  }
  if (loginError.classList.contains('d-block')) {
    loginError.classList.toggle('d-block');
  }
}

// function to get cookie (so we can for instance use it on csrf cookie)

export function getCookie(cname) {
  const name = `${cname}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

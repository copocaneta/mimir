import $ from 'jquery';
import 'bootstrap';
import '@fortawesome/fontawesome-free/css/all.css';
import 'bootstrap4-tagsinput/tagsinput.css';
// import jQuery from 'jquery';
import './lib/jquery-global.js';
import {
  btnSignup,
  formSignup,
  signupModal,
  loginForm,
  noteHeader,
  stackingCategoryPopover,
  renameCategoryPopover,
  divButtonsCategoryControl,
  colDaNota,
  mimirMenu,
  profileModal,
  noteControlIcons,
  noteForm,
  notesListTbody,
  botaoMenuExp,
  botaoMenuAbMd,
  botaoNotesList,
  botaoExpandListaNotas,
  botaoAddNote,
  botaoUploadImage,
  imageUploadInput,
  stackingCategoriesSearchDiv,
  stackingCategoriesListDiv,
  buttonCategoryRemovalConf,
  buttonNoteRemovalConf,
  searchResultsEl,
  btnAllNotes,
  topSection,
  searchEl,
  logo,
} from './lib/elements.js';
import {
  listFavorites,
  listCategories,
  listNotesByCat,
  listRecentNotes,
  showNote,
  getUserProfilePicture,
  checkToken,
  validateForm,
  // accessTokenMem,
  handleLogin,
  // nwNoteCategoriesSearchTerm,
  showCategoriesListPopover,
  showStackListPopover,
  handleNoteControlIcons,
  addNewNote,
  handleCategoryDelete,
  handleCategoryRename,
  makeCatStack,
  handleStackSelection,
  handleCategoryDeleteConf,
  handleNoteDeleteConf,
  populateProfileModal,
  handleLogOut,
  populateProfileEditName,
  handleProfileNameEdit,
  populateProfileEditPassword,
  handleProfilePasswordChange,
  populateProfileEditPicture,
  handleSearchNote,
  runOnPageLoad,
  showHomePage,
  handlePageLoadPostNoteRemoval,
  // passwordScore,
  // changePasswordScore,
} from './lib/handlers.js';
import {
  createCategory,
  uploadImage,
  handleUploadProfilePic,
} from './lib/index.js';
import { wait, toggleMimirMenu, toggleNotesList } from './lib/utils.js';
// import { sanitize } from 'dompurify';

// import('https://cdn.jsdelivr.net/npm/markdown-it@10.0.0/dist/markdown-it.min.js');
// import('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.2.1/highlight.min.js');

// const jQuery = require('jquery');
// require('pwstrength-bootstrap/dist/pwstrength-bootstrap.min.js');
import 'pwstrength-bootstrap/dist/pwstrength-bootstrap.min.js';

window.$ = window.jQuery = jQuery;
require('bootstrap4-tagsinput/tagsinput.js');

let accessTokenMem;

// let's initiate our variables to keep password strength
// (for signing up and for changing profile password)

let passwordScore;
let changePasswordScore;

// let's initialize the selectedTrNote which is the tr (row)
// for the note clicked to show
let selectedTrNote;

// let's iniitialize our variable for searching category stacks:

// let's set our selected category list

let selectedCatId = 'all';
let selectedCatName;
let latestNoteId;

// const markdown = document.querySelector('#markdown-content').innerHTML;

// const html = md.render(markdown);

// document.querySelector('#markdown-content').innerHTML = html;

// password strength measure:

$('#inputPasswordSignup').pwstrength({
  ui: {
    showVerdictsInsideProgressBar: false,
  },
  common: {
    onKeyUp(evt, data) {
      passwordScore = data.score;
    },
  },
});

// the popover for the category selection inside adding a note

$('[data-toggle="popover"]').popover({
  html: true,
  sanitize: false,
  content() {
    const content = $(this).attr('data-popover-content');
    return $(content).find('.popover-body').clone();
  },
});

// Page load calls:

// latestNoteId = runOnPageLoad();

// The Event Listeners

logo.addEventListener('click', showHomePage);

document.addEventListener('DOMContentLoaded', checkToken);

btnSignup.addEventListener('click', () => {
  $('#loginModal').modal('hide');
  $('#signupModal').modal('show');
});

formSignup.addEventListener('click', (e) => {
  validateForm(e, passwordScore);
});

// Event listener for button OK on form signup:

signupModal.addEventListener('click', (e) => {
  if (e.target.id === 'buttonoksignup') {
    $('#loginModal').modal('show');
    $('#signupModal').modal('hide');
  }
});

loginForm.addEventListener('submit', (e) => {
  accessTokenMem = handleLogin(e);
});

// this is our event delegation to handle clicks inside the note header,
// this will include the category popover and others:

noteHeader.addEventListener('click', (e) => {
  // show categories popover

  if (e.target.id === 'btexpandcategory') {
    const categoryPopOver = document.querySelector('#categoryPopOver');
    categoryPopOver.classList.toggle('d-none');
  }
  // create new category

  if (e.target.matches('.createCatButton')) {
    const nwNoteCategoriesSearchInput = document.querySelector(
      '#nwNoteCategoriesSearch'
    );
    const name = e.target.dataset.catname;
    createCategory(name);
    // nwNoteCategoriesSearchInput.value = '';
    // nwNoteCategoriesSearchTerm = '';
    wait(500).then(() => {
      noteHeader.dispatchEvent(new CustomEvent('categoryCreated'));
    });
  }

  // select a category from the category popover

  if (e.target.matches('.mm-ctglistnwnote-name')) {
    const categoryPopOver = document.querySelector('#categoryPopOver');
    const newNoteCategoryEl = document.querySelector('#newnotecategorytext');
    // if the target instead was an element with the 'mm-ctglistnwnote-name' class
    // then it means the user has selected an existing category
    const catId = e.target.dataset.catid;
    // alert(`selecionou uma categoria com o ID ${catId} e value ${e.target.textContent}`);
    newNoteCategoryEl.dataset.selectedcat = catId;
    newNoteCategoryEl.textContent = e.target.textContent;
    categoryPopOver.classList.toggle('d-none');
  }
});

noteHeader.addEventListener('input', (e) => {
  if (e.target.id === 'nwNoteCategoriesSearch') {
    // saving the search input value
    const nwNoteCategoriesSearchTerm = e.target.value;
    // re-displaying countries based on the new search_term
    showCategoriesListPopover(nwNoteCategoriesSearchTerm);
  }
});

// custom event listener for when stack is selected:

stackingCategoryPopover.addEventListener('stackSelected', () => {
  listCategories();
  wait(500).then(() => {
    showStackListPopover();
  });
  // showStackListPopover();
});

// custom event listener for when category is created to update category list:

noteHeader.addEventListener('categoryCreated', () => {
  showCategoriesListPopover();
  listCategories();
});

// custom event listener for when category is renamed:

renameCategoryPopover.addEventListener(
  'categoryRenamed',
  showCategoriesListPopover
);
renameCategoryPopover.addEventListener('categoryRenamed', listCategories);

// custom event listener for when category turns into stack:

divButtonsCategoryControl.addEventListener('stackCategory', listCategories);
divButtonsCategoryControl.addEventListener('stackCategory', () => {
  wait(500).then(() => {
    listNotesByCat({ catId: selectedCatId, name: selectedCatName });
  });
});

// custom event listeners for when note is created to update category list

colDaNota.addEventListener('noteCreated', (e) => {
  listNotesByCat({
    catId: e.detail.selectedCatId,
    name: e.detail.selectedCatName,
  });
  listRecentNotes();
  listFavorites();
});

// custom event listeners for when note is edited to update category list:

colDaNota.addEventListener('noteEdited', (e) => {
  listNotesByCat({
    catId: e.detail.selectedCatId,
    name: e.detail.selectedCatName,
  });
  listFavorites();
});

// custom event listener to update favorites list when note is favorited:

mimirMenu.addEventListener('favoriteToggled', listFavorites);

// custom event listener to update categories after removing category

divButtonsCategoryControl.addEventListener('categoryRemoved', () => {
  listCategories();
  selectedCatId = 'all';
  listNotesByCat({ catId: selectedCatId });
});

// custom event listener for when category is removed
divButtonsCategoryControl.addEventListener('noteRemoved', () => {
  const selectedCatIdOnNoteRemoval = document.querySelector(
    '#newnotecategorytext'
  ).dataset.selectedcat;
  handlePageLoadPostNoteRemoval(selectedCatIdOnNoteRemoval);
  // listNotesByCat({ catId: e.detail.selectedCatId });
  // listFavorites();
  // listRecentNotes();
  // const latestNoteIdAfterRemoval = runOnPageLoad;
  // showNote(latestNoteIdAfterRemoval);
});

// this is the event listener for when a new profile picture is uploaded:

profileModal.addEventListener('profilePicChanged', () => {
  getUserProfilePicture();
  populateProfileModal();
});

// this is our event delegation to handle clicks inside the sidebar

mimirMenu.addEventListener('click', (e) => {
  // we have to select it by class because ID wont work since it's multiple buttons
  // cant have the same ID for multiple elements
  if (e.target.matches('.mm-favoriteitembutton')) {
    const { noteid } = e.target.dataset;
    showNote(noteid);
  }
  // CATEGORY MENU ITEMS:
  if (e.target.matches('.mm-categoriesbutton')) {
    // alert('TODO');
    const { catid, catname, stack } = e.target.dataset;
    selectedCatId = catid;
    selectedCatName = catname;
    listNotesByCat({ catId: catid, name: catname, stack });
  }
  // RECENT MENU ITEMS:
  if (e.target.matches('.mm-recentitembutton')) {
    const { noteid } = e.target.dataset;
    showNote(noteid);
  }
});

// event delegation for the new note header

noteControlIcons.addEventListener('click', handleNoteControlIcons);

noteForm.addEventListener('submit', (e) => {
  e.preventDefault();
});

notesListTbody.addEventListener('click', (e) => {
  if (e.target.parentElement.hasAttribute('data-noteid')) {
    // let's toggle the class for the seleted tr before marking
    // the newly selected tr as the selected tr
    if (selectedTrNote) {
      if (selectedTrNote.classList.contains('selectednote')) {
        selectedTrNote.classList.toggle('selectednote');
      }
    }
    const noteId = e.target.parentElement.dataset.noteid;
    selectedTrNote = e.target.parentElement;
    // now let's toggle the .selectednote class on the tr that was clicked:
    selectedTrNote.classList.toggle('selectednote');
    showNote(noteId);
  }
});

// buttonfavicon.addEventListener('click', toggleFavorite)

botaoMenuExp.addEventListener('click', toggleMimirMenu);
botaoMenuAbMd.addEventListener('click', toggleMimirMenu);
botaoNotesList.addEventListener('click', toggleNotesList);
botaoExpandListaNotas.addEventListener('click', toggleNotesList);

botaoAddNote.addEventListener('click', addNewNote);
botaoUploadImage.addEventListener('click', uploadImage);

imageUploadInput.addEventListener('change', () => {
  if (!imageUploadInput.classList.contains('mm-uploadinputfileselected')) {
    imageUploadInput.classList.add('mm-uploadinputfileselected');
  }
});

divButtonsCategoryControl.addEventListener('click', (e) => {
  // RENAME CATEGORY EVENT LISTENER:

  if (e.target.id === 'buttonrenamecategory') {
    // alert('achooou');
    // $('#buttonrenamecategory').tooltip('hide');
    renameCategoryPopover.classList.toggle('d-none');
    const renameCategoryForm = document.querySelector('#renamecategoryform');
    renameCategoryForm.dataset.catid = e.target.dataset.catid;
  } else if (e.target.id === 'buttonliststackoptions') {
    // SHOW CATEGORY STACK OPTIONS
    stackingCategoryPopover.classList.toggle('d-none');
    stackingCategoriesSearchDiv.innerHTML = '';
    stackingCategoriesListDiv.innerHTML = '';
    if (e.target.dataset.stack !== 'true') {
      const labelInputSearch = document.createElement('label');
      labelInputSearch.textContent = 'Select parent stack:';
      labelInputSearch.setAttribute('for', 'stacksearch');
      labelInputSearch.classList.add('my-2', 'w-100');
      const stackSeachInput = document.createElement('input');
      stackSeachInput.type = 'text';
      stackSeachInput.id = 'stacksearch';
      stackSeachInput.placeholder = 'Search for a stack';
      stackSeachInput.autocomplete = 'off';
      stackSeachInput.classList.add('w-100');
      stackingCategoriesSearchDiv.appendChild(labelInputSearch);
      stackingCategoriesSearchDiv.appendChild(stackSeachInput);
      showStackListPopover();
    }
  } else if (e.target.id === 'buttondeletecategory') {
    // HANDLE CATEGORY DELETE
    handleCategoryDelete(e);
  }
});

renameCategoryPopover.addEventListener('submit', (e) => {
  handleCategoryRename(e);
});

stackingCategoryPopover.addEventListener('input', (e) => {
  if (e.target.id == 'stacksearch') {
    // saving the search input value
    const stackSeachInputTerm = e.target.value;
    // showing categories based on the new search term
    showStackListPopover(stackSeachInputTerm);
  }
});

// let's do an event delegation to capture click event on the stack selection

stackingCategoryPopover.addEventListener('click', (e) => {
  if (e.target.id === 'buttonstackcat') {
    makeCatStack(e);
  }
  if (e.target.matches('.mm-stacklist-name')) {
    handleStackSelection(e);
    // alert(e.target.dataset.catid);
  }
});

buttonCategoryRemovalConf.addEventListener('click', (e) => {
  handleCategoryDeleteConf(e);
});

buttonNoteRemovalConf.addEventListener('click', (e) => {
  handleNoteDeleteConf(e);
});

document.addEventListener('click', (event) => {
  if (
    !stackingCategoryPopover.matches('.d-none') &&
    event.target.id != 'buttonliststackoptions'
  ) {
    if (!stackingCategoryPopover.contains(event.target)) {
      stackingCategoryPopover.classList.toggle('d-none');
    }
  } else if (
    !renameCategoryPopover.matches('.d-none') &&
    event.target.id != 'buttonrenamecategory'
  ) {
    if (!renameCategoryPopover.contains(event.target)) {
      renameCategoryPopover.classList.toggle('d-none');
    }
  } else if (!searchResultsEl.matches('.d-none')) {
    if (!searchResultsEl.contains(event.target)) {
      searchResultsEl.classList.toggle('d-none');
    }
  }
  if (document.querySelector('#categoryPopOver')) {
    const categoryPopOver = document.querySelector('#categoryPopOver');
    if (!categoryPopOver.matches('.d-none')) {
      if (
        !categoryPopOver.contains(event.target) &&
        event.target.id !== 'btexpandcategory'
      ) {
        categoryPopOver.classList.toggle('d-none');
      }
    }
  }
});

// the all notes button event listener:

btnAllNotes.addEventListener('click', () => {
  selectedCatId = 'all';
  listNotesByCat({ catId: 'all' });
});

topSection.addEventListener('click', (e) => {
  if (e.target.id === 'profileanchor') {
    //
    populateProfileModal();
    $('#profile-modal').modal('show');
  }
  if (e.target.id === 'logout') {
    handleLogOut();
  }
});

profileModal.addEventListener('click', (e) => {
  // if the button clicked was to start name editing:
  if (e.target.id === 'bt-editprofilename') {
    populateProfileEditName(e);
  }
  // if the button clicked was to save name edit
  if (e.target.id === 'bt-saveprofilename') {
    e.target.setAttribute('disabled', true);
    const inputProfileName = document.querySelector('#input-profilename');

    handleProfileNameEdit(inputProfileName.value);
  }
  // if the button clicked was to cancel name edit
  if (e.target.id === 'bt-canceleditname') {
    populateProfileModal();
  }
  // if the button clicked was to start password change:
  if (e.target.id === 'bt-editprofilepasswd') {
    populateProfileEditPassword(e);
  }
  // if the button clicked was to save password change
  if (e.target.id === 'bt-savechangepwd') {
    e.target.setAttribute('disabled', true);
    const inputNewPwd = document.querySelector('#input-newpwd');
    const inputConfNewPwd = document.querySelector('#input-confnewpwd');
    const inputCurrPwd = document.querySelector('#input-curpwd');

    if (inputCurrPwd.value == '') {
      inputCurrPwd.setCustomValidity('Please provide current password!');
      inputCurrPwd.reportValidity();
      e.target.disabled = false;
    } else {
      inputCurrPwd.setCustomValidity('');
      if (inputNewPwd.value !== inputConfNewPwd.value) {
        inputConfNewPwd.setCustomValidity('Passwords do not match.');
        inputConfNewPwd.reportValidity();
        e.target.disabled = false;
      } else {
        inputConfNewPwd.setCustomValidity('');
        handleProfilePasswordChange();
      }
    }
  }
  // if the button clicked was to cancel password change
  if (e.target.id === 'bt-cancelchangepwd') {
    populateProfileModal();
  }
  // if the button clicked was to start picture edit
  if (e.target.id === 'bteditprofilepicture') {
    populateProfileEditPicture();
  }
  // if the button clicked was to upload the image
  if (e.target.id === 'bt-saveprofilepicture') {
    handleUploadProfilePic();
  }
  // if the button clicked was to cancel picture upload
  if (e.target.id === 'bt-canceleditpicture') {
    populateProfileModal();
  }
});

// search event listener

searchEl.addEventListener('input', (e) => {
  const text = e.target.value;
  handleSearchNote(text);
});

// event delegation to catch search result selection click:

searchResultsEl.addEventListener('click', (e) => {
  if (e.target.matches('.mm-search-result-bt')) {
    showNote(e.target.dataset.note);
    searchResultsEl.classList.toggle('d-none');
  }
});

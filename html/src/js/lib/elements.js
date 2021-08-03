// all the element selections

export const mimirAppContainer = document.querySelector('#mimirapp-container');
export const loginSignupContainer = document.querySelector(
  '#loginsignup-container'
);

export const btnSignup = document.querySelector('#btnSignup');

export const formSignup = document.querySelector('#mm-signup');
export const signupModal = document.querySelector('#signupModal');
export const captchaErrorSignup = document.querySelector('#captchaerrorSignup');
export const captchaErrorLogin = document.querySelector('#captchaerrorLogin');

export const mimirMenu = document.querySelector('#mimirmenu');
export const loginForm = document.querySelector('#mm-login');
export const loginError = document.querySelector('.invalid-feedback');

export const botaoMenuExp = document.querySelector('#botaoMenuExp');
export const botaoMenuAbMd = document.querySelector('#botaoMenuAbMd');
export const botaoNotesList = document.querySelector('#buttonNotesList');
export const botaoExpandListaNotas = document.querySelector(
  '#btexpandirlistanotas'
);

export const logo = mimirMenu.querySelector('.mm-logo');

export const botaoAddNote = document.querySelector('#addnote');

export const noteContentRow = document.querySelector('#notecontentrow');
export const noteContentCol = document.querySelector('#notecontentcol');
export const noteControlIcons = document.querySelector('#notecontrolicons');

export const noteContentDiv = document.querySelector('#notecontent');

export const noteForm = document.querySelector('#noteform');

export const newNoteHeader = document.querySelector('#newNoteHeader');
export const noteHeader = document.querySelector('#noteHeader');

export const notesListTbody = document.querySelector('#noteslisttbody');
export const notesCatQty = document.querySelector('.mm-notesqty');

export const imageUploadInput = document.querySelector('#imagefileinput');

export const botaoUploadImage = document.querySelector('#btuploadimage');

export const colDaNota = document.querySelector('#coldanota');
export const notesList = document.querySelector('#noteslist');

export const favoriteDiv = document.querySelector('#favoriteDiv');

export const colFavorites = document.querySelector('#colfavorites');

export const colRecent = document.querySelector('#colrecent');

// let's select the mm-categorytitle which is the title for the category listed

export const categoryTitle = document.querySelector('.mm-categorytitle');

// selecting our categories column on the sidebar

export const colCategories = document.querySelector('#colcategories');

// selecting the categories div to insert buttons to rename it, make it stack
// or set the its parents

export const divButtonsCategoryControl = document.querySelector(
  '#buttonscategorycontrol'
);

// the popover to rename category

export const renameCategoryPopover = document.querySelector('#renameCategory');

// the popover for the stacking category options
export const stackingCategoryPopover =
  document.querySelector('#stackingcategory');

// the button to make or undo stack:

export const buttonStackCategory = document.querySelector('#buttonstackcat');

// the div to insert our categories to select stacking parent:

export const stackingCategoriesListDiv = document.querySelector(
  '#stackingcategorieslist'
);
// the div where the stack caterogies list search input and label will be:

export const stackingCategoriesSearchDiv = document.querySelector(
  '#stackingcategoriessearch'
);

// button to remove category on confirmation

export const buttonCategoryRemovalConf = document.querySelector(
  '#categoryremovalconfirm'
);

// button to remove note on confirmation

export const buttonNoteRemovalConf = document.querySelector(
  '#noteremovalconfirm'
);

// the all notes button

export const btnAllNotes = document.querySelector('#allnotesbtn');

// select the top section of the layout

export const topSection = document.querySelector('#topo');

// get the pwdStrengthError from the sign up form

export const pwdStrengthError = document.querySelector('#pwdStrengthError');

// variable for the profile modal element

export const profileModal = document.querySelector('#profile-modal');

// get our search input element:

export const searchEl = document.querySelector('#pesquisa');

// get the element to display search results

export const searchResultsEl = document.querySelector('#pesquisa-resultado');

// let's select the div where our markdown will stay

export const markdown = document.querySelector('#markdown-content').innerHTML;

// document.querySelector('#markdown-content').innerHTML = html;

export const tagsCol = document.querySelector('#tagsCol');

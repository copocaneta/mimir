// this is the file for our handlers

import { sanitize } from 'dompurify';

import {
  sendCredentials,
  refreshAccessToken,
  logoutAccessToken,
  logoutRefreshToken,
  sendSignupForm,
  fetchCategories,
  createNote,
  fetchNotesByCat,
  fetchFavorites,
  patchCategory,
  deleteCategory,
  fetchNote,
  deleteNote,
  fetchRecentNotes,
  fetchProfileData,
  patchProfile,
  searchNote,
  postPasswdChange,
  toggleFavorite,
  apiUrl,
  editNote,
} from './index.js';
import {
  clearLoginErrors,
  showLogin,
  insertLoading,
  showUploadModal,
} from './utils.js';
import {
  captchaErrorLogin,
  loginError,
  noteHeader,
  noteContentCol,
  noteControlIcons,
  notesListTbody,
  categoryTitle,
  divButtonsCategoryControl,
  buttonStackCategory,
  notesCatQty,
  colFavorites,
  colCategories,
  renameCategoryPopover,
  stackingCategoryPopover,
  stackingCategoriesListDiv,
  buttonCategoryRemovalConf,
  buttonNoteRemovalConf,
  colRecent,
  searchResultsEl,
  noteContentRow,
  colDaNota,
  mimirMenu,
  captchaErrorSignup,
  pwdStrengthError,
  tagsCol,
  noteContentDiv,
  mimirAppContainer,
  loginSignupContainer,
} from './elements.js';

a;

// initializing our variable to keep the access token in memory

export let accessTokenMem;

// let's iniitialize our variable for searching categories
// for when creating new notes:

// export const nwNoteCategoriesSearchTerm = '';

// login handler

export async function handleLogin(event) {
  // debugger;
  clearLoginErrors();
  event.preventDefault();
  if (grecaptcha.getResponse(0) == '') {
    // event.preventDefault();
    captchaErrorLogin.classList.toggle('d-block');
    // alert("You can't proceed!");
  }
  const inputPassword = document.querySelector('#inputPassword').value;
  const inputEmail = document.querySelector('#email').value;
  const gRecaptchaResponse = grecaptcha.getResponse(0);

  const { message, access_token } = await sendCredentials(
    inputEmail,
    inputPassword,
    gRecaptchaResponse
  );

  grecaptcha.reset();
  if (message === 'Wrong credentials') {
    loginError.classList.toggle('d-block');
  } else if (message === 'Invalid captcha') {
    captchaErrorLogin.classList.toggle('d-block');
  } else if (message === 'Success') {
    const accessToken = access_token;
    $('#loginModal').modal('hide');
    loginSignupContainer.classList.toggle('d-none');
    mimirAppContainer.classList.toggle('d-none');
    // Page load calls:
    const latestNoteId = runOnPageLoad();

    return accessToken;
  }
}

// handler to refresh the access token

export async function checkToken() {
  const { msg } = await refreshAccessToken();

  if (msg.includes('Missing cookie')) {
    showLogin();
  } else if (msg === 'Token has been revoked') {
    showLogin();
  } else if (mimirAppContainer.classList.contains('d-none')) {
    mimirAppContainer.classList.remove('d-none');
    loginSignupContainer.classList.add('d-none');
    runOnPageLoad();
  }
}

// handling logout

export const handleLogOut = async () => {
  const msgAccessLogout = await logoutAccessToken();
  const msgTokenLogout = await logoutRefreshToken();
  if (msgTokenLogout.message === 'Refresh token has been revoked') {
    loginSignupContainer.classList.toggle('d-none');
    mimirAppContainer.classList.toggle('d-none');
    showLogin();
  }
};

// handle and validate sign up form

export const validateForm = async (event, passwordScore) => {
  if (event.target.matches('.signupbutton')) {
    const btnCreateAccount = document.querySelector('#btncreateaccount');
    const loaderSignup = document.querySelector('#loadersignup');
    loaderSignup.classList.toggle('d-none');
    btnCreateAccount.setAttribute('disabled', true);
    if (passwordScore < 30) {
      event.preventDefault();
      pwdStrengthError.classList.toggle('d-block');
    }
    if (grecaptcha.getResponse(1) == '') {
      event.preventDefault();
      captchaErrorSignup.classList.toggle('d-block');
      // alert("You can't proceed!");
    }
    event.preventDefault();
    const gRecaptchaResponse = grecaptcha.getResponse(1);
    const inputPassword = document.querySelector('#inputPasswordSignup').value;
    const inputName = document.querySelector('#name').value;
    const inputEmail = document.querySelector('#emailsignup').value;
    const { status, message } = await sendSignupForm(
      inputName,
      inputEmail,
      inputPassword,
      gRecaptchaResponse
    );
    // alert(status);
    if (status === 'success') {
      // const signupModalInner = document.querySelector('#signupModalInner');
      // signupModalInner.classList.remove('modal');
      // signupModalInner.classList.add('modal-sm');
      const signupModalContent = document.querySelector('#signupModalContent');
      signupModalContent.innerHTML = '';
      const row = document.createElement('div');
      row.classList.add('row');
      const col = document.createElement('div');
      col.classList.add('col', 'mm-colsignup-emailsent');
      const span = document.createElement('span');
      span.textContent = message;
      span.classList.add('mm-signup-emailsent');
      const buttonOk = document.createElement('button');
      buttonOk.type = 'button';
      buttonOk.id = 'buttonoksignup';
      buttonOk.textContent = 'Go back to login form';
      buttonOk.classList.add('btn', 'btn-primary', 'btn-lg', 'btn-block');
      col.appendChild(span);
      col.appendChild(buttonOk);
      row.appendChild(col);
      signupModalContent.appendChild(row);
    }
  }
};

// handle to show category list on category popover (when creating new note)

export const showCategoriesListPopover = async (searchTerm = '') => {
  const nwNoteCategoriesListDiv = document.querySelector(
    '#nwNoteCategoriesListDiv'
  );
  insertLoading(nwNoteCategoriesListDiv);

  // getting the data
  // await fetchCategories();

  nwNoteCategoriesListDiv.innerHTML = '';

  const { data } = await fetchCategories();

  const ul = document.createElement('ul');
  ul.classList.add('mm-ctglistnwnote');

  let found = false;

  data
    .filter((data) =>
      data.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .forEach((category) => {
      // creating the structure
      const li = document.createElement('li');
      li.classList.add('mm-ctglistnwnote-item');
      // const category_name = document.createElement('span');
      const categoryName = document.createElement('button');
      // let's set found to true so we know we have found a match on our filter
      found = true;
      // let's set the innerText to our category's name
      categoryName.innerText = category.name;
      // let's set a type for our buttons otherwhise it submits the form
      // when we click it
      categoryName.type = 'button';
      // let set the attribute data-catid with the category ID so we know what the user has selected
      categoryName.setAttribute('data-catid', category.id);
      categoryName.classList.add('btn', 'btn-link', 'mm-ctglistnwnote-name');
      li.appendChild(categoryName);
      ul.appendChild(li);
    });

  if (found == false && searchTerm !== '') {
    const li = document.createElement('li');
    li.id = 'notFoundLi';
    const createCategoryElement = document.createElement('button');
    createCategoryElement.type = 'button';
    createCategoryElement.innerText = `Create "${searchTerm
      .toLowerCase()
      .trim()}"`;
    createCategoryElement.id = 'createNewCategoryBtn';
    createCategoryElement.setAttribute(
      'data-catname',
      searchTerm.toLowerCase().trim()
    );
    createCategoryElement.setAttribute('data-function', 'createCat');
    createCategoryElement.classList.add(
      'btn',
      'btn-secondary',
      'btn-xs',
      'btn-block',
      'createCatButton'
    );

    if (document.querySelector('#notFoundLi')) {
      document.querySelector('#notFoundLi').innerHTML = '';
      document.querySelector('#notFoundLi').appendChild(createCategoryElement);
    } else {
      li.appendChild(createCategoryElement);
    }
    ul.appendChild(li);
  }
  if (!document.querySelector('.mm-ctglistnwnote')) {
    nwNoteCategoriesListDiv.appendChild(ul);
  }
};

// handle for actions coming from note controls (buttons
// on notes like: add picture, edit note, mark note as favorite, etc)

export const handleNoteControlIcons = async (e) => {
  // UPLOAD IMAGE
  // let's see if the click came from the add image icon to pop the modal open:

  if (e.target.id == 'buttonaddimage') {
    showUploadModal();
  }

  // SAVE NOTE
  // lets see if the click came from the save button to save a new note

  if (e.target.id === 'buttonsaveicon') {
    // let's try to create a note with the form data and capture the
    // return value into the newnote variable:
    const newnote = await createNote();
    // let's destructure the return value from createNote()
    // into status and data
    const { status, data } = newnote;
    // debugging status
    // alert(status);
    // if status is success then let's capture the new note id
    // and load that into our app
    if (status == 'success') {
      showNote(data.id);
      const selectedCatId = data.category_id;
      const selectedCatName = data.category_name.name;
      // const notesList = document.querySelector("#noteslist");

      colDaNota.dispatchEvent(
        new CustomEvent('noteCreated', {
          detail: {
            selectedCatId,
            selectedCatName,
          },
        })
      );
    }
  }

  // FAVORITE NOTE

  if (e.target.id == 'buttonfavicon') {
    let favoriteResponse;
    if (e.target.dataset.favorite == 'true') {
      favoriteResponse = await toggleFavorite(e.target.dataset.id, 'false');
    } else {
      favoriteResponse = await toggleFavorite(e.target.dataset.id, 'true');
    }
    const { status, data } = favoriteResponse;

    if (status == 'success') {
      // show note again to update favorite status

      showNote(e.target.dataset.id);

      mimirMenu.dispatchEvent(new CustomEvent('favoriteToggled'));
    } else {
      // TODO
      // alert('TODO: not success retrieving favorites');
    }
  }

  // LOAD NOTE FOR EDIT:
  if (e.target.id === 'buttonediticon') {
    showEditableNote(e.target.dataset.id);
  }
  // SUBMIT EDIT NOTE:

  if (e.target.id === 'buttonsaveediticon') {
    // let's try to create a note with the form data and capture the
    // return value into the newnote variable:
    const editedNote = await editNote(e.target.dataset.noteid);
    // let's destructure the return value from createNote()
    // into status and data
    const { status, data } = editedNote;
    // debugging status
    // alert(status);
    // if status is success then let's capture the new note id
    // and load that into our app
    if (status === 'success') {
      // alert(`o id da nova nota criada eh ${data['id']}`);
      showNote(data.id);
      const selectedCatId = data.category_id;
      const selectedCatName = data.category_name.name;
      // const notesList = document.querySelector("#noteslist");

      colDaNota.dispatchEvent(
        new CustomEvent('noteEdited', {
          detail: { selectedCatId, selectedCatName },
        })
      );
    }
  }

  // CHANGE FAVORITE ICON EDIT STATE:

  if (e.target.id === 'buttoneditfavicon') {
    const favIcon = document.querySelector('#editfavicon');
    if (e.target.dataset.favorite === 'true') {
      favIcon.classList.remove('fas');
      favIcon.classList.add('far');
      e.target.dataset.favorite = 'false';
    } else {
      favIcon.classList.remove('far');
      favIcon.classList.add('fas');
      e.target.dataset.favorite = 'true';
    }
  }

  // GO BACK FROM EDIT MODE:

  if (e.target.id === 'buttonback') {
    showNote(e.target.dataset.noteid);
  }

  // handle note deletion:
  if (e.target.id === 'buttondeletenote') {
    handleNoteDelete(e.target.dataset.noteid);
  }
};

// handle to show home page

export const showHomePage = () => {
  // TODO:
  noteHeader.innerHTML = '';
  noteControlIcons.innerHTML = '';
  noteContentCol.innerHTML = '';

  const contentArea = document.querySelector('#notecontent');

  // contentArea.classList.add('mm-homepagebg');
  // const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const date = new Date().toLocaleString(undefined, options);
  noteHeader.textContent = date;
  noteContentDiv.classList.add('mm-homepagebg');
};

// handler for showing a note

export const showNote = async (noteId) => {
  // the defaults object for the markdown.js plugin

  const defaults = {
    html: false, // Enable HTML tags in source
    xhtmlOut: false, // Use '/' to close single tags (<br />)
    breaks: false, // Convert '\n' in paragraphs into <br>
    langPrefix: 'language-', // CSS language prefix for fenced blocks
    linkify: true, // autoconvert URL-like texts to links
    typographer: true, // Enable smartypants and other sweet transforms
    // options below are for demo only
    _highlight: true,
    _strict: false,
    _view: 'html', // html / src / debug
  };

  defaults.highlight = function (str, lang) {
    const esc = md.utils.escapeHtml;
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(lang, str, true).value
        }</code></pre>`;
      } catch (__) {}
    } else {
      return `<pre class="hljs"><code>${esc(str)}</code></pre>`;
    }
  };

  const md = window.markdownit(defaults);
  // lets fetch the note right away, because in case something goes wrong
  // we don't do anything further
  if (noteId !== 'none' && noteId !== undefined) {
    const { status, data } = await fetchNote(noteId);

    if (status == 'success') {
      noteHeader.innerHTML = '';

      if (noteContentDiv.classList.contains('mm-homepagebg')) {
        noteContentDiv.classList.remove('mm-homepagebg');
      }

      const btExpandCategory = document.createElement('button');
      btExpandCategory.type = 'button';
      btExpandCategory.id = 'btshowcategory';
      btExpandCategory.classList.add(
        'btn',
        'btn-link',
        'p-0',
        'mr-2',
        'align-middle'
      );

      btExpandCategory.setAttribute('disabled', true);

      const btExpandCategoryIcon = document.createElement('i');
      btExpandCategoryIcon.classList.add('fas', 'fa-file-alt', 'align-middle');

      const btExpandCategorySpan = document.createElement('span');
      btExpandCategorySpan.id = 'newnotecategorytext';
      btExpandCategorySpan.classList.add('align-middle', 'ml-1');
      btExpandCategorySpan.dataset.selectedcat = data.category_id;
      btExpandCategorySpan.textContent = data.category_name.name;

      btExpandCategory.appendChild(btExpandCategoryIcon);
      btExpandCategory.appendChild(btExpandCategorySpan);

      const tagsIcon = document.createElement('i');
      tagsIcon.classList.add('fas', 'fa-tags', 'align-middle', 'ml-1');

      const tagsDiv = document.createElement('div');
      tagsDiv.classList.add('bootstrap-tagsinput');

      // let's empty the content for the noteContentCol:
      noteContentCol.innerHTML = '';
      noteControlIcons.innerHTML = '';

      // let's create the div element for the title
      const noteTitle = document.createElement('div');
      // let's give the id "notetitle" for this div:
      noteTitle.id = 'notetitle';
      // now let's create the div element for the markdown content
      const noteContentMd = document.createElement('div');

      // lets get the tags
      data.tags.map((item) => {
        // let's create a span for each tag:
        const tagSpan = document.createElement('span');
        tagSpan.classList.add('badge', 'badge', 'badge-info');
        tagSpan.textContent = item.name;
        tagsDiv.appendChild(tagSpan);
      });

      // let's the category name and tags to the note header:
      noteHeader.appendChild(btExpandCategory);
      noteHeader.appendChild(tagsIcon);
      noteHeader.appendChild(tagsDiv);

      const editIcon = document.createElement('i');
      editIcon.classList.add('fas', 'fa-lock', 'align-middle');

      // <i class="fas fa-lock align-middle"></i>

      // delete note button:

      const buttonDelete = document.createElement('button');
      buttonDelete.type = 'button';
      buttonDelete.id = 'buttondeletenote';
      buttonDelete.dataset.noteid = data.id;
      buttonDelete.classList.add('btn', 'btn-link', 'p-0', 'mr-3');
      const iconDelete = document.createElement('i');
      iconDelete.classList.add('fas', 'fa-trash', 'align-middle');
      buttonDelete.appendChild(iconDelete);
      buttonDelete.dataset.toggle = 'tooltip';
      buttonDelete.dataset.placement = 'bottom';
      buttonDelete.dataset.trigger = 'hover';
      buttonDelete.title = 'Delete Note';

      // favorite:

      const favoriteIcon = document.createElement('i');

      const buttonFavIcon = document.createElement('button');
      buttonFavIcon.id = 'buttonfavicon';
      buttonFavIcon.type = 'button';
      buttonFavIcon.classList.add(
        'btn',
        'btn-link',
        'btn-xs',
        'p-0',
        'mm-favbutton'
      );

      if (data.favorite == true) {
        favoriteIcon.classList.add('fas', 'fa-star', 'align-middle', 'mr-2');
        buttonFavIcon.dataset.favorite = 'true';
      } else {
        favoriteIcon.classList.add('far', 'fa-star', 'align-middle', 'mr-2');
        buttonFavIcon.dataset.favorite = 'false';
      }
      buttonFavIcon.dataset.id = data.id;

      buttonFavIcon.appendChild(favoriteIcon);

      const buttonEditIcon = document.createElement('button');
      buttonEditIcon.id = 'buttonediticon';
      buttonEditIcon.type = 'button';
      buttonEditIcon.classList.add(
        'btn',
        'btn-link',
        'btn-xs',
        'p-0',
        'mm-editbutton'
      );

      buttonEditIcon.dataset.id = data.id;
      buttonEditIcon.appendChild(editIcon);

      noteControlIcons.appendChild(buttonDelete);
      noteControlIcons.appendChild(buttonFavIcon);
      noteControlIcons.appendChild(buttonEditIcon);

      // let's give it the id of markdown-content so
      // markdown can be parsed inside
      noteContentMd.id = 'markdown-content';

      // let's populate title and content right away before inseting them to DOM
      noteTitle.textContent = data.title;
      // noteContentMd.textContent = data['content'];

      // const markdown = document.querySelector('#markdown-content').innerHTML;

      // const html = md.render(markdown);

      const markdown = data.content;

      const html = md.render(markdown);

      const cleanHtml = sanitize(html);
      noteContentMd.innerHTML = cleanHtml;

      // lets insert all these elements into the DOM:
      noteContentCol.appendChild(noteTitle);
      noteContentCol.appendChild(noteContentMd);
    } else {
      // something went wrong, we couldnt fetch the note
      // alert('Couldnt retrieve note!');
    }
  } else {
    showHomePage();
  }
};

// handler to list notes by category

export const listNotesByCat = async (obj) => {
  insertLoading(notesListTbody);
  const { catId, name } = obj;
  const { status, data } = await fetchNotesByCat(catId);

  if (status == 'success') {
    let counter = 0;

    if (catId === 'all') {
      categoryTitle.textContent = 'All notes';
    } else {
      divButtonsCategoryControl.innerHTML = '';
      // so we can get the stack state (if the category is a stack or not) more
      // precisel we will select the category item in the sidebar menu looking
      // for the dataset stack state:
      const categorySidebarEl = document.querySelector(
        `[data-catid="${catId}"]`
      );
      const { stack } = categorySidebarEl.dataset;

      categoryTitle.textContent = name;
      categoryTitle.classList.add('float-left');
      // RENAME CATEGORY BUTTON:
      const buttonRename = document.createElement('button');
      buttonRename.type = 'button';
      buttonRename.id = 'buttonrenamecategory';
      buttonRename.dataset.catid = catId;
      buttonRename.classList.add('btn', 'btn-link', 'p-0', 'mt-1', 'ml-2');
      const iconRename = document.createElement('i');
      iconRename.classList.add('fas', 'fa-pen');
      buttonRename.appendChild(iconRename);
      // data-toggle="tooltip" data-placement="bottom" title="Tooltip on bottom"
      buttonRename.dataset.toggle = 'tooltip';
      buttonRename.dataset.placement = 'bottom';
      buttonRename.dataset.trigger = 'hover';
      buttonRename.title = 'Rename Category';
      //
      // CATEGORY STACK OPTIONS BUTTON:
      //
      // make the button to turn category into stack:
      const buttonListStackOptions = document.createElement('button');
      buttonListStackOptions.type = 'button';
      buttonListStackOptions.id = 'buttonliststackoptions';
      buttonListStackOptions.dataset.catid = catId;
      buttonListStackOptions.classList.add(
        'btn',
        'btn-link',
        'p-0',
        'mt-1',
        'ml-2'
      );
      buttonStackCategory.dataset.catid = catId;
      if (stack == 'true') {
        buttonListStackOptions.style.color = '#007bff';
        buttonStackCategory.dataset.stack = stack;
        buttonStackCategory.textContent = 'Undo Category Stack';
        buttonListStackOptions.dataset.stack = 'true';
      } else {
        buttonStackCategory.dataset.stack = 'false';
        buttonStackCategory.textContent = 'Make it stack';
        buttonListStackOptions.dataset.stack = 'false';
      }
      const iconStack = document.createElement('i');
      iconStack.classList.add('fas', 'fa-layer-group');
      buttonListStackOptions.appendChild(iconStack);
      //
      // DELETE CATEGORY BUTTON
      const buttonDelete = document.createElement('button');
      buttonDelete.type = 'button';
      buttonDelete.id = 'buttondeletecategory';
      buttonDelete.dataset.catid = catId;
      buttonDelete.classList.add('btn', 'btn-link', 'p-0', 'mt-1', 'ml-2');
      const iconDelete = document.createElement('i');
      iconDelete.classList.add('fas', 'fa-trash');
      buttonDelete.appendChild(iconDelete);
      // data-toggle="tooltip" data-placement="bottom" title="Tooltip on bottom"
      buttonDelete.dataset.toggle = 'tooltip';
      buttonDelete.dataset.placement = 'bottom';
      buttonDelete.dataset.trigger = 'hover';
      buttonDelete.title = 'Delete Category';

      divButtonsCategoryControl.appendChild(buttonRename);
      divButtonsCategoryControl.appendChild(buttonListStackOptions);
      divButtonsCategoryControl.appendChild(buttonDelete);

      // categoryTitle.insertAdjacentElement('afterend', buttonRename);

      // $(document).ready(function () {
      //   $('[data-toggle="tooltip"]').tooltip();
      // });
    }

    notesListTbody.innerHTML = '';

    data.map((item) => {
      const itemRow = document.createElement('tr');
      itemRow.dataset.noteid = item.id;
      const itemColName = document.createElement('td');
      itemColName.classList.add('w-75');
      const itemColDate = document.createElement('td');
      itemColDate.classList.add('w-25');
      // new Date('2021-06-12T20:20:28.986798').toLocaleString('en')
      // itemColDate.textContent = item['created_on'];
      itemColDate.textContent = new Date(item.created_on).toLocaleString([], {
        hourCycle: 'h23',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      itemColName.textContent = item.title;
      itemRow.appendChild(itemColName);
      itemRow.appendChild(itemColDate);
      notesListTbody.appendChild(itemRow);
      counter++;
    });

    notesCatQty.textContent = `${counter} notes`;
  }
};

// handler to display and list favorites:

export const listFavorites = async () => {
  colFavorites.innerHTML = '';
  insertLoading(colFavorites);
  const { status, data } = await fetchFavorites();
  if (status === 'success') {
    const ulFavorites = document.createElement('ul');
    ulFavorites.classList.add('align-middle');

    // id is colfavorites

    const favoriteItems = data.map((item) => {
      // create the li
      const liItem = document.createElement('li');
      // give class to li
      liItem.classList.add('align-middle');
      // create the i for the icon
      const liItemIcon = document.createElement('i');
      // give the icon class
      liItemIcon.classList.add('fas', 'fa-file-alt');
      // add the icon to the li
      liItem.appendChild(liItemIcon);
      // add the button element:
      const buttonItem = document.createElement('button');
      // set the type for our button:
      buttonItem.type = 'button';
      // set the class for our button (no style):
      buttonItem.classList.add(
        'btn',
        'btn-link',
        'btn-xs',
        'p-0',
        'm-0',
        'mm-favoriteitembutton'
      );
      // set the data-attribute id to this note id
      buttonItem.dataset.noteid = item.id;
      // create the span
      const spanItem = document.createElement('span');
      // give the clsses to the favorite item span
      spanItem.classList.add('ml-1', 'align-middle');
      // place the text inside the span
      spanItem.textContent = item.title;
      // add the span to the button
      buttonItem.appendChild(spanItem);
      // add the button to the li item
      liItem.appendChild(buttonItem);
      // finally let's add our li item to the ul
      ulFavorites.appendChild(liItem);
    });

    // now let's add our ul element with the favorites item to the DOM:
    colFavorites.appendChild(ulFavorites);
  } else {
    // TODO
    // alert('TODO: not success fecthing favorites');
  }
};

// handler to list and display categories on the sidebar

export const listCategories = async () => {
  colCategories.innerHTML = '';
  insertLoading(colFavorites);
  const { status, data } = await fetchCategories();

  const ulCategories = document.createElement('ul');
  ulCategories.classList.add('align-middle');

  if (status === 'success') {
    const stacksAndSingles = data.filter((item) => {
      if (item.parentstack === null) {
        return true;
      }
    });

    const stackChild = data.filter((item) => {
      if (item.parentstack != null) {
        return true;
      }
    });

    stacksAndSingles.map((item) => {
      // create the li for the category items
      const liItem = document.createElement('li');
      // give the li the ncessasy classes
      liItem.classList.add('align-middle');
      // create the the icon
      const iItem = document.createElement('i');
      iItem.classList.add('fas', 'fa-book-dead');
      // create the span for the text
      const spanItem = document.createElement('span');
      spanItem.classList.add('ml-1', 'align-middle');
      // give the span the text
      spanItem.textContent = item.name;
      // create the button element:
      const buttonItem = document.createElement('button');
      // set the type for our button:
      buttonItem.type = 'button';
      // set the class for our button (no style):
      buttonItem.classList.add(
        'btn',
        'btn-link',
        'btn-xs',
        'p-0',
        'm-0',
        'mm-categoriesbutton'
      );
      buttonItem.dataset.catid = item.id;
      buttonItem.dataset.catname = item.name;

      // check if item is a stack:

      if (item.stack == true) {
        const divStack = document.createElement('div');
        divStack.classList.add('categorystack');
        divStack.id = `stack-${item.id}`;
        const divTitleStack = document.createElement('div');
        divTitleStack.id = `title-${item.id}`;
        const buttonTitleStack = document.createElement('button');
        buttonTitleStack.type = 'button';
        buttonTitleStack.classList.add(
          'btn',
          'btn-link',
          'mm-categoriesbutton'
        );
        buttonTitleStack.dataset.toggle = 'collapse';
        buttonTitleStack.dataset.target = `#collapse-${item.id}`;
        buttonTitleStack.dataset.stack = 'true';
        buttonTitleStack.dataset.catid = item.id;
        buttonTitleStack.dataset.catname = item.name;
        buttonTitleStack.setAttribute('aria-expanded', 'true');
        buttonTitleStack.setAttribute('aria-controls', `collapse-${item.id}`);
        const carretDownIcon = document.createElement('i');
        carretDownIcon.classList.add('fas', 'fa-caret-down');
        const stackIcon = document.createElement('i');
        stackIcon.classList.add('fas', 'fa-layer-group', 'ml-1');
        const spanTitleStack = document.createElement('span');
        spanTitleStack.classList.add('ml-1', 'align-middle');
        spanTitleStack.textContent = item.name;
        // addint data-stack and data-stack-id to li
        liItem.dataset.stack = 'true';
        liItem.dataset.stackid = `${item.id}`;
        // adding the child div and ul
        const divChild = document.createElement('div');
        divChild.id = `collapse-${item.id}`;
        divChild.classList.add(
          'row',
          'mt-0',
          'mm-listaitemsb',
          'align-middle',
          'collapse',
          'show'
        );
        divChild.setAttribute('aria-labelledby', `title-${item.id}`);
        divChild.dataset.parent = `#stack-${item.id}`;
        const ulChild = document.createElement('ul');
        ulChild.id = `childlist-${item.id}`;
        // adding the elements:
        buttonTitleStack.appendChild(carretDownIcon);
        buttonTitleStack.appendChild(stackIcon);
        buttonTitleStack.appendChild(spanTitleStack);
        divTitleStack.appendChild(buttonTitleStack);
        divChild.appendChild(ulChild);
        liItem.appendChild(divTitleStack);
        liItem.appendChild(divChild);
        divStack.appendChild(liItem);
        ulCategories.appendChild(divStack);
      } else {
        liItem.appendChild(iItem);
        //   liItem.appendChild(spanItem);
        buttonItem.appendChild(spanItem);
        liItem.appendChild(buttonItem);
        ulCategories.appendChild(liItem);
      }
    });

    colCategories.appendChild(ulCategories);

    stackChild.map((item) => {
      const liChild = document.createElement('li');
      liChild.classList.add('align-middle');
      const buttonChild = document.createElement('button');
      buttonChild.type = 'button';
      buttonChild.classList.add(
        'btn',
        'btn-link',
        'btn-xs',
        'p-0',
        'm-0',
        'mm-categoriesbutton'
      );
      buttonChild.dataset.catid = item.id;
      buttonChild.dataset.parentstack = item.parentstack;
      buttonChild.dataset.catname = item.name;
      const iconItemChild = document.createElement('i');
      iconItemChild.classList.add('fas', 'fa-book-dead');
      const spanChild = document.createElement('span');
      spanChild.classList.add('ml-1', 'align-middle');
      spanChild.textContent = item.name;
      // adding elements
      buttonChild.appendChild(spanChild);
      liChild.appendChild(iconItemChild);
      liChild.appendChild(buttonChild);
      const ulChild = document.querySelector(`#childlist-${item.parentstack}`);
      ulChild.appendChild(liChild);
    });
  } else {
    // TODO
    // alert('TODO: not success listing categories');
  }
};

//  handler for renaming a category action

export const handleCategoryRename = async (e) => {
  e.preventDefault();
  const response = await patchCategory(
    'name',
    e.target.renamecategoryinput.value,
    e.target.dataset.catid
  );
  const { status } = response;
  if (status === 'success') {
    renameCategoryPopover.classList.toggle('d-none');
    // TODO: categoryPopOver.dispatchEvent(new CustomEvent('categoryCreated'));
    renameCategoryPopover.dispatchEvent(new CustomEvent('categoryRenamed'));
    categoryTitle.textContent = e.target.renamecategoryinput.value;
  }
};

// handler to turn a category into a stack

export const makeCatStack = async (e) => {
  if (e.target.dataset.stack == 'true') {
    const response = await patchCategory(
      'stack',
      'false',
      e.target.dataset.catid
    );
    const { status, data } = response;
    if (status == 'success') {
      stackingCategoryPopover.classList.toggle('d-none');
      divButtonsCategoryControl.dispatchEvent(new CustomEvent('stackCategory'));
    }
  } else {
    const response = await patchCategory(
      'stack',
      'true',
      e.target.dataset.catid
    );
    const { status, data } = response;
    if (status == 'success') {
      stackingCategoryPopover.classList.toggle('d-none');
      divButtonsCategoryControl.dispatchEvent(new CustomEvent('stackCategory'));
    }
  }
};

// handler to select the parent stack for a category

export const handleStackSelection = async (e) => {
  const { status } = await patchCategory(
    'parentstack',
    e.target.dataset.catid,
    buttonStackCategory.dataset.catid
  );
  if (status == 'success') {
    stackingCategoryPopover.dispatchEvent(new CustomEvent('stackSelected'));
  }
};

// handler to show a list of stack categories inside the popover
// to select a parent stack for a category

export const showStackListPopover = async (searchTerm = '') => {
  // stackingCategoriesListDiv
  stackingCategoriesListDiv.innerHTML = '';

  const { data } = await fetchCategories();

  const ul = document.createElement('ul');
  ul.classList.add('mm-stacksearch');
  const currCatId = document.querySelector('#buttonliststackoptions').dataset
    .catid;
  const selectedParent = colCategories.querySelector(
    `[data-catid="${currCatId}"]`
  ).dataset.parentstack;

  const filteredStacks = data.filter((item) => {
    if (item.stack === true) {
      return true;
    }
  });
  filteredStacks
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .forEach((item) => {
      const li = document.createElement('li');
      // TODO
      li.classList.add('mm-stacklist-item');
      const buttonItem = document.createElement('button');
      buttonItem.type = 'button';
      buttonItem.classList.add('btn', 'btn-link', 'mm-stacklist-name');
      buttonItem.dataset.catid = item.id;
      const selectedParentIcon = document.createElement('i');
      selectedParentIcon.classList.add('fa', 'fa-check', 'mr-2');
      buttonItem.textContent = item.name;
      if (selectedParent == item.id) {
        buttonItem.insertAdjacentElement('afterbegin', selectedParentIcon);
        buttonItem.disabled = true;
      }
      li.appendChild(buttonItem);
      ul.appendChild(li);
    });
  if (!document.querySelector('.mm-stacksearch')) {
    stackingCategoriesListDiv.appendChild(ul);
  }
};

// handler to delete category

export const handleCategoryDelete = async (e) => {
  // alert()
  const catId = e.target.dataset.catid;
  const postsQty = document.querySelector('.mm-notesqty');
  const numberOfNotes = parseInt(postsQty.textContent.split(' ')[0]);
  if (numberOfNotes > 0) {
    $('#category-delete-confirm').modal('show');
    const spanPostsCount = document.querySelector('#categoryremovalpostscount');
    buttonCategoryRemovalConf.dataset.catid = catId;
    spanPostsCount.textContent = postsQty.textContent;
  } else {
    const { status } = await deleteCategory(catId);
    if (status === 'success') {
      alert('Category removed!');
      divButtonsCategoryControl.dispatchEvent(
        new CustomEvent('categoryRemoved')
      );
    } else {
      alert('Something went wrong!');
    }
  }
};

// handler for confirming category removal

export const handleCategoryDeleteConf = async (e) => {
  const catId = e.target.dataset.catid;
  const { status } = await deleteCategory(catId);
  if (status === 'success') {
    alert('Category removed!');
    $('#category-delete-confirm').modal('hide');
    divButtonsCategoryControl.dispatchEvent(new CustomEvent('categoryRemoved'));
  } else {
    alert('Something went wrong!');
  }
};

// handler for editing note (fetching the note in order to edit it)

const showEditableNote = async (noteId) => {
  // let;s fetch the note right away, because in case something goes wrong
  // we don't do anything further
  const { status, data } = await fetchNote(noteId);

  if (status === 'success') {
    // let's check if newNoteHeader which the header for writing new notes
    //  is displayed, if it isn't let's show it
    noteHeader.innerHTML = '';
    const btExpandCategory = document.createElement('button');
    btExpandCategory.type = 'button';
    btExpandCategory.id = 'btexpandcategory';
    btExpandCategory.classList.add(
      'btn',
      'btn-link',
      'p-0',
      'mr-2',
      'align-middle'
    );

    // btExpandCategory.setAttribute('disabled', true);

    const btExpandCategoryIcon = document.createElement('i');
    btExpandCategoryIcon.classList.add('fas', 'fa-file-alt', 'align-middle');

    const btExpandCategorySpan = document.createElement('span');
    btExpandCategorySpan.id = 'newnotecategorytext';
    btExpandCategorySpan.classList.add('align-middle', 'ml-1');
    btExpandCategorySpan.dataset.selectedcat = data.category_id;
    btExpandCategorySpan.textContent = data.category_name.name;

    const btExpandCategoryChevronIcon = document.createElement('i');
    btExpandCategoryChevronIcon.classList.add(
      'fas',
      'fa-chevron-down',
      'align-middle',
      'ml-1'
    );

    btExpandCategory.appendChild(btExpandCategoryIcon);
    btExpandCategory.appendChild(btExpandCategorySpan);
    btExpandCategory.appendChild(btExpandCategoryChevronIcon);

    const categoryPopOverDiv = document.createElement('div');
    categoryPopOverDiv.classList.add('d-none');
    categoryPopOverDiv.id = 'categoryPopOver';

    const categoryPopOverDivArrow = document.createElement('div');
    categoryPopOverDivArrow.classList.add('arrow');
    categoryPopOverDivArrow.setAttribute('style', 'left: 89px;');

    const categoryPopOverDivEmpty = document.createElement('div');

    const nwNoteCategoriesSearch = document.createElement('input');
    nwNoteCategoriesSearch.type = 'text';
    nwNoteCategoriesSearch.id = 'nwNoteCategoriesSearch';
    nwNoteCategoriesSearch.placeholder = 'Search for a category';
    nwNoteCategoriesSearch.autocomplete = 'off';

    const nwNoteCategoriesListDiv = document.createElement('div');
    nwNoteCategoriesListDiv.id = 'nwNoteCategoriesListDiv';

    categoryPopOverDivEmpty.appendChild(nwNoteCategoriesSearch);
    categoryPopOverDivEmpty.appendChild(nwNoteCategoriesListDiv);

    categoryPopOverDiv.appendChild(categoryPopOverDivArrow);
    categoryPopOverDiv.appendChild(categoryPopOverDivEmpty);

    const tagsIcon = document.createElement('i');
    tagsIcon.classList.add('fas', 'fa-tags', 'align-middle', 'ml-1');

    const tagsInputEl = document.createElement('input');
    tagsInputEl.id = 'notetagsinput';
    tagsInputEl.name = 'tags';
    tagsInputEl.type = 'search';
    tagsInputEl.dataset.role = 'tagsinput';
    tagsInputEl.placeholder = 'Tags here';
    tagsInputEl.autocomplete = 'off';
    tagsInputEl.dataset.lpignore = 'true';

    noteHeader.appendChild(btExpandCategory);
    noteHeader.appendChild(categoryPopOverDiv);
    noteHeader.appendChild(tagsIcon);
    noteHeader.appendChild(tagsInputEl);

    // const newNoteCategoryEl = document.querySelector('#newnotecategorytext');

    // let's empty the content for the noteContentCol:
    noteContentCol.innerHTML = '';
    noteControlIcons.innerHTML = '';

    const noteTitleInput = document.createElement('input');
    const noteTextArea = document.createElement('textarea');

    noteTextArea.id = 'notecontenttextarea';

    noteTitleInput.setAttribute('placeholder', 'Note Title here');
    noteTitleInput.id = 'notetitleinput';

    noteTitleInput.classList.add('mm-notetitleinput');
    noteTitleInput.required = true;
    noteTitleInput.dataset.toggle = 'tooltip';
    noteTitleInput.setAttribute('title', 'Please type in the note title');

    noteTitleInput.autocomplete = 'off';
    noteTextArea.classList.add('mm-notetextarea');
    noteContentRow.classList.add('h-100');

    const buttonAddImageIcon = document.createElement('button');
    const buttonSaveIcon = document.createElement('button');

    buttonAddImageIcon.id = 'buttonaddimage';
    buttonSaveIcon.id = 'buttonsaveediticon';
    buttonSaveIcon.dataset.noteid = data.id;

    buttonAddImageIcon.type = 'button';

    buttonSaveIcon.setAttribute('type', 'submit');
    //     buttonSaveIcon.setAttribute("type", "button");
    buttonSaveIcon.classList.add(
      'btn',
      'btn-dark',
      'btn-xs',
      'p-0',
      'mm-savebutton',
      'mm-cabecalhonotaeditbt'
    );
    buttonAddImageIcon.classList.add(
      'btn',
      'btn-dark',
      'btn-xs',
      'p-0',
      'mm-imagebutton',
      'mm-cabecalhonotaeditbt',
      'mr-3'
    );

    const noteSaveIcon = document.createElement('i');
    const addImageIcon = document.createElement('i');

    noteSaveIcon.classList.add('fas', 'fa-save', 'align-middle', 'mm-saveicon');
    addImageIcon.classList.add(
      'fas',
      'fa-image',
      'align-middle',
      'mm-addimageicon'
    );

    const buttonSaveText = document.createElement('span');
    buttonSaveText.classList.add('mm-saveicontext');
    buttonSaveText.textContent = 'save';

    const buttonAddImageText = document.createElement('span');
    buttonAddImageText.classList.add('mm-addimageicontext');
    buttonAddImageText.textContent = 'Image';

    buttonSaveIcon.appendChild(noteSaveIcon);
    buttonSaveIcon.appendChild(buttonSaveText);

    buttonAddImageIcon.appendChild(addImageIcon);
    // buttonAddImageIcon.appendChild(buttonAddImageText);

    const editIcon = document.createElement('i');
    editIcon.classList.add('fas', 'fa-lock', 'align-middle');

    // favorite:

    const favoriteIcon = document.createElement('i');

    const buttonFavIcon = document.createElement('button');
    buttonFavIcon.id = 'buttoneditfavicon';
    buttonFavIcon.type = 'button';
    buttonFavIcon.classList.add(
      'btn',
      'btn-link',
      'btn-xs',
      'p-0',
      'mm-favbutton',
      'mr-3'
    );

    if (data.favorite == true) {
      favoriteIcon.classList.add('fas', 'fa-star', 'align-middle');
      buttonFavIcon.dataset.favorite = 'true';
      buttonFavIcon.dataset.id = data.id;
    } else {
      favoriteIcon.classList.add('far', 'fa-star', 'align-middle');
      buttonFavIcon.dataset.favorite = 'false';
      buttonFavIcon.dataset.id = data.id;
    }
    favoriteIcon.id = 'editfavicon';
    buttonFavIcon.appendChild(favoriteIcon);

    // let's create a back button to cancel note editing
    // <i class="far fa-arrow-alt-circle-left"></i>

    const buttonBack = document.createElement('button');
    buttonBack.id = 'buttonback';
    buttonBack.dataset.noteid = data.id;
    buttonBack.type = 'button';
    buttonBack.classList.add(
      'btn',
      'btn-link',
      'btn-xs',
      'p-0',
      'mm-backbutton',
      'mr-3'
    );
    const buttonBackIcon = document.createElement('i');
    buttonBackIcon.classList.add(
      'far',
      'fa-arrow-alt-circle-left',
      'align-middle'
    );

    buttonBack.appendChild(buttonBackIcon);

    noteControlIcons.appendChild(buttonBack);
    noteControlIcons.appendChild(buttonFavIcon);
    noteControlIcons.appendChild(buttonAddImageIcon);
    noteControlIcons.appendChild(buttonSaveIcon);

    // let's populate title and content right away before inseting them to DOM
    noteTitleInput.value = data.title;
    // noteContentMd.textContent = data['content'];
    noteTextArea.value = data.content;

    // lets insert all these elements into the DOM:
    noteContentCol.appendChild(noteTitleInput);
    noteContentCol.appendChild(noteTextArea);

    // const tagsInput = document.querySelector('.bootstrap-tagsinput');

    // // let's clear tagsDiv:
    // tagsInput.value = '';

    $('#notetagsinput').tagsinput('refresh');

    // lets get the tags
    data.tags.forEach((item) => {
      const teste = document.querySelector('#notetagsinput');
      // tagsArray.push(item.name);
      $('#notetagsinput').tagsinput('add', item.name);
    });
    showCategoriesListPopover();
  } else {
    // something went wrong, we couldnt fetch the note
    alert('Couldnt retrieve note!');
  }
};

// handler to delete a note:

const handleNoteDelete = async (noteid) => {
  $('#note-delete-confirm').modal('show');
  buttonNoteRemovalConf.dataset.noteid = noteid;
};

// handler for confirmation on deleting a note:

export const handleNoteDeleteConf = async (e) => {
  const { noteid } = e.target.dataset;
  const { status } = await deleteNote(noteid);
  if (status === 'success') {
    alert('Note removed!');
    $('#note-delete-confirm').modal('hide');
    divButtonsCategoryControl.dispatchEvent(new CustomEvent('noteRemoved'));
  } else {
    alert('Something went wrong!');
  }
};

// handler to show recent notes on the sidebar

export const listRecentNotes = async () => {
  colRecent.innerHTML = '';
  insertLoading(colRecent);
  const { status, data } = await fetchRecentNotes();
  let latestNoteId;
  if (status === 'success') {
    const ulRecent = document.createElement('ul');
    ulRecent.classList.add('align-middle');
    let counter = 0;
    data.forEach((item) => {
      const liItem = document.createElement('li');
      liItem.classList.add('align-middle');

      const buttonItem = document.createElement('button');

      buttonItem.classList.add(
        'btn',
        'btn-link',
        'btn-xs',
        'p-0',
        'm-0',
        'mm-recentitembutton'
      );

      buttonItem.dataset.noteid = item.id;

      const iconItem = document.createElement('i');
      iconItem.classList.add('fas', 'fa-file-alt');

      const spanItem = document.createElement('span');
      spanItem.classList.add('ml-1', 'align-middle');

      spanItem.textContent = item.title;

      buttonItem.appendChild(iconItem);
      buttonItem.appendChild(spanItem);

      liItem.appendChild(buttonItem);
      ulRecent.appendChild(liItem);
      counter += 1;
      if (counter === 1) {
        latestNoteId = item.id;
      }
    });
    colRecent.appendChild(ulRecent);
    return latestNoteId;
  }
};

// handler to populate profile modal

export const populateProfileModal = async () => {
  const profileModalBody = document.querySelector('#profile-modal-body');
  profileModalBody.innerHTML = '';
  const { status, data } = await fetchProfileData();
  const rowMain = document.createElement('div');
  rowMain.classList.add('row');
  const col = document.createElement('div');
  col.classList.add('col');

  // row for the name
  const rowName = document.createElement('div');
  rowName.classList.add('row', 'mm-profilerows');

  // col for the label name
  const colNameLabel = document.createElement('div');
  colNameLabel.classList.add('col-4');
  const spanNameLabel = document.createElement('span');
  spanNameLabel.textContent = 'Name: ';
  // append the span to the col
  colNameLabel.appendChild(spanNameLabel);

  // col for the name text (content)
  const colNameContent = document.createElement('div');
  colNameContent.classList.add('col-8');
  colNameContent.id = 'profilecolnamecontent';
  const spanNameContent = document.createElement('span');
  spanNameContent.textContent = data.name;

  // button for editing the name
  const buttonEditName = document.createElement('button');
  buttonEditName.type = 'button';
  buttonEditName.id = 'bt-editprofilename';
  buttonEditName.classList.add('btn', 'btn-link', 'btn-xs', 'p-0', 'ml-2');
  buttonEditName.dataset.name = data.name;

  const iconEditName = document.createElement('i');
  iconEditName.classList.add('fas', 'fa-pen');

  buttonEditName.appendChild(iconEditName);

  colNameContent.appendChild(spanNameContent);
  colNameContent.appendChild(buttonEditName);

  rowName.appendChild(colNameLabel);
  rowName.appendChild(colNameContent);

  // row for the email
  const rowEmail = document.createElement('div');
  rowEmail.classList.add('row', 'mm-profilerows');
  // col for the label email
  const colEmailLabel = document.createElement('div');
  colEmailLabel.classList.add('col-4');
  const spanEmailLabel = document.createElement('span');
  spanEmailLabel.textContent = 'Email: ';
  // append the span to the col
  colEmailLabel.appendChild(spanEmailLabel);
  // col for the name text (content)
  const colEmailContent = document.createElement('div');
  colEmailContent.classList.add('col-8');
  const spanEmailContent = document.createElement('span');
  spanEmailContent.textContent = data.email;

  // button for editing the email
  const buttonEditEmail = document.createElement('button');
  buttonEditEmail.type = 'button';
  buttonEditEmail.id = 'bteditprofileemail';
  buttonEditEmail.classList.add('btn', 'btn-link', 'btn-xs', 'p-0', 'ml-2');

  const iconEditEmail = document.createElement('i');
  iconEditEmail.classList.add('fas', 'fa-pen');

  buttonEditEmail.appendChild(iconEditEmail);

  colEmailContent.appendChild(spanEmailContent);
  // colEmailContent.appendChild(buttonEditEmail);

  rowEmail.appendChild(colEmailLabel);
  rowEmail.appendChild(colEmailContent);

  // row for the password
  const rowPassword = document.createElement('div');
  rowPassword.classList.add('row', 'mm-profilerows');
  // col for the label password
  const colPasswordlLabel = document.createElement('div');
  colPasswordlLabel.classList.add('col-4');
  const spanPasswordLabel = document.createElement('span');
  spanPasswordLabel.textContent = 'Change Password: ';
  // append the span to the col
  colPasswordlLabel.appendChild(spanPasswordLabel);
  // col for the name text (content)
  const colPasswordContent = document.createElement('div');
  colPasswordContent.id = 'profilecolpwdcontent';
  colPasswordContent.classList.add('col-8');

  // button for editing the password
  const buttonEditPassword = document.createElement('button');
  buttonEditPassword.type = 'button';
  buttonEditPassword.id = 'bt-editprofilepasswd';
  buttonEditPassword.classList.add('btn', 'btn-link', 'btn-xs', 'p-0', 'ml-2');

  const iconEditPassword = document.createElement('i');
  iconEditPassword.classList.add('fas', 'fa-pen');

  buttonEditPassword.appendChild(iconEditPassword);

  colPasswordContent.appendChild(buttonEditPassword);

  rowPassword.appendChild(colPasswordlLabel);
  rowPassword.appendChild(colPasswordContent);

  // row for the picture:
  const rowPic = document.createElement('div');
  rowPic.classList.add('row', 'mm-profilerows');
  // col for the label picture
  const colPicLabel = document.createElement('div');
  colPicLabel.classList.add('col-4');
  const spanPicLabel = document.createElement('span');
  spanPicLabel.textContent = 'Profile Picture: ';
  // append the label
  colPicLabel.appendChild(spanPicLabel);
  // col for the picture
  const colPicContent = document.createElement('div');
  colPicContent.classList.add('col-8');
  colPicContent.id = 'profilecolpiccontent';
  const imgPicContent = document.createElement('img');
  // if no picture is set yet just show this default
  if (data.picture == null || data.picture === '') {
    // imgPicContent.src = 'http://localhost:1234/api/static/default_avatar.png';
    imgPicContent.src = `${apiUrl}/static/default_avatar.png`;
  } else {
    imgPicContent.src = data.picture;
  }

  imgPicContent.classList.add(
    'mm-avatarimgprofile',
    'img-fluid',
    'rounded-circle'
  );

  // button for editing the picture
  const buttonEditPic = document.createElement('button');
  buttonEditPic.type = 'button';
  buttonEditPic.id = 'bteditprofilepicture';
  buttonEditPic.classList.add('btn', 'btn-link', 'btn-xs', 'p-0', 'ml-2');

  const iconEditPic = document.createElement('i');
  iconEditPic.classList.add('fas', 'fa-pen');

  buttonEditPic.appendChild(iconEditPic);

  colPicContent.appendChild(imgPicContent);
  colPicContent.appendChild(buttonEditPic);

  rowPic.appendChild(colPicLabel);
  rowPic.appendChild(colPicContent);

  col.appendChild(rowName);
  col.appendChild(rowEmail);
  col.appendChild(rowPassword);
  col.appendChild(rowPic);

  rowMain.appendChild(col);
  profileModalBody.appendChild(rowMain);
};

// handler for editing profile name

export const handleProfileNameEdit = async (value) => {
  const { status, data } = await patchProfile('name', value);
  if (status === 'success') {
    populateProfileModal();
  } else {
    const btCancelEditname = document.querySelector('#bt-canceleditname');
    const spanStatus = document.createElement('span');
    spanStatus.style.color = 'tomato';
    spanStatus.textContent = status;
    btCancelEditname.insertAdjacentElement('afterend', spanStatus);
  }
};

// handler for populating fields for user password change

export const populateProfileEditPassword = async (e) => {
  const colPwdContent = document.querySelector('#profilecolpwdcontent');
  colPwdContent.innerHTML = '';
  const formPwdChange = document.createElement('form');
  formPwdChange.id = 'formpwdchange';
  formPwdChange.dataset.toggle = 'validator';
  formPwdChange.action = '';
  formPwdChange.method = 'post';

  const inputCurPwd = document.createElement('input');
  inputCurPwd.type = 'password';
  inputCurPwd.id = 'input-curpwd';
  inputCurPwd.placeholder = 'Current Password';
  inputCurPwd.required = true;
  inputCurPwd.classList.add('form-control', 'form-control-sm');
  const inputNewPwd = document.createElement('input');
  inputNewPwd.type = 'password';
  inputNewPwd.id = 'input-newpwd';
  inputNewPwd.placeholder = 'New password';
  inputNewPwd.dataset.minlength = '6';
  inputNewPwd.classList.add('form-control', 'form-control-sm');
  inputNewPwd.required = true;
  const inputConfNewPwd = document.createElement('input');
  inputConfNewPwd.type = 'password';
  inputConfNewPwd.id = 'input-confnewpwd';
  inputConfNewPwd.classList.add('form-control', 'form-control-sm');
  inputConfNewPwd.placeholder = 'Confirm New Password';
  inputConfNewPwd.dataset.match = '#input-newpwd';
  inputConfNewPwd.setCustomValidity('Passwords do not match.');
  // inputConfNewPwd.dataset.match-error = "Whoops, these don't match";
  inputConfNewPwd.required = true;
  const btSaveEdit = document.createElement('button');
  // btSaveEdit.type = 'button';
  btSaveEdit.type = 'submit';
  btSaveEdit.classList.add('btn', 'btn-link');
  btSaveEdit.id = 'bt-savechangepwd';
  const iconSave = document.createElement('i');
  iconSave.classList.add(
    'far',
    'fa-save',
    'ml-2',
    'mm-saveprofileicon',
    'align-middle'
  );
  const btCancelEdit = document.createElement('button');
  btCancelEdit.type = 'button';
  btCancelEdit.classList.add('btn', 'btn-link');
  btCancelEdit.id = 'bt-cancelchangepwd';
  const iconCancel = document.createElement('i');
  iconCancel.classList.add(
    'far',
    'fa-window-close',
    'ml-0',
    'mm-cancelprofileicon',
    'align-middle'
  );
  // cont invalidFeedBack = document.createElement('div');
  btSaveEdit.appendChild(iconSave);
  btCancelEdit.appendChild(iconCancel);

  formPwdChange.appendChild(inputCurPwd);
  formPwdChange.appendChild(inputNewPwd);
  formPwdChange.appendChild(inputConfNewPwd);
  // formPwdChange.appendChild(helpBlock);
  formPwdChange.appendChild(btSaveEdit);
  formPwdChange.appendChild(btCancelEdit);

  colPwdContent.appendChild(formPwdChange);

  $('#input-newpwd').pwstrength({
    ui: {
      showVerdictsInsideProgressBar: false,
    },
    common: {
      onKeyUp(evt, data) {
        changePasswordScore = data.score;
      },
    },
  });
};

// handler for populating fields for editing profile name

export const populateProfileEditName = async (e) => {
  const { name } = e.target.dataset;
  const colNameContent = document.querySelector('#profilecolnamecontent');
  colNameContent.innerHTML = '';
  const inputName = document.createElement('input');
  inputName.type = 'text';
  inputName.value = name;
  inputName.id = 'input-profilename';
  const btSaveEdit = document.createElement('button');
  btSaveEdit.type = 'button';
  btSaveEdit.classList.add('btn', 'btn-link');
  btSaveEdit.id = 'bt-saveprofilename';
  const iconSave = document.createElement('i');
  iconSave.classList.add(
    'far',
    'fa-save',
    'ml-2',
    'mm-saveprofileicon',
    'align-middle'
  );
  const btCancelEdit = document.createElement('button');
  btCancelEdit.type = 'button';
  btCancelEdit.classList.add('btn', 'btn-link');
  btCancelEdit.id = 'bt-canceleditname';
  const iconCancel = document.createElement('i');
  iconCancel.classList.add(
    'far',
    'fa-window-close',
    'ml-0',
    'mm-cancelprofileicon',
    'align-middle'
  );
  btSaveEdit.appendChild(iconSave);
  btCancelEdit.appendChild(iconCancel);

  colNameContent.appendChild(inputName);
  colNameContent.appendChild(btSaveEdit);
  colNameContent.appendChild(btCancelEdit);
};

// handler to change user password

export const handleProfilePasswordChange = async () => {
  const inputCurrPwd = document.querySelector('#input-curpwd');
  const inputNewPwd = document.querySelector('#input-newpwd');
  const btCancelPwdChange = document.querySelector('#bt-cancelchangepwd');

  if (changePasswordScore < 30) {
    const spanWarning = document.createElement('span');
    spanWarning.style.color = 'tomato';
    spanWarning.textContent = `Please provide a stronger password`;
    btCancelPwdChange.insertAdjacentElement('afterend', spanWarning);
  } else {
    const { status, message } = await postPasswdChange(
      inputCurrPwd.value,
      inputNewPwd.value
    );
    if (status === 'success') {
      populateProfileModal();
    } else {
      const spanStatus = document.createElement('span');
      spanStatus.style.color = 'tomato';
      spanStatus.textContent = `${status}: ${message}`;
      btCancelPwdChange.insertAdjacentElement('afterend', spanStatus);
    }
  }
};

// handler for populating fields to allow user to change profile picture

export const populateProfileEditPicture = async (e) => {
  const colPicContent = document.querySelector('#profilecolpiccontent');
  colPicContent.innerHTML = '';
  const inputPicture = document.createElement('input');
  inputPicture.type = 'file';
  inputPicture.id = 'input-pictureupload';
  const btSaveEdit = document.createElement('button');
  btSaveEdit.type = 'button';
  btSaveEdit.classList.add('btn', 'btn-link');
  btSaveEdit.id = 'bt-saveprofilepicture';
  const iconSave = document.createElement('i');
  iconSave.classList.add(
    'far',
    'fa-save',
    'ml-2',
    'mm-saveprofileicon',
    'align-middle'
  );
  const btCancelEdit = document.createElement('button');
  btCancelEdit.type = 'button';
  btCancelEdit.classList.add('btn', 'btn-link');
  btCancelEdit.id = 'bt-canceleditpicture';
  const iconCancel = document.createElement('i');
  iconCancel.classList.add(
    'far',
    'fa-window-close',
    'ml-0',
    'mm-cancelprofileicon',
    'align-middle'
  );
  btSaveEdit.appendChild(iconSave);
  btCancelEdit.appendChild(iconCancel);

  colPicContent.appendChild(inputPicture);
  colPicContent.appendChild(btSaveEdit);
  colPicContent.appendChild(btCancelEdit);
};

// populate user profile picture into the app:

export const getUserProfilePicture = async () => {
  const { status, data } = await fetchProfileData();
  const userPicture = document.querySelector('#mm-avatarimg');
  if (status === 'success') {
    if (data.picture != null && data.picture !== '') {
      userPicture.src = data.picture;
    } else {
      // userPicture.src = 'http://localhost:1234/api/static/default_avatar.png';
      userPicture.src = `${apiUrl}/static/default_avatar.png`;
    }
  }
};

// the handler to search notes:

export const handleSearchNote = async (searchTerm) => {
  if (searchTerm.length > 2) {
    searchResultsEl.innerHTML = '';
    const { status, data } = await searchNote(searchTerm);

    if (status === 'success') {
      if (data.length > 0) {
        if (searchResultsEl.classList.contains('d-none')) {
          searchResultsEl.classList.remove('d-none');
        }

        if (document.querySelector('#search-results-ul')) {
          document.querySelector('#search-results-ul').innerHTML = '';
        } else {
          const ul = document.createElement('ul');
          ul.id = 'search-results-ul';
          searchResultsEl.appendChild(ul);
        }
      } else if (!searchResultsEl.classList.contains('d-none')) {
        searchResultsEl.classList.add('d-none');
      }

      data.forEach((item) => {
        const liItem = document.createElement('li');
        liItem.classList.add('search-results-item');
        const btItem = document.createElement('button');
        btItem.classList.add(
          'btn',
          'btn-link',
          'p-0',
          'align-middle',
          'mm-search-result-bt'
        );
        btItem.dataset.note = item.id;
        const spanCat = document.createElement('span');
        spanCat.classList.add('search-result-item-cat-text');
        const spanTitle = document.createElement('span');
        spanTitle.classList.add('search-result-item-title-text');
        spanCat.textContent = item.category_name.name;
        spanTitle.textContent = item.title;
        btItem.appendChild(spanTitle);
        liItem.appendChild(spanCat);
        liItem.appendChild(btItem);

        document.querySelector('#search-results-ul').appendChild(liItem);
      });
      // searchResultsEl.appendChild(ul);
    }
  } else if (searchTerm.length < 2) {
    if (!searchResultsEl.classList.contains('d-none')) {
      searchResultsEl.classList.add('d-none');
    }
  }
};

// function to populate fields for adding a new note

export function addNewNote() {
  insertLoading(noteContentCol);

  // noteHeader.classList.toggle('d-none');
  // newNoteHeader.classList.toggle('d-none');

  noteHeader.innerHTML = '';

  const btExpandCategory = document.createElement('button');
  btExpandCategory.type = 'button';
  btExpandCategory.id = 'btexpandcategory';
  btExpandCategory.classList.add(
    'btn',
    'btn-link',
    'p-0',
    'mr-2',
    'align-middle'
  );
  btExpandCategory.dataset.toggle = 'tooltip';
  btExpandCategory.title = 'Please select a category';

  const btExpandCategoryIcon = document.createElement('i');
  btExpandCategoryIcon.classList.add('fas', 'fa-file-alt', 'align-middle');

  const btExpandCategorySpan = document.createElement('span');
  btExpandCategorySpan.id = 'newnotecategorytext';
  btExpandCategorySpan.classList.add('align-middle', 'ml-1');
  btExpandCategorySpan.dataset.selectedcat = '';
  btExpandCategorySpan.textContent = 'Choose category...';

  const btExpandCategoryChevronIcon = document.createElement('i');
  btExpandCategoryChevronIcon.classList.add(
    'fas',
    'fa-chevron-down',
    'align-middle',
    'ml-1'
  );

  btExpandCategory.appendChild(btExpandCategoryIcon);
  btExpandCategory.appendChild(btExpandCategorySpan);
  btExpandCategory.appendChild(btExpandCategoryChevronIcon);

  const categoryPopOverDiv = document.createElement('div');
  categoryPopOverDiv.classList.add('d-none');
  categoryPopOverDiv.id = 'categoryPopOver';

  const categoryPopOverDivArrow = document.createElement('div');
  categoryPopOverDivArrow.classList.add('arrow');
  categoryPopOverDivArrow.setAttribute('style', 'left: 89px;');

  const categoryPopOverDivEmpty = document.createElement('div');

  const nwNoteCategoriesSearch = document.createElement('input');
  nwNoteCategoriesSearch.type = 'text';
  nwNoteCategoriesSearch.id = 'nwNoteCategoriesSearch';
  nwNoteCategoriesSearch.placeholder = 'Search for a category';
  nwNoteCategoriesSearch.autocomplete = 'off';

  const nwNoteCategoriesListDiv = document.createElement('div');
  nwNoteCategoriesListDiv.id = 'nwNoteCategoriesListDiv';

  categoryPopOverDivEmpty.appendChild(nwNoteCategoriesSearch);
  categoryPopOverDivEmpty.appendChild(nwNoteCategoriesListDiv);

  categoryPopOverDiv.appendChild(categoryPopOverDivArrow);
  categoryPopOverDiv.appendChild(categoryPopOverDivEmpty);

  const tagsIcon = document.createElement('i');
  tagsIcon.classList.add('fas', 'fa-tags', 'align-middle', 'ml-1');

  const newNoteTagsInput = document.createElement('input');
  newNoteTagsInput.id = 'newnotetags';
  newNoteTagsInput.name = 'tags';
  newNoteTagsInput.type = 'search';
  newNoteTagsInput.dataset.role = 'tagsinput';
  newNoteTagsInput.placeholder = 'Tags here';
  newNoteTagsInput.autocomplete = 'off';
  newNoteTagsInput.dataset.lpignore = 'true';

  noteHeader.appendChild(btExpandCategory);
  noteHeader.appendChild(categoryPopOverDiv);
  noteHeader.appendChild(tagsIcon);
  noteHeader.appendChild(newNoteTagsInput);

  noteContentCol.innerHTML = '';

  const noteTitleInput = document.createElement('input');
  const noteTextArea = document.createElement('textarea');

  noteTextArea.id = 'notecontenttextarea';

  noteTitleInput.setAttribute('placeholder', 'Note Title here');
  noteTitleInput.id = 'notetitleinput';
  noteTitleInput.autocomplete = 'off';

  noteContentCol.appendChild(noteTitleInput);
  noteContentCol.appendChild(noteTextArea);
  noteTitleInput.classList.add('mm-notetitleinput');
  noteTitleInput.required = true;
  // data-toggle="tooltip" title="Disabled tooltip"
  noteTitleInput.dataset.toggle = 'tooltip';
  noteTitleInput.setAttribute('title', 'Please type in the note title');

  noteTextArea.classList.add('mm-notetextarea');
  noteContentRow.classList.add('h-100');

  noteControlIcons.innerHTML = '';
  const buttonAddImageIcon = document.createElement('button');
  const buttonSaveIcon = document.createElement('button');

  buttonAddImageIcon.id = 'buttonaddimage';
  buttonSaveIcon.id = 'buttonsaveicon';

  buttonAddImageIcon.type = 'button';

  buttonSaveIcon.setAttribute('type', 'submit');
  //     buttonSaveIcon.setAttribute("type", "button");
  buttonSaveIcon.classList.add(
    'btn',
    'btn-dark',
    'btn-xs',
    'p-0',
    'mm-savebutton'
  );
  buttonAddImageIcon.classList.add(
    'btn',
    'btn-dark',
    'btn-xs',
    'p-0',
    'mm-imagebutton',
    'mr-3'
  );

  const noteSaveIcon = document.createElement('i');
  const addImageIcon = document.createElement('i');

  noteSaveIcon.classList.add('fas', 'fa-save', 'align-middle', 'mm-saveicon');
  addImageIcon.classList.add(
    'fas',
    'fa-image',
    'align-middle',
    'mm-addimageicon'
  );

  const buttonSaveText = document.createElement('span');
  buttonSaveText.classList.add('mm-saveicontext');
  buttonSaveText.textContent = 'save';

  const buttonAddImageText = document.createElement('span');
  buttonAddImageText.classList.add('mm-addimageicontext');
  buttonAddImageText.textContent = 'Image';

  buttonSaveIcon.appendChild(noteSaveIcon);
  buttonSaveIcon.appendChild(buttonSaveText);

  buttonAddImageIcon.appendChild(addImageIcon);

  noteControlIcons.appendChild(buttonAddImageIcon);
  noteControlIcons.appendChild(buttonSaveIcon);

  $('#newnotetags').tagsinput('refresh');

  // noteCategoryText.textContent = "Choose category...";

  // display existing categories
  showCategoriesListPopover();
  if (noteContentDiv.classList.contains('mm-homepagebg')) {
    noteContentDiv.classList.remove('mm-homepagebg');
  }
}

export const runOnPageLoad = async () => {
  listFavorites();
  listCategories();
  listNotesByCat({ catId: 'all' });
  const latestNoteId = await listRecentNotes();
  showNote(latestNoteId);
  getUserProfilePicture();
  return latestNoteId;
};

export const handlePageLoadPostNoteRemoval = async (
  selectedCatIdOnNoteRemoval
) => {
  listFavorites();
  listNotesByCat({ catId: selectedCatIdOnNoteRemoval });
  const latestNoteId = await listRecentNotes();
  showNote(latestNoteId);
};

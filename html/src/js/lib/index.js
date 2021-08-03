import { getCookie, validFileType, insertAtCaret, wait } from './utils.js';
import {
  stackingCategoryPopover,
  profileModal,
  imageUploadInput,
} from './elements.js';

// const apiUrl = 'http://localhost:1234/api';
export const apiUrl = 'https://mimir.metabravo.com/api';

// This is our index.js file with all our functions (fetches)

// function to send credentials upon login

export async function sendCredentials(
  inputEmail,
  inputPassword,
  gRecaptchaResponse
) {
  const response = await fetch(`${apiUrl}/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      email: inputEmail,
      password: inputPassword,
      grecaptcharesponse: gRecaptchaResponse,
    }),
  });
  const data = await response.json();
  return data;
}

// function to refresh the access token

export async function refreshAccessToken() {
  const response = await fetch(`${apiUrl}/token/refresh`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'X-CSRF-TOKEN': getCookie('csrf_refresh_token'),
    },
  });
  const data = await response.json();
  return data;
}

// handler (?) to get the access token

export async function getAccessToken() {
  const { msg } = await refreshAccessToken();
  return msg;
}

// function for logging out and killing the access token:

export const logoutAccessToken = async () => {
  const logout = await fetch(`${apiUrl}/logout/access`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    credentials: 'same-origin',
  }).then((res) => res.json());

  return logout;
};

// function for logging out and killing the refresh token

export const logoutRefreshToken = async () => {
  // csrf_refresh_token: ${getCookie('csrf_refresh_token')
  const logout = await fetch(`${apiUrl}/logout/refresh`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': getCookie('csrf_refresh_token'),
    },
    credentials: 'same-origin',
  }).then((res) => res.json());
  return logout;
};

// function to submit sign up form

export async function sendSignupForm(name, email, pwd, gRecaptchaResponse) {
  const response = await fetch(`${apiUrl}/registration`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      email,
      password: pwd,
      grecaptcharesponse: gRecaptchaResponse,
    }),
  }).then((res) => res.json());
  return response;
}

// function to fetch categories to use in multiple parts

export async function fetchCategories() {
  const categories = await fetch(`${apiUrl}/categories`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    credentials: 'same-origin',
  }).then((res) => res.json());
  return categories;
}

// function to create categories

export const createCategory = async (name) => {
  const body = JSON.stringify({ name });

  const category = await fetch(`${apiUrl}/category`, {
    method: 'POST',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body,
    credentials: 'same-origin',
  }).then((res) => res.json());
};

// function to create notes

export const createNote = async () => {
  // setting up title, category and content

  const title = document.querySelector('#notetitleinput');
  const categoryId = document.querySelector('#newnotecategorytext').dataset
    .selectedcat;
  const content = document.querySelector('#notecontenttextarea').value;
  // validating the fields:

  let validFormInputs = true;

  if (title.checkValidity() == false) {
    // $('#notetitleinput').tooltip('enable');
    // $('#notetitleinput').tooltip('toggle');
    // wait(2000).then(()=>{
    //    $('#notetitleinput').tooltip('toggle');
    //    $('#notetitleinput').tooltip('disable');
    // })
    validFormInputs = false;
  }

  if (categoryId == '') {
    validFormInputs = false;
    $('#btexpandcategory').tooltip('enable');
    $('#btexpandcategory').tooltip('toggle');
    wait(2000).then(() => {
      $('#btexpandcategory').tooltip('toggle');
      $('#btexpandcategory').tooltip('disable');
    });
  }

  // if no validation errors occured, go ahead and post note
  if (validFormInputs != false) {
    // tags array
    const tagsList = [];

    // populating tags array
    $('#newnotetags')
      .tagsinput('items')
      .map((tag) => {
        const tags = {};
        tags.name = tag;
        tagsList.push(tags);
      });

    // forming json object to POST
    const body = JSON.stringify({
      title: title.value,
      category_id: categoryId,
      tags: tagsList,
      content,
    });

    const note = await fetch(`${apiUrl}/note`, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body,
      credentials: 'same-origin',
    }).then((res) => res.json());
    return note;
  }
};

// function to edit note (PUT):

export const editNote = async (noteid) => {
  // setting up title, category and content

  const title = document.querySelector('#notetitleinput');
  const categoryId = document.querySelector('#newnotecategorytext').dataset
    .selectedcat;
  const { favorite } = document.querySelector('#buttoneditfavicon').dataset;
  const content = document.querySelector('#notecontenttextarea').value;
  // validating the fields:

  let validFormInputs = true;

  if (title.checkValidity() == false) {
    // $('#notetitleinput').tooltip('enable');
    // $('#notetitleinput').tooltip('toggle');
    // wait(2000).then(()=>{
    //    $('#notetitleinput').tooltip('toggle');
    //    $('#notetitleinput').tooltip('disable');
    // })
    validFormInputs = false;
  }

  if (categoryId == '') {
    // alert('eiiiitaaa');
    validFormInputs = false;
    $('#btexpandcategory').tooltip('enable');
    $('#btexpandcategory').tooltip('toggle');
    wait(2000).then(() => {
      $('#btexpandcategory').tooltip('toggle');
      $('#btexpandcategory').tooltip('disable');
    });
  }

  // if no validation errors occured, go ahead and post note
  if (validFormInputs != false) {
    // tags array
    const tagsList = [];

    // populating tags array
    $('#notetagsinput')
      .tagsinput('items')
      .map((tag) => {
        const tags = {};
        tags.name = tag;
        tagsList.push(tags);
      });

    // forming json object to POST
    const body = JSON.stringify({
      id: noteid,
      title: title.value,
      category_id: categoryId,
      favorite,
      tags: tagsList,
      content,
    });

    const note = await fetch(`${apiUrl}/note`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getAccessToken()}`,
      },
      body,
      credentials: 'same-origin',
    }).then((res) => res.json());
    return note;
  }
};

// function to upload images

export const uploadImage = async () => {
  const curFiles = imageUploadInput.files;

  if (curFiles.length === 0) {
    alert('No files currently selected for upload');
  } else {
    const image = curFiles[0];

    if (validFileType(image)) {
      // creating the FormData():
      const formData = new FormData();
      // appending our image to FormData:
      formData.append('file', image);
      const newImage = await fetch(`${apiUrl}/image`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: formData,
      }).then((res) => res.json());

      const { status, data } = newImage;

      if (status == 'success') {
        let imageURL = data;
        // id for the textarea: notecontenttextarea
        // ![description](path/filename.jpg)
        imageURL = imageURL.replace('static', 'api/static');
        const markdownImage = `![${image.name}](${imageURL})`;
        insertAtCaret('#notecontenttextarea', markdownImage);
        $('#uploadImgModal').modal('hide');
        // alert('inserted');
      }
    } else {
      alert(
        'This not a valid file type, please submit an image (jpg, png, etc'
      );
    }
  }
};

// function to fetch a note

export const fetchNote = async (noteId) => {
  const note = await fetch(`${apiUrl}/note?id=${noteId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    // body,
    credentials: 'same-origin',
  }).then((res) => res.json());
  return note;
};

// function to fetch notes by category

export const fetchNotesByCat = async (catId) => {
  const notes = await fetch(`${apiUrl}/notes?catid=${catId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    // body,
    credentials: 'same-origin',
  }).then((res) => res.json());
  return notes;
};

// function to make note a favorite:

export const toggleFavorite = async (id, favorite) => {
  // forming json object to PATCH favorite
  const body = JSON.stringify({
    id,
    favorite,
  });

  const favoriteResponse = await fetch(`${apiUrl}/note`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body,
    credentials: 'same-origin',
  }).then((res) => res.json());
  return favoriteResponse;
};

// function to fetch all favorites

export const fetchFavorites = async () => {
  const favNotes = await fetch(`${apiUrl}/notes/fav`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    // body,
    credentials: 'same-origin',
  }).then((res) => res.json());
  return favNotes;
};

// function to patch data into category item

export const patchCategory = async (type, value, catid) => {
  // forming json object to PATCH
  const body = JSON.stringify({
    id: catid,
    [type]: value,
  });

  const response = await fetch(`${apiUrl}/category`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body,
    credentials: 'same-origin',
  }).then((res) => res.json());
  return response;
};

// function to delete category

export const deleteCategory = async (catId) => {
  // forming json object to DELETE
  const body = JSON.stringify({
    id: catId,
  });

  const response = await fetch(`${apiUrl}/category`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body,
    credentials: 'same-origin',
  }).then((res) => res.json());
  return response;
};

// function to delete note

export const deleteNote = async (noteid) => {
  // forming json object to DELETE
  const body = JSON.stringify({
    id: noteid,
  });

  const response = await fetch(`${apiUrl}/note`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body,
    credentials: 'same-origin',
  }).then((res) => res.json());
  return response;
};

// function to fetch/list latest 5 notes:

export const fetchRecentNotes = async () => {
  const latestNotes = await fetch(`${apiUrl}/notes/latest`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    // body,
    credentials: 'same-origin',
  }).then((res) => res.json());
  return latestNotes;
};

// function to fetch profile data:

export const fetchProfileData = async () => {
  const response = await fetch(`${apiUrl}/user/profile`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
  }).then((res) => res.json());
  return response;
};

// function to patch profile

export const patchProfile = async (type, value) => {
  const body = JSON.stringify({
    [type]: value,
  });

  const response = await fetch(`${apiUrl}/user/profile`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body,
    credentials: 'same-origin',
  }).then((res) => res.json());

  return response;
};

// function to post password change

export const postPasswdChange = async (inputCurrPwd, inputNewPwd) => {
  const body = JSON.stringify({
    currpwd: inputCurrPwd,
    newpwd: inputNewPwd,
  });
  const change = await fetch(`${apiUrl}/user/changepwd`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    body,
    credentials: 'same-origin',
  }).then((res) => res.json());
  return change;
};

// function to upload profile picutre

export const handleUploadProfilePic = async () => {
  const profilePicUploadInput = document.querySelector('#input-pictureupload');
  const curFiles = profilePicUploadInput.files;
  const btEditCancel = document.querySelector('#bt-canceleditpicture');

  if (curFiles.length === 0) {
    alert('No files currently selected for upload');
  } else {
    const image = curFiles[0];

    if (validFileType(image)) {
      // creating the FormData():
      const formData = new FormData();
      // appending our image to FormData:
      formData.append('file', image);
      const newImage = await fetch(`${apiUrl}/image`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: formData,
      }).then((res) => res.json());

      const { status, data } = newImage;

      if (status === 'success') {
        let imageURL = data;
        // id for the textarea: notecontenttextarea
        // ![description](path/filename.jpg)
        imageURL = imageURL.replace('static', 'api/static');
        const profileImage = `${imageURL}`;
        const responseUpload = await patchProfile('picture', profileImage);
        if (responseUpload.status === 'success') {
          profileModal.dispatchEvent(new CustomEvent('profilePicChanged'));
        }
      }
    } else {
      const spanStatus = document.createElement('span');
      spanStatus.style.color = 'tomato';
      spanStatus.textContent =
        'This not a valid file type, please submit an image (jpg, png, etc)';
      btEditCancel.insertAdjacentElement('afterend', spanStatus);
    }
  }
};

// function for searching

export const searchNote = async (searchTerm) => {
  const result = await fetch(`${apiUrl}/notes/search?search=${searchTerm}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    credentials: 'same-origin',
  }).then((res) => res.json());
  return result;
};

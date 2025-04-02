import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import * as url from "../url_helper";
import { accessToken, nodeApiToken } from "../jwt-token-access/accessToken";

import {
  calenderDefaultCategories,
  events,
  defaultevent,
  todoTaskList,
  todoCollapse,
  apiKey,
  allTask,
} from "../../common/data";

import { ROLES } from "common/data/Constants";

let users = [
  {
    uid: 1,
    username: "admin",
    role: "admin",
    password: "123456",
    email: "admin@orionik.com",
  }
];

const fakeBackend = () => {
  // This sets the mock adapter on the default instance
  const mock = new MockAdapter(axios, { onNoMatch: "passthrough" });

  mock.onPost("/post-jwt-register").reply((config: any) => {
    const user = JSON.parse(config["data"]);
    users.push(user);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([200, user]);
      });
    });
  });

  mock.onPost("/post-jwt-login").reply((config: any) => {
    const user = JSON.parse(config["data"]);
    const validUser = users.filter(
      usr => usr.email === user.email && usr.password === user.password
    );

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (validUser["length"] === 1) {
          // You have to generate AccessToken by jwt. but this is fakeBackend so, right now its dummy
          const token = accessToken;

          // JWT AccessToken
          const tokenObj = { accessToken: token }; // Token Obj
          const validUserObj = { ...validUser[0], ...tokenObj }; // validUser Obj

          resolve([200, validUserObj]);
        } else {
          reject([
            400,
            "Username and password are invalid. Please enter correct username and password",
          ]);
        }
      });
    });
  });

  mock.onPost("/post-jwt-profile").reply((config: any) => {
    const user = JSON.parse(config["data"]);

    const one = config.headers;

    let finalToken = one.Authorization;

    const validUser = users.filter(usr => usr.uid === user.idx);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Verify Jwt token from header.Authorization
        if (finalToken === accessToken) {
          if (validUser["length"] === 1) {
            let objIndex;

            //Find index of specific object using findIndex method.
            objIndex = users.findIndex(obj => obj.uid === user.idx);

            //Update object's name property.
            users[objIndex].username = user.username;

            // Assign a value to locastorage
            localStorage.removeItem("authUser");
            localStorage.setItem("authUser", JSON.stringify(users[objIndex]));

            resolve([200, "Profile Updated Successfully"]);
          } else {
            reject([400, "Something wrong for edit profile"]);
          }
        } else {
          reject([400, "Invalid Token !!"]);
        }
      });
    });
  });

  mock.onPost("/social-login").reply((config: any) => {
    const user = JSON.parse(config["data"]);
    return new Promise((resolve, reject) => {

      setTimeout(() => {
        if (user && user.token) {
          // You have to generate AccessToken by jwt. but this is fakeBackend so, right now its dummy
          const token = accessToken;
          const first_name = user.name;
          const nodeapiToken = nodeApiToken;
          delete user.name;

          // JWT AccessToken
          const tokenObj = { accessToken: token, first_name: first_name }; // Token Obj
          const validUserObj = { token: nodeapiToken, "data": { ...tokenObj, ...user } }; // validUser Obj
          resolve([200, validUserObj]);
        } else {
          reject([
            400,
            "Username and password are invalid. Please enter correct username and password",
          ]);
        }
      });
    });
  });

  // Calendar
  mock.onGet(url.GET_EVENTS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (events) {
          // Passing fake JSON data as response
          const data = [...events, ...defaultevent];
          resolve([200, data]);
        } else {
          reject([400, "Cannot get events"]);
        }
      });
    });
  });

  mock.onGet(url.GET_CATEGORIES).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (calenderDefaultCategories) {
          // Passing fake JSON data as response
          resolve([200, calenderDefaultCategories]);
        } else {
          reject([400, "Cannot get categories"]);
        }
      });
    });
  });

  mock.onGet(url.GET_UPCOMMINGEVENT).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (defaultevent) {
          const data = [...defaultevent, ...events];
          // Passing fake JSON data as response
          resolve([200, data]);
        } else {
          reject([400, "Cannot get upcomming events"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_NEW_EVENT).reply((event) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (event && event.data) {
          // Passing fake JSON data as response
          resolve([200, event.data]);
        } else {
          reject([400, "Cannot add event"]);
        }
      });
    });
  });

  // crm companies
  mock.onPut(url.UPDATE_EVENT).reply((event) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (event && event.data) {
          // Passing fake JSON data as response
          resolve([200, event.data]);
        } else {
          reject([400, "Cannot update event"]);
        }
      });
    });
  });

  mock.onDelete(url.DELETE_EVENT).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.event]);
        } else {
          reject([400, "Cannot delete event"]);
        }
      });
    });
  });

  // Crypto > Transaction
  
  // Crypto > Orders

  // Dashboard Job
  // Applications Statistic
  mock.onPost(url.ADD_NEW_PROJECT).reply((project) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (project && project.data) {
          // Passing fake JSON data as response
          resolve([200, project.data]);
        } else {
          reject([400, "Cannot add project"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_PROJECT).reply((project) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (project && project.data) {
          // Passing fake JSON data as response
          resolve([200, project.data]);
        } else {
          reject([400, "Cannot update project"]);
        }
      });
    });
  });

  mock.onDelete(url.DELETE_PROJECT).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.project]);
        } else {
          reject([400, "Cannot delete event"]);
        }
      });
    });
  });


  mock.onDelete(url.DELETE_TEAMDATA).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.team]);
        } else {
          reject([400, "Cannot delete team data"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_NEW_TEAMDATA).reply((team) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (team && team.data) {
          // Passing fake JSON data as response
          resolve([200, team.data]);
        } else {
          reject([400, "Cannot add team data"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_TEAMDATA).reply((team) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (team && team.data) {
          // Passing fake JSON data as response
          resolve([200, team.data]);
        } else {
          reject([400, "Cannot update team data"]);
        }
      });
    });
  });

  mock.onDelete(url.DELETE_CUSTOMER).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.file]);
        } else {
          reject([400, "Cannot delete file data"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_NEW_CUSTOMER).reply((file) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (file && file.data) {
          // Passing fake JSON data as response
          resolve([200, file.data]);
        } else {
          reject([400, "Cannot add file data"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_CUSTOMER).reply((file) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (file && file.data) {
          // Passing fake JSON data as response
          resolve([200, file.data]);
        } else {
          reject([400, "Cannot update file data"]);
        }
      });
    });
  });

  mock.onPatch(url.UPDATE_CUSTOMER).reply((event: any) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (event && event.data) {
          // Passing fake JSON data as response
          resolve([200, event.data]);
        } else {
          reject([400, "Cannot update event"]);
        }
      });
    });
  }); 
  //  Tasks List
  mock.onGet(url.GET_TASK_LIST).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (allTask) {
          // Passing fake JSON data as response
          resolve([200, allTask]);
        } else {
          reject([400, "Cannot get file data"]);
        }
      });
    });
  });

  mock.onDelete(url.DELETE_TASK).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.file]);
        } else {
          reject([400, "Cannot delete file data"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_NEW_TASK).reply((file) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (file && file.data) {
          // Passing fake JSON data as response
          resolve([200, file.data]);
        } else {
          reject([400, "Cannot add file data"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_TASK).reply((file) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (file && file.data) {
          // Passing fake JSON data as response
          resolve([200, file.data]);
        } else {
          reject([400, "Cannot update file data"]);
        }
      });
    });
  });

  mock.onPatch(url.UPDATE_TASK).reply((event: any) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (event && event.data) {
          // Passing fake JSON data as response
          resolve([200, event.data]);
        } else {
          reject([400, "Cannot update event"]);
        }
      });
    });
  }); 

  
   // candidate list
  
  mock.onDelete(url.DELETE_CANDIDATE).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.file]);
        } else {
          reject([400, "Cannot delete file data"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_NEW_CANDIDATE).reply((file) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (file && file.data) {
          // Passing fake JSON data as response
          resolve([200, file.data]);
        } else {
          reject([400, "Cannot add file data"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_CANDIDATE).reply((file) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (file && file.data) {
          // Passing fake JSON data as response
          resolve([200, file.data]);
        } else {
          reject([400, "Cannot update file data"]);
        }
      });
    });
  });

  // Grid

  mock.onPost(url.ADD_CANDIDATE_GRID).reply((file) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (file && file.data) {
          // Passing fake JSON data as response
          resolve([200, file.data]);
        } else {
          reject([400, "Cannot add file data"]);
        }
      });
    });
  });

  // category
 
  mock.onPost(url.ADD_CATEGORY_LIST).reply((project) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (project && project.data) {
          // Passing fake JSON data as response
          resolve([200, project.data]);
        } else {
          reject([400, "Cannot add Project data"]);
        }
      });
    });
  });

  // Folder
 
  mock.onDelete(url.DELETE_FOLDER).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.folder]);
        } else {
          reject([400, "Cannot delete folder data"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_NEW_FOLDER).reply((folder) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (folder && folder.data) {
          // Passing fake JSON data as response
          resolve([200, folder.data]);
        } else {
          reject([400, "Cannot add folder data"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_FOLDER).reply((folder) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (folder && folder.data) {
          // Passing fake JSON data as response
          resolve([200, folder.data]);
        } else {
          reject([400, "Cannot update folder data"]);
        }
      });
    });
  });

  // File
 
  mock.onDelete(url.DELETE_FILE).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.file]);
        } else {
          reject([400, "Cannot delete file data"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_NEW_FILE).reply((file) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (file && file.data) {
          // Passing fake JSON data as response
          resolve([200, file.data]);
        } else {
          reject([400, "Cannot add file data"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_FILE).reply((file) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (file && file.data) {
          // Passing fake JSON data as response
          resolve([200, file.data]);
        } else {
          reject([400, "Cannot update file data"]);
        }
      });
    });
  });

  // To do
  mock.onGet(url.GET_TODOS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (todoTaskList) {
          // Passing fake JSON data as response
          resolve([200, todoTaskList]);
        } else {
          reject([400, "Cannot get To do data"]);
        }
      });
    });
  });

  mock.onDelete(url.DELETE_TODO).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.todo]);
        } else {
          reject([400, "Cannot delete To do data"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_NEW_TODO).reply((todo) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (todo && todo.data) {
          // Passing fake JSON data as response
          resolve([200, todo.data]);
        } else {
          reject([400, "Cannot add To do data"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_TODO).reply((todo) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (todo && todo.data) {
          // Passing fake JSON data as response
          resolve([200, todo.data]);
        } else {
          reject([400, "Cannot update To do data"]);
        }
      });
    });
  });

  mock.onGet(url.GET_PROJECTS).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (todoCollapse) {
          // Passing fake JSON data as response
          resolve([200, todoCollapse]);
        } else {
          reject([400, "Cannot get Project data"]);
        }
      });
    });
  });

  mock.onPost(url.ADD_NEW_TODO_PROJECT).reply((project) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (project && project.data) {
          // Passing fake JSON data as response
          resolve([200, project.data]);
        } else {
          reject([400, "Cannot add Project data"]);
        }
      });
    });
  });

  //JOBS
  
  mock.onPost(url.ADD_NEW_APPLICATION_LIST).reply((job) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (job && job.data) {
          // Passing fake JSON data as response
          resolve([200, job.data]);
        } else {
          reject([400, "Cannot add Job Application data"]);
        }
      });
    });
  });

  mock.onPut(url.UPDATE_APPLICATION_LIST).reply((job) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (job && job.data) {
          // Passing fake JSON data as response
          resolve([200, job.data]);
        } else {
          reject([400, "Cannot update Job Application data"]);
        }
      });
    });
  });

  mock.onDelete(url.DELETE_APPLICATION_LIST).reply((config) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config && config.headers) {
          // Passing fake JSON data as response
          resolve([200, config.headers.job]);
        } else {
          reject([400, "Cannot delete Job Application data"]);
        }
      });
    });
  });

  //API Key
  mock.onGet(url.GET_API_KEY).reply(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (apiKey) {
          // Passing fake JSON data as response
          resolve([200, apiKey]);
        } else {
          reject([400, "Cannot get API Key Data"]);
        }
      });
    });
  });

};

export default fakeBackend;